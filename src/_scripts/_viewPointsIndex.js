import path from 'path'; // The 'path' module is already imported, we will use it.
import fs from 'fs';
import { getTagsFile } from '@docusaurus/utils-validation';
const jsonSchema = require('./_generatedIndexCategories.json');

// --- MODIFIED SECTION START ---
// This is the robust, definitive way to load the file.
// 1. `__dirname` gives us the absolute path to the current script's directory (`.../src/_scripts`).
// 2. `path.resolve` joins the paths to create a single, absolute path to the JSON file in your project root.
const categoryDocMappingPath = path.resolve(__dirname, '../../sidebarGenerated.json');
const categoryDocMapping = require(categoryDocMappingPath);
// --- MODIFIED SECTION END ---

function getTagsList(doc, tags) {
    return (doc.frontMatter?.tags || []).map((tag) => ({
        tag,
        ...(tags[tag] || {}),
    }));
}

function createRefItem(doc, tags, baseHref, extraCustomProps = {}) {
    const title = doc.frontMatter?.title || doc.title;
    const customProps = {
        title,
        description: doc.frontMatter?.description,
        href: baseHref + doc.frontMatter?.slug,
        tags: getTagsList(doc, tags),
        last_update: doc.frontMatter?.last_update?.date,
        ...extraCustomProps,
    };

    return {
        type: 'ref',
        id: doc.id,
        customProps,
    };
}

function createLandingPageSection(items) {
    return items.map((item) => ({
        type: 'link',
        label: item.customProps.title,
        href: item.customProps?.href,
        customProps: item.customProps,
    }));
}

function getLatestItems(items) {
    return [...items]
        .sort((a, b) => new Date(b.customProps.last_update) - new Date(a.customProps.last_update))
}

function writeJsonToFile(filePath, data) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export default async function generateSidebarSlices({ defaultSidebarItemsGenerator, ...args }) {
    const sidebar_id = args.item.dirName;
    const tags = await getTagsFile({
        contentPaths: {
            contentPathLocalized: 'docs',
            contentPath: 'docs',
        },
    });

    if (args.item.dirName === '.') {
        const sidebarItems = await defaultSidebarItemsGenerator(args);
        
        const docIdToCategoriesMap = new Map();
        for (const [categoryKey, data] of Object.entries(categoryDocMapping)) {
            for (const docId of data.ids) {
                if (!docIdToCategoriesMap.has(docId)) {
                    docIdToCategoriesMap.set(docId, []);
                }
                docIdToCategoriesMap.get(docId).push(categoryKey);
            }
        }

        function injectProps(items) {
            if (!items) return []; 
            return items.map((item) => {
                if (item.type === 'doc' && docIdToCategoriesMap.has(item.id)) {
                    return {
                        ...item,
                        customProps: {
                            ...item.customProps,
                            category_index: docIdToCategoriesMap.get(item.id),
                        },
                    };
                }
                if (item.type === 'category') {
                    return { ...item, items: injectProps(item.items) };
                }
                return item;
            });
        }

        return injectProps(sidebarItems);
    }

    if (sidebar_id === 'exploreallrefarch') {
        const filteredDocs = args.docs.filter(
            (doc) =>
                Array.isArray(doc.frontMatter?.sidebar_custom_props?.category_index) &&
                doc.frontMatter.sidebar_custom_props.category_index.length > 0 &&
                doc.frontMatter?.unlisted !== true
        );

        const docsRefArchItems = filteredDocs.map((doc) =>
            createRefItem(doc, tags, 'docs', {
                category_index: doc.frontMatter?.sidebar_custom_props?.category_index,
            })
        );

        const latestItems = getLatestItems(docsRefArchItems); 

        const category = {
            type: 'category',
            label: 'Explore Reference Architectures',
            link: {
                type: 'generated-index',
                title: 'Architecture Explorer',
                description:
                    'Explore all SAP reference architectures across different technology domains and technology partners.',
                slug: '/exploreallrefarch',
                keywords: ['explore', 'all', 'sap', 'reference architectures'],
                image: '/img/ac-soc-med.png',
            },
            customProps: { id: 'exploreallrefarch' },
            items: latestItems,
        };

        const landingPageSectionItems = createLandingPageSection(latestItems.slice(0, 6));
        const outputFile = path.join(__dirname, '../data/exploreArch.json');
        writeJsonToFile(outputFile, [{ ...category, items: landingPageSectionItems }]);

        return [category];
    }

    const sidebarCategory = jsonSchema.generatedIndexes.find((index) => index.customProps.id === sidebar_id);
    if (!sidebarCategory) return [];

    sidebarCategory.items = args.docs
        .filter((doc) => doc.frontMatter?.sidebar_custom_props?.category_index?.includes(sidebar_id))
        .map((doc) =>
            createRefItem(doc, tags, 'docs', {
                category_index: doc.frontMatter?.sidebar_custom_props?.category_index,
            })
        );

    return [sidebarCategory];
}