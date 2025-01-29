import { getTagsFile } from '@docusaurus/utils-validation';
const jsonSchema = require('./_generatedIndexCategories.json');

export default async function generateSidebarSlices({ defaultSidebarItemsGenerator, ...args }) {
    const tags = await getTagsFile({ contentPaths: { contentPathLocalized: 'docs', contentPath: 'docs' } });

    if (args.item.dirName === '.') {
        return await defaultSidebarItemsGenerator(args);
    } else {
        const sidebar_id = args.item.dirName;
        const sidebarCategory = jsonSchema.generatedIndexes.find((index) => index.customProps.id === sidebar_id);

        if (!sidebarCategory) {
            return [];
        }

        sidebarCategory.items = args.docs
            .filter((doc) => doc.frontMatter?.sidebar_custom_props?.category_index?.includes(sidebar_id))
            .map((doc) => ({
                type: 'ref',
                id: doc.id,
                customProps: {
                    title: doc.frontMatter?.title || doc.title,
                    tags: (doc.frontMatter?.tags || []).map((tag) => ({
                        tag,
                        ...(tags[tag] || {}),
                    })),
                    last_update: doc.frontMatter?.last_update?.date,
                },
            }));

        return [sidebarCategory];
    }
}
