const lightCodeTheme = require('prism-react-renderer').themes.github;
const darkCodeTheme = require('prism-react-renderer').themes.vsDark;
import drawioResources from './src/plugins/drawio-resources/index.js';
const generateSidebarSlices = require('./src/_scripts/_viewPointsIndex');
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
require('dotenv').config();

const baseUrl = '/';

const config: Config = {
    title: 'SAP Architecture Center',
    tagline:
        'SAP Architecture Center empowers architects and developers with best practices, reference architectures, and community-driven guidance for designing, integrating, and optimizing SAP and cloud solutions. Accelerate innovation, ensure security, and reduce costs with proven frameworks and collaborative expertise for enterprise transformation.',
    favicon: 'img/favicon.ico',

    url: 'https://architecture.learning.sap.com',
    baseUrl: baseUrl,

    // GitHub pages deployment config.
    organizationName: 'SAP', //GitHub org
    projectName: 'architecture-center', // repo name
    deploymentBranch: 'site',
    trailingSlash: false,

    onBrokenLinks: 'warn', //'throw' to fail build
    onDuplicateRoutes: 'throw',
    onBrokenAnchors: 'warn',

    customFields: {
        validatorApiUrl: process.env.VALIDATOR_API_URL,
        backendUrl: process.env.BACKEND_API_URL,
        expressBackendUrl: process.env.EXPRESS_BACKEND_URL,
        authProviders: {
            '/ArchitectureValidator': 'btp',
            '/quickStart': 'github',
        },
        markdown: {
            mermaid: true,
            hooks: {
                onBrokenMarkdownLinks: 'throw',
                onBrokenMarkdownImages: 'throw',
            },
        },
    },
    themes: ['@docusaurus/theme-mermaid'],
    plugins: [
        [require.resolve('docusaurus-plugin-image-zoom'), {}],
        './src/plugins/init-ui5-theme',
        './src/plugins/page-mapping-generator',
        './src/plugins/tags-generator',
        './src/plugins/tags-plugin',
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
                    blogTitle: 'SAP Architecture Center - News',
                    blogDescription:
                        'This blog covers reference architectures in the SAP Architecture Center and details their well-architected framework principles',
                    blogSidebarTitle: 'Architecture Center news',
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
                        '/search/**',
                        '/blog/authors/**',
                        '/blog/archive/**',
                        '/docs/partners/**',
                        '/docs/sap/**',
                        '/docs/exploreallrefarch/**',
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
                '<b>Thank you for visiting the SAP Architecture Center. Your <a href="https://github.com/SAP/architecture-center/discussions" target="_blank">feedback</a> is important to us!</b>',
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
                    type: 'dropdown',
                    label: 'SAP Viewpoints',
                    position: 'left',
                    items: [
                        {
                            type: 'html',
                            value: '<strong>Technology Domains</strong>',
                        },
                        {
                            type: 'html',
                            value: `<a class="dropdown__link" href="${baseUrl}docs?filter=appdev">Application Development & Automation</a>`,
                        },
                        {
                            type: 'html',
                            value: `<a class="dropdown__link" href="${baseUrl}docs?filter=ai">Artificial Intelligence</a>`,
                        },
                        {
                            type: 'html',
                            value: `<a class="dropdown__link" href="${baseUrl}docs?filter=data">Data & Analytics</a>`,
                        },
                        {
                            type: 'html',
                            value: `<a class="dropdown__link" href="${baseUrl}docs?filter=integration">Integration</a>`,
                        },
                        {
                            type: 'html',
                            value: `<a class="dropdown__link" href="${baseUrl}docs?filter=opsec">Operation & Security</a>`,
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
                            type: 'html',
                            value: `<a class="dropdown__link" href="${baseUrl}docs?filter=aws">Amazon Web Services</a>`,
                        },
                        {
                            type: 'html',
                            value: `<a class="dropdown__link" href="${baseUrl}docs?filter=databricks">Databricks</a>`,
                        },
                        {
                            type: 'html',
                            value: `<a class="dropdown__link" href="${baseUrl}docs?filter=gcp">Google Cloud Platform</a>`,                          
                        },
                        {
                            type: 'html',
                            value: `<a class="dropdown__link" href="${baseUrl}docs?filter=ibm">IBM</a>`,                          
                        },
                        {
                            type: 'html',
                            value: `<a class="dropdown__link" href="${baseUrl}docs?filter=azure">Microsoft Azure</a>`,
                        },
                        {
                            type: 'html',
                            value: `<a class="dropdown__link" href="${baseUrl}docs?filter=nvidia">Nvidia</a>`,
                        },
                    ],
                },
                {
                    type: 'search',
                    position: 'right',
                },
                {
                    type: 'dropdown',
                    label: 'Navigate',
                    position: 'right',
                    items: [
                        {
                            label: 'Browse Architectures',
                            to: '/docs',
                        },
                        {
                            label: 'Architecture Validator',
                            to: '/ArchitectureValidator',
                        },
                        {
                            label: 'QuickStart',
                            to: '/quickStart',
                        },
                        {
                            label: 'Solution Diagram Guidelines',
                            to: '/solution-diagram-guidelines',
                        },
                        {
                            label: 'Community of Practice',
                            to: '/community/intro',
                        },
                        {
                            label: "What's New",
                            to: '/blog',
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
                {
                    type: 'custom-user-dropdown',
                    position: 'right',
                },
            ],
        },
        footer: {
            style: 'light',
            links: [
                {
                    title: 'Other SAP Resources',
                    items: [
                        {
                            label: 'SAP Help Portal',
                            href: 'https://help.sap.com/docs/',
                        },
                        {
                            label: 'SAP Developer Center',
                            href: 'https://developers.sap.com/',
                        },
                        {
                            label: 'SAP Support Portal',
                            href: 'https://support.sap.com/',
                        },
                        {
                            label: 'SAP Learning',
                            href: 'https://learning.sap.com/',
                        },
                    ],
                },
                {
                    title: 'SAP Open Source & GitHub',
                    items: [
                        {
                            label: 'SAP Open Source',
                            href: 'https://pages.community.sap.com/topics/open-source',
                        },
                        {
                            label: 'GitHub Repository',
                            href: 'https://github.com/SAP/architecture-center',
                        },
                        {
                            label: 'Create a new GitHub issue',
                            href: 'https://github.com/SAP/architecture-center/issues/new/choose',
                        },
                    ],
                },
                {
                    title: 'SAP Communities',
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
                            label: 'SAP Community',
                            href: 'https://community.sap.com/',
                        },
                    ],
                },
                {
                    title: 'Legal',
                    items: [
                        {
                            label: 'Privacy Statement',
                            href: 'https://architecture.learning.sap.com/community/privacy',
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
