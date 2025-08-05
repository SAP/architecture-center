const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const TAG_MAPPING = {
  ai: ['ai', 'azure', 'genai', 'aws', 'gcp'],
  data: ['data'],
  security: ['security'],
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
        return;
      }

      try {
        const raFolders = fs.readdirSync(refArchDir, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('RA'))
          .map(dirent => dirent.name);

        for (const folderName of raFolders) {
          const readmePath = path.join(refArchDir, folderName, 'readme.md');

          if (fs.existsSync(readmePath)) {
            const fileContent = fs.readFileSync(readmePath, 'utf8');
            const { data: frontMatter } = matter(fileContent);

            if (frontMatter.id && frontMatter.title && frontMatter.tags && Array.isArray(frontMatter.tags)) {
              // This is the key change: Generate the EXACT Docusaurus ID.
              const docId = path.join('ref-arch', folderName, frontMatter.id).replace(/\\/g, '/');
              const docTitle = frontMatter.title;

              for (const [primaryId, associatedTags] of Object.entries(TAG_MAPPING)) {
                if (frontMatter.tags.some(docTag => associatedTags.includes(docTag))) {
                  pageMapping[primaryId].push({ id: docId, title: docTitle });
                }
              }
            }
          }
        }
        
        for (const primaryId in pageMapping) {
            const uniqueDocsMap = new Map();
            pageMapping[primaryId].forEach(doc => uniqueDocsMap.set(doc.id, doc));
            pageMapping[primaryId] = Array.from(uniqueDocsMap.values());
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
        console.log('✅ Successfully generated pageMapping.ts with official Docusaurus IDs.');

      } catch (err) {
        console.error('❌ Error generating pageMapping.ts:', err);
      }
    },
  };
};