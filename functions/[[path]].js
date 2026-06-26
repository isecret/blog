export async function onRequest(context) {
    const url = new URL(context.request.url);

    if (!url.pathname.endsWith('.html')) {
        return context.next();
    }

    const slug = url.pathname.slice(1, -'.html'.length);

    if (!slug || slug.includes('/')) {
        return context.next();
    }

    const assetUrl = new URL(`/__html/${slug}/`, url.origin);
    const response = await context.env.ASSETS.fetch(new Request(assetUrl, context.request));

    if (response.status === 404) {
        return context.next();
    }

    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'text/html; charset=utf-8');

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}
