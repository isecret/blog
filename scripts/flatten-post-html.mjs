import {
    copyFileSync,
    existsSync,
    mkdirSync,
    readFileSync,
    readdirSync,
    renameSync,
    rmSync,
    writeFileSync
} from 'node:fs';
import { join } from 'node:path';

const distDir = 'dist';
const htmlAssetDir = join(distDir, '__html');

if (!existsSync(distDir)) {
    process.exit(0);
}

let flattened = 0;

for (const entry of readdirSync(distDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.endsWith('.html')) continue;

    const routeDir = join(distDir, entry.name);
    const indexFile = join(routeDir, 'index.html');
    const tmpFile = join(distDir, `${entry.name}.tmp`);
    const targetFile = join(distDir, entry.name);

    if (!existsSync(indexFile)) continue;

    renameSync(indexFile, tmpFile);
    rmSync(routeDir, { recursive: true, force: true });
    renameSync(tmpFile, targetFile);
    flattened += 1;
}

console.log(`Flattened ${flattened} .html article routes.`);

rmSync(htmlAssetDir, { recursive: true, force: true });
mkdirSync(htmlAssetDir, { recursive: true });

let mirrored = 0;

for (const entry of readdirSync(distDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    if (entry.name === 'index.html' || entry.name === '404.html') continue;

    const routeName = entry.name.slice(0, -'.html'.length);
    const routeDir = join(htmlAssetDir, routeName);

    mkdirSync(routeDir, { recursive: true });
    copyFileSync(join(distDir, entry.name), join(routeDir, 'index.html'));
    mirrored += 1;
}

console.log(`Mirrored ${mirrored} .html article routes for Cloudflare Pages.`);

for (const entry of readdirSync(distDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.startsWith('sitemap')) continue;
    if (!entry.name.endsWith('.xml')) continue;

    const sitemapPath = join(distDir, entry.name);
    const xml = readFileSync(sitemapPath, 'utf8');
    writeFileSync(sitemapPath, xml.replaceAll('.html/</loc>', '.html</loc>'));
}
