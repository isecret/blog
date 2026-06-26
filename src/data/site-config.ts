import type { SiteConfig } from '../types';

const siteConfig: SiteConfig = {
    website: 'https://blog.wangmao.me',
    title: "WangMao's Blog",
    subtitle: 'Create more bugs.',
    description: 'Create more bugs.',
    image: {
        src: '/favicon.ico',
        alt: "WangMao's Blog"
    },
    headerNavLinks: [
        {
            text: 'Home',
            href: '/'
        },
        {
            text: 'Tags',
            href: '/tags'
        },
        {
            text: 'About',
            href: '/about'
        },
        {
            text: 'Links',
            href: '/links'
        }
    ],
    footerNavLinks: [
        {
            text: 'About',
            href: '/about'
        },
        {
            text: 'Links',
            href: '/links'
        }
    ],
    socialLinks: [],
    subscribe: {
        enabled: false
    },
    comments: {
        waline: {
            enabled: true,
            serverURL: import.meta.env.PUBLIC_WALINE_SERVER_URL,
            lang: 'zh-CN'
        }
    },
    postsPerPage: 12,
    since: 2016
};

export default siteConfig;
