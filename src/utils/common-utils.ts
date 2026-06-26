export function slugify(input?: string) {
    if (!input) return '';

    let slug = input.toLowerCase().trim();

    // Remove accents while preserving non-Latin letters such as Chinese tags.
    slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    slug = slug.replace(/[^\p{L}\p{N}\s-]/gu, ' ').trim();

    slug = slug.replace(/[\s-]+/g, '-');

    return slug;
}
