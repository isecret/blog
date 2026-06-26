import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import siteConfig from './src/data/site-config';

// https://astro.build/config
export default defineConfig({
    site: siteConfig.website,
    markdown: {
        shikiConfig: {
            theme: 'github-light'
        }
    },
    adapter: cloudflare({
        imageService: 'compile'
    }),
    integrations: [mdx(), sitemap()]
});
