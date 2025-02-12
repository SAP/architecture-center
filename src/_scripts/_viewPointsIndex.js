import { getTagsFile } from '@docusaurus/utils-validation';
const jsonSchema = require('./_generatedIndexCategories.json');

export default async function generateSidebarSlices({ defaultSidebarItemsGenerator, ...args }) {
    const tags = await getTagsFile({ contentPaths: { contentPathLocalized: 'docs', contentPath: 'docs' } });

    if (args.item.dirName === '.') {
        return await defaultSidebarItemsGenerator(args);
    }

    const sidebar_id = args.item.dirName;

    if (sidebar_id === "explore") {
        return [
            {
                type: "category",
                label: "Explore All Architectures",
                link: {
                    type: "generated-index",
                    title: "Explore",
                    description: "Explore all SAP reference architectures across different technology domains and cloud providers.",
                    slug: "/explore",
                    keywords: ["explore", "all", "sap", "reference architectures"],
                    image: "/img/sap_logo.png"
                },
                customProps: {
                    id:"explore"
                },
                items: args.docs.map((doc) => ({
                    type: "ref",
                    id: doc.id,
                    customProps: {
                        title: doc.frontMatter?.title || doc.title,
                        tags: (doc.frontMatter?.tags || []).map((tag) => ({
                            tag,
                            ...(tags[tag] || {}),
                        })),
                        last_update: doc.frontMatter?.last_update?.date,
                        category_index: doc.frontMatter?.sidebar_custom_props?.category_index
                    },
                })),
            }
        ];
    }

    // Find category based on sidebar_id
    const sidebarCategory = jsonSchema.generatedIndexes.find((index) => index.customProps.id === sidebar_id);

    if (!sidebarCategory) {
        return [];
    }

    // Return only category-specific documents
    sidebarCategory.items = args.docs
        .filter((doc) => doc.frontMatter?.sidebar_custom_props?.category_index?.includes(sidebar_id))
        .map((doc) => ({
            type: "ref",
            id: doc.id,
            customProps: {
                title: doc.frontMatter?.title || doc.title,
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
