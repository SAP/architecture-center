import path from 'path';
import fs from 'fs';
import { getTagsFile } from '@docusaurus/utils-validation';
const jsonSchema = require('./_generatedIndexCategories.json');

export default async function generateSidebarSlices({ defaultSidebarItemsGenerator, ...args }) {
    const sidebar_id = args.item.dirName;
    console.log("sidebar id", sidebar_id);

    const contentPath = sidebar_id === 'guidance' ? 'guidance' : 'docs';

    const tags = await getTagsFile({ 
        contentPaths: { 
            contentPathLocalized: contentPath, 
            contentPath: contentPath 
        } 
    });

    if (args.item.dirName === '.') {
        return await defaultSidebarItemsGenerator(args);
    }

    // Special case: exploreallrefarch -> generate sidebar and JSON for React section
    if (sidebar_id === "exploreallrefarch") {
        const filteredDocs = args.docs.filter(
            (doc) =>
              Array.isArray(doc.frontMatter?.sidebar_custom_props?.category_index) &&
              doc.frontMatter.sidebar_custom_props.category_index.length > 0
          );

        const docsRefArchItems = filteredDocs.map((doc) => {
            const title = doc.frontMatter?.title || doc.title;
            const tagsList = (doc.frontMatter?.tags || []).map((tag) => ({
                tag,
                ...(tags[tag] || {}),
            }));
            return {
                type: "ref",
                id: doc.id,
                customProps: {
                    title,
                    description: doc.frontMatter?.description,
                    href: "docs" + doc.frontMatter?.slug,
                    tags: tagsList,
                    last_update: doc.frontMatter?.last_update?.date,
                    category_index: doc.frontMatter?.sidebar_custom_props?.category_index,
                },
            };
        });

        const category = {
            type: "category",
            label: "Explore All Architectures",
            link: {
                type: "generated-index",
                title: "Explore",
                description: "Explore all SAP reference architectures across different technology domains and cloud providers.",
                slug: "/exploreallrefarch",
                keywords: ["explore", "all", "sap", "reference architectures"],
                image: "/img/sap_logo.png"
            },
            customProps: { id: "exploreallrefarch" },
            items: docsRefArchItems,
        };

        // Output for explore all architectures in landing page
        const outputDir = path.resolve(__dirname, '../data');
        const outputFileExploreArch = path.join(outputDir, 'exploreArch.json');

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Sort and limit to the latest 6 for JSON only
        const latestItems = docsRefArchItems
            .sort((a, b) => new Date(b.customProps.last_update) - new Date(a.customProps.last_update))
            .slice(0, 6);

        // Create a version for React that uses type: "link" instead of "ref"
        const reactCompatibleItems = latestItems.map((item) => ({
            type: "link",
            label: item.customProps.title,
            href: item.customProps?.href,
            customProps: item.customProps,
        }));

        fs.writeFileSync(outputFileExploreArch, JSON.stringify([{ ...category, items: reactCompatibleItems }], null, 2), 'utf-8');

        // Return original category with refs for sidebar
        return [category];
    }

    if (sidebar_id === "guidance") {
        const filteredGuidanceDocs = args.docs.filter(
            (doc) =>
                Array.isArray(doc.frontMatter?.sidebar_custom_props?.guidance_index) &&
                doc.frontMatter.sidebar_custom_props.guidance_index.length > 0
        );
    
        const docsGuidanceItems = filteredGuidanceDocs.map((doc) => {
            const title = doc.frontMatter?.title || doc.title;
            const tagsList = (doc.frontMatter?.tags || []).map((tag) => ({
                tag,
                ...(tags[tag] || {}),
            }));
    
            return {
                type: "ref",
                id: doc.id,
                customProps: {
                    title,
                    description: doc.frontMatter?.description,
                    href: "/guidance" + doc.frontMatter?.slug,
                    tags: tagsList,
                    last_update: doc.frontMatter?.last_update?.date,
                    guidance_index: doc.frontMatter?.sidebar_custom_props?.guidance_index,
                    isGuidance: true
                },
            };
        });
    
        const category = {
            type: "category",
            label: "Guidance Documents",
            link: {
                type: "generated-index",
                title: "Guidance Documents",
                description: "Explore guidance documents and methodologies.",
                slug: "/guidance",
                keywords: ["guidance", "methodology", "best practices"],
                image: "/img/sap_logo.png"
            },
            customProps: { id: "guidance" },
            items: docsGuidanceItems,
        };
    
        const outputDir = path.resolve(__dirname, '../data');
        const outputFileGuidance = path.join(outputDir, 'exploreGuidance.json');
    
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
    
        const latestItems = docsGuidanceItems
            .sort((a, b) => new Date(b.customProps.last_update) - new Date(a.customProps.last_update))
            .slice(0, 6);
    
        const reactCompatibleItems = latestItems.map((item) => ({
            type: "link",
            label: item.customProps.title,
            href: item.customProps?.href,
            customProps: item.customProps,
        }));
    
        fs.writeFileSync(
            outputFileGuidance,
            JSON.stringify([{ ...category, items: reactCompatibleItems }], null, 2),
            'utf-8'
        );
    
        return [category];
    }

    const sidebarCategory = jsonSchema.generatedIndexes.find((index) => index.customProps.id === sidebar_id);
    if (!sidebarCategory) return [];

    sidebarCategory.items = args.docs
        .filter((doc) => doc.frontMatter?.sidebar_custom_props?.category_index?.includes(sidebar_id))
        .map((doc) => ({
            type: "ref",
            id: doc.id,
            customProps: {
                title: doc.frontMatter?.title || doc.title,
                description: doc.frontMatter?.description,
                tags: (doc.frontMatter?.tags || []).map((tag) => ({
                    tag,
                    ...(tags[tag] || {}),
                })),
                last_update: doc.frontMatter?.last_update?.date,
                category_index: doc.frontMatter?.sidebar_custom_props?.category_index
            },
        }));

    return [sidebarCategory];
}