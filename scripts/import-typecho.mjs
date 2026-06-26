import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dbPath = 'typecho.db';
const blogDir = 'src/content/blog';
const pagesDir = 'src/content/pages';
const fallbackDescription = 'Create more bugs.';

function query(sql) {
    const output = execFileSync('sqlite3', ['-json', dbPath, sql], {
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 * 20
    }).trim();
    return output ? JSON.parse(output) : [];
}

function decodeHtml(value = '') {
    return String(value)
        .replaceAll('&amp;', '&')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .replaceAll('&quot;', '"')
        .replaceAll('&#039;', "'")
        .replaceAll('&apos;', "'");
}

function normalizeCodeFenceLanguages(value) {
    const languages = new Map([
        ['Python', 'python'],
        ['Shell', 'shell'],
        ['conf', 'ini']
    ]);

    return value.replace(/^```([^\s`]+)\s*$/gm, (_, lang) => `\`\`\`${languages.get(lang) ?? lang}`);
}

function cleanBody(value = '') {
    return normalizeCodeFenceLanguages(decodeHtml(value).replace(/^<!--markdown-->\s*/, '').trim());
}

function yamlString(value) {
    return JSON.stringify(decodeHtml(value ?? ''));
}

function yamlArray(values) {
    return `[${values.map(yamlString).join(', ')}]`;
}

function isoFromUnix(value) {
    return new Date(Number(value) * 1000).toISOString();
}

function stripMarkdown(value) {
    return value
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
        .replace(/!\[[^\]]*\]\[[^\]]*\]/g, ' ')
        .replace(/\[[^\]]+\]\([^)]*\)/g, (match) => match.replace(/^\[|\]\([^)]*\)$/g, ''))
        .replace(/^\s{0,3}\[[^\]]+\]:\s+\S+.*$/gm, ' ')
        .replace(/[#>*_`~|\-]+/g, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function descriptionFromBody(body) {
    const text = stripMarkdown(body);
    return text ? Array.from(text).slice(0, 120).join('') : fallbackDescription;
}

function fileSlug(entry) {
    const slug = String(entry.slug || '').trim();
    return slug || String(entry.cid);
}

function frontmatter(fields) {
    const lines = ['---'];
    for (const [key, value] of Object.entries(fields)) {
        if (value === undefined || value === null) continue;
        lines.push(`${key}: ${value}`);
    }
    lines.push('---', '');
    return lines.join('\n');
}

const posts = query(`
  select cid,title,slug,created,modified,text
  from typecho_contents
  where type='post' and status='publish'
  order by created desc, cid desc
`);

const pages = query(`
  select cid,title,slug,created,modified,text
  from typecho_contents
  where type='page' and status='publish'
  order by "order" asc, created asc, cid asc
`);

const metaRows = query(`
  select r.cid,m.name,m.type
  from typecho_relationships r
  join typecho_metas m on r.mid=m.mid
  order by m.type,m.name
`);

const metasByCid = new Map();
for (const row of metaRows) {
    const list = metasByCid.get(row.cid) ?? [];
    list.push(row);
    metasByCid.set(row.cid, list);
}

rmSync(blogDir, { recursive: true, force: true });
rmSync(pagesDir, { recursive: true, force: true });
rmSync('src/content/projects', { recursive: true, force: true });
mkdirSync(blogDir, { recursive: true });
mkdirSync(pagesDir, { recursive: true });

for (const post of posts) {
    const body = cleanBody(post.text);
    const description = descriptionFromBody(body);
    const tags = [...new Set((metasByCid.get(post.cid) ?? []).map((meta) => decodeHtml(meta.name)))];
    const updatedDate = post.modified && post.modified !== post.created ? isoFromUnix(post.modified) : undefined;

    const fields = {
        title: yamlString(post.title),
        excerpt: yamlString(description),
        publishDate: isoFromUnix(post.created),
        updatedDate,
        isFeatured: 'false',
        tags: yamlArray(tags),
        seo: `\n  description: ${yamlString(description)}\n  pageType: article`
    };

    writeFileSync(join(blogDir, `${fileSlug(post)}.md`), `${frontmatter(fields)}${body}\n`, 'utf8');
}

for (const page of pages) {
    const body = cleanBody(page.text);
    const description = descriptionFromBody(body);
    const fields = {
        title: yamlString(page.title),
        seo: `\n  description: ${yamlString(description)}`
    };

    writeFileSync(join(pagesDir, `${fileSlug(page)}.md`), `${frontmatter(fields)}${body}\n`, 'utf8');
}

console.log(`Imported ${posts.length} posts and ${pages.length} pages from ${dbPath}.`);
