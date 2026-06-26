import type { CollectionEntry } from 'astro:content';

export function getPostUrl(post: CollectionEntry<'blog'>) {
    return `/${post.id}.html`;
}
