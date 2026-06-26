import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const CONTENT_DIRS = ['src/content/blog', 'src/content/pages'];
const OUTPUT_DIR = 'public/images';
const PUBLIC_PREFIX = '/images';
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg']);
const IMAGE_EXTENSION_FALLBACKS = ['.jpg', '.jpeg', '.JPG', '.JPEG', '.png', '.PNG', '.gif', '.GIF', '.webp', '.WEBP'];

const files = await Array.fromAsync(walkContentFiles(CONTENT_DIRS));
const urlToLocalPath = new Map();

await mkdir(OUTPUT_DIR, { recursive: true });

for (const file of files) {
    const original = await readFile(file, 'utf8');
    let updated = original;
    const replacements = [];

    collectMarkdownImages(original, replacements);
    collectImageReferenceDefinitions(original, replacements);
    collectHtmlImageSources(original, replacements);

    for (const { url } of replacements) {
        if (!urlToLocalPath.has(url)) {
            urlToLocalPath.set(url, await downloadImage(url).catch((error) => {
                console.warn(error.message);
                return url;
            }));
        }
        updated = updated.split(url).join(urlToLocalPath.get(url));
    }

    if (updated !== original) {
        await writeFile(file, updated);
        console.log(`updated ${file}`);
    }
}

console.log(`localized ${urlToLocalPath.size} remote image(s)`);

async function* walkContentFiles(dirs) {
    const { readdir } = await import('node:fs/promises');
    for (const dir of dirs) {
        for (const entry of await readdir(dir, { withFileTypes: true })) {
            const entryPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                yield* walkContentFiles([entryPath]);
            } else if (/\.mdx?$/i.test(entry.name)) {
                yield entryPath;
            }
        }
    }
}

function collectMarkdownImages(content, replacements) {
    const imagePattern = /!\[[^\]]*\]\((https?:\/\/[^\s)]+)(?:\s+['"][^'"]*['"])?\)/g;
    for (const match of content.matchAll(imagePattern)) {
        if (shouldLocalizeImage(match[1])) replacements.push({ url: match[1] });
    }
}

function collectImageReferenceDefinitions(content, replacements) {
    const referencePattern = /^\s*\[[^\]]+\]:\s+(https?:\/\/\S+)\s*$/gm;
    for (const match of content.matchAll(referencePattern)) {
        if (shouldLocalizeImage(match[1])) replacements.push({ url: match[1] });
    }
}

function collectHtmlImageSources(content, replacements) {
    const htmlPattern = /<(?:img|embed)\b[^>]*(?:src)=['"](https?:\/\/[^'"]+)['"][^>]*>/gi;
    for (const match of content.matchAll(htmlPattern)) {
        if (shouldLocalizeImage(match[1])) replacements.push({ url: match[1] });
    }
}

function shouldLocalizeImage(value) {
    return isImageUrl(value) && isGithubImageUrl(value);
}

function isImageUrl(value) {
    try {
        const url = new URL(value);
        return IMAGE_EXTENSIONS.has(path.extname(url.pathname).toLowerCase());
    } catch {
        return false;
    }
}

function isGithubImageUrl(value) {
    try {
        const url = new URL(value);
        if (url.hostname === 'cdn.jsdelivr.net') return url.pathname.startsWith('/gh/');
        if (url.hostname === 'raw.githubusercontent.com') return true;
        if (url.hostname === 'mirror.wangmao.me') return url.pathname.startsWith('/https://raw.githubusercontent.com/');
        return false;
    } catch {
        return false;
    }
}

async function downloadImage(url) {
    const { response, finalUrl } = await fetchImageWithFallback(url);

    const buffer = Buffer.from(await response.arrayBuffer());
    const extension = path.extname(new URL(finalUrl).pathname).toLowerCase() || extensionFromContentType(response.headers.get('content-type'));
    const basename = path.basename(new URL(finalUrl).pathname, extension).replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '') || 'image';
    const hash = createHash('sha256').update(url).digest('hex').slice(0, 10);
    const filename = `${basename}-${hash}${extension}`;
    const outputPath = path.join(OUTPUT_DIR, filename);

    await writeFile(outputPath, buffer);
    console.log(`downloaded ${finalUrl} -> ${outputPath}`);
    return `${PUBLIC_PREFIX}/${filename}`;
}

async function fetchImageWithFallback(url) {
    const attempts = [url, ...alternateImageExtensionUrls(url)];
    let lastResponse;

    for (const attempt of attempts) {
        const response = await fetch(attempt, {
            headers: {
                'User-Agent': 'Mozilla/5.0 image-localizer for blog.wangmao.me',
            },
        });
        if (response.ok) return { response, finalUrl: attempt };
        lastResponse = response;
    }

    throw new Error(`Failed to download ${url}: ${lastResponse.status} ${lastResponse.statusText}`);
}

function alternateImageExtensionUrls(value) {
    const url = new URL(value);
    const extension = path.extname(url.pathname);
    if (!extension) return [];

    const basename = url.pathname.slice(0, -extension.length);
    return IMAGE_EXTENSION_FALLBACKS
        .filter((candidate) => candidate !== extension)
        .map((candidate) => {
            const next = new URL(url);
            next.pathname = `${basename}${candidate}`;
            return next.toString();
        });
}

function extensionFromContentType(contentType) {
    const normalized = (contentType || '').split(';')[0].trim().toLowerCase();
    if (normalized === 'image/jpeg') return '.jpg';
    if (normalized === 'image/png') return '.png';
    if (normalized === 'image/gif') return '.gif';
    if (normalized === 'image/webp') return '.webp';
    if (normalized === 'image/bmp') return '.bmp';
    if (normalized === 'image/svg+xml') return '.svg';
    return '.bin';
}
