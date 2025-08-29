const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const glob = require('glob');

const TAG_MAPPING = {
  ai: ['genai'],
  data: ['data'],
  opsec: ['security'],
  appdev: ['appdev'],
  integration: ['integration'],
};

module.exports = function (context, options) {
  return {
    name: 'docusaurus-plugin-page-mapping-generator',

    async loadContent() {
      const { siteDir } = context;
      const docsDir = path.join(siteDir, 'docs');
      const refArchDir = path.join(docsDir, 'ref-arch');
      const outputDir = path.join(siteDir, 'src', 'constant');
      const outputFile = path.join(outputDir, 'pageMapping.ts');

      const pageMapping = Object.keys(TAG_MAPPING).reduce((acc, key) => {
        acc[key] = [];
        return acc;
      }, {});

      if (!fs.existsSync(refArchDir)) {
        console.warn('`docs/ref-arch` directory not found. Skipping page mapping generation.');
        return;
      }

      try {
        const pattern = path.join(refArchDir, 'RA*', '**', '*.{md,mdx}');
        const docFiles = glob.sync(pattern);

        for (const filePath of docFiles) {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const { data: frontMatter } = matter(fileContent);
          
          if (frontMatter.id && frontMatter.title && frontMatter.tags && Array.isArray(frontMatter.tags) && frontMatter.last_update?.date) {
            const lastUpdatedAt = new Date(frontMatter.last_update.date);
            const relativePath = path.relative(refArchDir, filePath);
            const pathParts = relativePath.split(path.sep);

            let docId;
            const rootFolder = pathParts[0];
            const docTitle = frontMatter.title;
            const docFileId = frontMatter.id;

            if (pathParts.length > 2) {
              const subFolder = pathParts[1];
              const cleanedSubFolder = subFolder.replace(/^\d+-/, '');
              docId = path.join('ref-arch', rootFolder, cleanedSubFolder, docFileId).replace(/\\/g, '/');
            } else {
              docId = path.join('ref-arch', rootFolder, docFileId).replace(/\\/g, '/');
            }

            for (const [primaryId, associatedTags] of Object.entries(TAG_MAPPING)) {
              if (frontMatter.tags.some(docTag => associatedTags.includes(docTag))) {
                pageMapping[primaryId].push({ id: docId, title: docTitle, lastUpdatedAt });
              }
            }
          }
        }
        
        for (const primaryId in pageMapping) {
          const uniqueDocsMap = new Map();
          pageMapping[primaryId].forEach(doc => uniqueDocsMap.set(doc.id, doc));
          const uniqueDocs = Array.from(uniqueDocsMap.values());

          pageMapping[primaryId] = uniqueDocs
            .sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt)
            .map(({ id, title }) => ({ id, title }));
        }

        const outputContent = `
export interface MappedDoc {
  id: string;
  title: string;
}

export const pageMapping: Record<string, MappedDoc[]> = ${JSON.stringify(pageMapping, null, 2)};
`;
        fs.mkdirSync(outputDir, { recursive: true });
        fs.writeFileSync(outputFile, outputContent, 'utf8');
        console.log('✅ Successfully generated and sorted pageMapping.ts with correct IDs.');

      } catch (err) {
        console.error('❌ Error generating pageMapping.ts:', err);
      }
    },
  };
};