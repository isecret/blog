# WangMao's Blog

Astro blog migrated from Typecho SQLite content and styled after the Hexo theme [Hola](https://github.com/isecret/Hola).

## Features

- Astro content collections for posts and custom pages
- Typecho import script: `npm run import:typecho`
- Root-level article URLs such as `/blur-qr-code-in-image-with-opencv.html`
- RSS and sitemap generation
- Hola-inspired archive layout, typography, colors, and dark-mode variables
- Waline comments on posts and custom pages

## Commands

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Start local dev server |
| `npm run build` | Build production site to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run import:typecho` | Import published posts and pages from `typecho.db` |

## Comments

Waline is enabled for posts and custom pages. Set the Workers deployment URL with:

```bash
PUBLIC_WALINE_SERVER_URL=https://your-waline-worker.example.workers.dev
```

`typecho.db` is intentionally ignored by git.
