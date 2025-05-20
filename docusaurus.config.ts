const lightCodeTheme = require('prism-react-renderer').themes.github;
const darkCodeTheme = require('prism-react-renderer').themes.vsDark;
import drawioResources from './src/plugins/drawio-resources/index.js';
const generateSidebarSlices = require('./src/_scripts/_viewPointsIndex');
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
    title: 'SAP Architecture Center',
    tagline:
        'SAP Architecture Center empowers architects and developers with best practices, reference architectures, and community-driven guidance for designing, integrating, and optimizing SAP and cloud solutions. Accelerate innovation, ensure security, and reduce costs with proven frameworks and collaborative expertise for enterprise transformation.',
    favicon: 'img/logo.svg',

    url: 'https://architecture.learning.sap.com',
    baseUrl: '/',

    // GitHub pages deployment config.
    organizationName: 'SAP', //GitHub org
    projectName: 'architecture-center', // repo name
    deploymentBranch: 'site',
    trailingSlash: false,

    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'throw',
    onDuplicateRoutes: 'throw',
    onBrokenAnchors: 'warn',
    markdown: {
        mermaid: true,
    },
    themes: ['@docusaurus/theme-mermaid'],
    plugins: [
        './src/plugins/init-ui5-theme',
        [require.resolve('docusaurus-plugin-image-zoom'), {}],
        [
            '@docusaurus/plugin-content-docs',
            {
                id: 'community',
                path: 'community',
                routeBasePath: 'community',
                sidebarPath: require.resolve('./sidebarsCommunity'),
                showLastUpdateTime: true,
                showLastUpdateAuthor: true,
                onInlineTags: 'warn',
                editUrl: 'https://github.com/SAP/architecture-center/edit/dev/',
            },
        ],
        [
            require.resolve('@easyops-cn/docusaurus-search-local'),
            {
                hashed: true,
                indexDocs: true,
                indexPages: true,
                docsRouteBasePath: ['/docs', '/community'],
                docsDir: ['docs', 'community'],
                indexBlog: true,
                blogRouteBasePath: '/blog',
                language: ['en'],
                highlightSearchTermsOnTargetPage: true,
                removeDefaultStopWordFilter: true,
                removeDefaultStemmer: true,
            },
        ],
        async function tailwindcss() {
            return {
                name: 'docusaurus-tailwindcss',
                configurePostCss(postcssOptions) {
                    postcssOptions.plugins.push(require('tailwindcss'));
                    postcssOptions.plugins.push(require('autoprefixer'));
                    return postcssOptions;
                },
            };
        },
        './src/plugins/asset-types',
    ],

    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },

    presets: [
        [
            'classic',
            {
                blog: {
                    path: 'blog',
                    blogTitle: 'SAP Architecture Center - News', // Replacing Blog by News
                    blogDescription:
                        'This blog covers reference architectures in the SAP Architecture Center and details their well-architected framework principles',
                    blogSidebarTitle: 'Architecture Center news', // Replacing Blog by News
                    tags: '../docs/tags.yml',
                    authorsMapPath: 'authors.yml',
                },
                docs: {
                    path: 'docs',
                    showLastUpdateTime: true,
                    showLastUpdateAuthor: true,
                    onInlineTags: 'warn',
                    routeBasePath: 'docs',
                    sidebarPath: require.resolve('./sidebars'),
                    sidebarItemsGenerator: generateSidebarSlices,
                    beforeDefaultRemarkPlugins: [drawioResources],
                    editUrl: 'https://github.com/SAP/architecture-center/edit/dev/',
                },
                theme: {
                    customCss: './src/css/custom.css',
                },
                sitemap: {
                    lastmod: 'date',
                    ignorePatterns: [
                        '/**/tags/**',
                        '/tags/**',
                        '/search/**',
                        '/blog/authors/**',
                        '/blog/archive/**',
                        '/partners/**',
                        '/sap/**',
                    ],
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        image: 'img/ac-soc-med.png',
        metadata: [
            {
                name: 'keywords',
                content: 'sap, btp, architecture, center, hyperscaler, reference',
            },
        ],
        zoom: {
            selector: '.markdown :not(em) > img:not(.no-zoom)',
            background: {
                light: 'rgb(255, 255, 255)',
                dark: 'rgb(50, 50, 50)',
            },
            config: {
                margin: 16,
                container: {
                    top: 50,
                },
            },
        },
        docs: {
            sidebar: {
                autoCollapseCategories: true,
                hideable: true,
            },
        },
        // Announcement Bar
        announcementBar: {
            id: 'internal-prototype',
            content:
                '<b>The Architecture Center is still under development, and some features are not yet available. <a href="https://github.com/SAP/architecture-center/discussions" target="_blank">We welcome your feedback</a>.</b>',
            backgroundColor: '#0053CB',
            textColor: '#FFFFFF',
            isCloseable: true,
        },
        navbar: {
            title: 'Architecture Center',
            hideOnScroll: false,
            logo: {
                alt: 'SAP',
                src: 'img/logo.svg',
            },
            items: [
                {
                    to: 'blog',
                    label: "What's new",
                    position: 'right',
                },
                {
                    to: '/community/intro',
                    label: 'Community of Practice',
                    position: 'right',
                },
                {
                    type: 'dropdown',
                    label: 'SAP Viewpoints',
                    position: 'left',
                    items: [
                        {
                            type: 'html',
                            value: '<strong>Architecture Explorer</strong>',
                        },
                        {
                            to: '/docs/exploreallrefarch',
                            label: 'Card-Style Overview',
                        },
                        {
                            type: 'docSidebar',
                            sidebarId: 'refarchSidebar',
                            label: 'Navigator-Style Overview',
                        },
                        {
                            type: 'html',
                            value: '<hr style="margin: 0.3rem 0;">',
                        },
                        {
                            type: 'html',
                            value: '<strong>Technology Domains</strong>',
                        },
                        {
                            type: 'docSidebar',
                            sidebarId: 'appdev',
                            label: 'Application Development & Automation',
                        },
                        {
                            type: 'docSidebar',
                            sidebarId: 'ai',
                            label: 'Artificial Intelligence',
                        },
                        {
                            type: 'docSidebar',
                            sidebarId: 'data',
                            label: 'Data & Analytics',
                        },
                        {
                            type: 'docSidebar',
                            sidebarId: 'integration',
                            label: 'Integration',
                        },
                        {
                            type: 'docSidebar',
                            sidebarId: 'opsec',
                            label: 'Operation & Security',
                        },
                        {
                            type: 'html',
                            value: '<hr style="margin: 0.3rem 0;">',
                        },
                        {
                            type: 'html',
                            value: '<strong>Technology Partners</strong>',
                        },
                        {
                            type: 'docSidebar',
                            sidebarId: 'aws',
                            label: 'Amazon Web Services',
                        },
                        {
                            type: 'docSidebar',
                            sidebarId: 'azure',
                            label: 'Microsoft Azure',
                        },
                        {
                            type: 'docSidebar',
                            sidebarId: 'gcp',
                            label: 'Google Cloud Platform',
                        },
                    ],
                },
                {
                    href: 'https://github.com/SAP/architecture-center',
                    position: 'right',
                    className: 'navbar-item-github',
                    'aria-label': 'GitHub repository',
                    title: 'Visit GitHub Repository',
                },
            ],
        },
        footer: {
            style: 'light',
            links: [
                {
                    title: 'GitHub',
                    items: [
                        {
                            label: 'GitHub Repository',
                            href: 'https://github.com/SAP/architecture-center',
                        },
                        {
                            label: 'GitHub Issues',
                            href: 'https://github.com/SAP/architecture-center/issues',
                        },
                    ],
                },
                {
                    title: 'SAP Community',
                    items: [
                        {
                            label: 'Enterprise Architecture',
                            href: 'https://community.sap.com/t5/enterprise-architecture/gh-p/Enterprise-Architecture',
                        },
                        {
                            label: 'Blog Posts',
                            href: 'https://community.sap.com/t5/all-sap-community-blogs/ct-p/all-blogs',
                        },
                        {
                            label: 'Q&A',
                            href: 'https://community.sap.com/',
                        },
                    ],
                },
                {
                    title: 'Legal',
                    items: [
                        {
                            label: 'Privacy',
                            href: 'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement',
                        },
                        {
                            label: 'Terms of Use',
                            href: 'https://www.sap.com/about/legal/terms-of-use.html',
                        },
                        {
                            label: 'Legal Statement',
                            href: 'https://www.sap.com/corporate/en/legal/impressum.html',
                        },
                    ],
                },
                {
                    title: 'More',
                    items: [
                        {
                            label: 'SAP Discovery Center',
                            href: 'https://discovery-center.cloud.sap/index.html',
                        },
                        {
                            label: 'BTP Solution Diagrams',
                            href: 'https://sap.github.io/btp-solution-diagrams/',
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()}  SAP SE or SAP affiliate company and SAP Architecture Center contributors. Released under <a href="https://github.com/SAP/architecture-center#Apache-2.0-1-ov-file">Apache-2.0 License</a>.<br>This site is powered by <a href="https://docusaurus.io/" target="_blank">Docusaurus</a> and hosted on <a href="https://pages.github.com/" target="_blank">GitHub Pages</a>.`,
        },
        prism: {
            theme: lightCodeTheme,
            darkTheme: darkCodeTheme,
            magicComments: [
                // Remember to extend the default highlight class name as well!
                {
                    className: 'theme-code-block-highlighted-line',
                    line: 'highlight-next-line',
                    block: { start: 'highlight-start', end: 'highlight-end' },
                },
                {
                    className: 'code-block-hidden',
                    line: 'hide-next-line',
                    block: { start: 'hide-start', end: 'hide-end' },
                },
                {
                    className: 'theme-code-block-added-line',
                    line: 'added-line',
                    block: { start: 'added-start', end: 'added-end' },
                },
                {
                    className: 'theme-code-block-removed-line',
                    line: 'removed-line',
                    block: { start: 'removed-start', end: 'removed-end' },
                },
            ],
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
