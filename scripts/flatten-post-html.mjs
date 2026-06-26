import { existsSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const distDir = 'dist';

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

for (const entry of readdirSync(distDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.startsWith('sitemap')) continue;
    if (!entry.name.endsWith('.xml')) continue;

    const sitemapPath = join(distDir, entry.name);
    const xml = readFileSync(sitemapPath, 'utf8');
    writeFileSync(sitemapPath, xml.replaceAll('.html/</loc>', '.html</loc>'));
}
