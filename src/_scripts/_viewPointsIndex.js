import path from 'path';
import fs from 'fs';
import { getTagsFile } from '@docusaurus/utils-validation';
const jsonSchema = require('./_generatedIndexCategories.json');

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
        type: "ref",
        id: doc.id,
        customProps,
    };
}

function createLandingPageSection(items) {
    return items.map((item) => ({
        type: "link",
        label: item.customProps.title,
        href: item.customProps?.href,
        customProps: item.customProps,
    }));
}

function getLatestItems(items, limit = 6) {
    return [...items]
        .sort((a, b) => new Date(b.customProps.last_update) - new Date(a.customProps.last_update))
        .slice(0, limit);
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
    const contentPath = sidebar_id === 'guidance' ? 'guidance' : 'docs';
    const tags = await getTagsFile({
        contentPaths: {
            contentPathLocalized: contentPath,
            contentPath: contentPath,
        },
    });

    if (args.item.dirName === '.') {
        return await defaultSidebarItemsGenerator(args);
    }

    if (sidebar_id === "exploreallrefarch") {
        const filteredDocs = args.docs.filter(
            (doc) =>
                Array.isArray(doc.frontMatter?.sidebar_custom_props?.category_index) &&
                doc.frontMatter.sidebar_custom_props.category_index.length > 0
        );

        const docsRefArchItems = filteredDocs.map((doc) =>
            createRefItem(doc, tags, "docs", {
                category_index: doc.frontMatter?.sidebar_custom_props?.category_index,
            })
        );

        const category = {
            type: "category",
            label: "Explore Reference Architectures",
            link: {
                type: "generated-index",
                title: "Architecture Explorer",
                description:
                    "Explore all SAP reference architectures across different technology domains and technology partners.",
                slug: "/exploreallrefarch",
                keywords: ["explore", "all", "sap", "reference architectures"],
                image: "/img/sap_logo.png",
            },
            customProps: { id: "exploreallrefarch" },
            items: docsRefArchItems,
        };

        const latestItems = getLatestItems(docsRefArchItems);
        const landingPageSectionItems = createLandingPageSection(latestItems);
        const outputFile = path.join(__dirname, '../data/exploreArch.json');
        writeJsonToFile(outputFile, [{ ...category, items: landingPageSectionItems }]);

        return [category];
    }

    if (sidebar_id === "guidance") {
        const filteredGuidanceDocs = args.docs.filter(
            (doc) =>
                Array.isArray(doc.frontMatter?.sidebar_custom_props?.guidance_index) &&
                doc.frontMatter.sidebar_custom_props.guidance_index.length > 0
        );

        const docsGuidanceItems = filteredGuidanceDocs.map((doc) =>
            createRefItem(doc, tags, "/guidance", {
                guidance_index: doc.frontMatter?.sidebar_custom_props?.guidance_index,
                isGuidance: true,
            })
        );

        const latestItems = getLatestItems(docsGuidanceItems);
        const landingPageSectionItems = createLandingPageSection(latestItems);

        const outputFile = path.join(__dirname, '../data/exploreGuidance.json');
        writeJsonToFile(outputFile, [{ items: landingPageSectionItems }]);

        return [];
    }

    const sidebarCategory = jsonSchema.generatedIndexes.find(
        (index) => index.customProps.id === sidebar_id
    );
    if (!sidebarCategory) return [];

    sidebarCategory.items = args.docs
        .filter((doc) =>
            doc.frontMatter?.sidebar_custom_props?.category_index?.includes(sidebar_id)
        )
        .map((doc) =>
            createRefItem(doc, tags, "docs", {
                category_index: doc.frontMatter?.sidebar_custom_props?.category_index,
            })
        );

    return [sidebarCategory];
}
