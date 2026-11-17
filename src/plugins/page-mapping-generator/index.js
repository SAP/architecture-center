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

// Helper function to normalize paths for cross-platform compatibility
function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/');
}

// Helper function to create glob patterns that work on all platforms
function createGlobPattern(...pathSegments) {
  return pathSegments.join('/');
}

// Build the Docusaurus document id for a reference-architecture page so the
// homepage tile mapping matches the id Docusaurus actually assigns.
//
// Docusaurus derives a doc id from its path relative to the docs root, stripping
// a leading numeric ordering prefix (e.g. "10-") from each FOLDER segment
// (numberPrefixParser), with frontMatter.id overriding the final segment. We
// mirror that: keep every folder between the RA root and the file (the old code
// kept only the first, which dropped the tiles for pages 2+ levels deep), strip
// each nested folder's numeric prefix, and use docFileId (frontMatter.id) as the
// last segment. The RA root folder (e.g. "RA0042") carries no numeric prefix by
// convention, so it is left as-is. If the docs plugin ever customizes
// numberPrefixParser, this stripping must be kept in sync.
function createDocumentId(relativeFilePath, docFileId) {
  const pathParts = normalizePath(relativeFilePath).split('/').filter(Boolean);
  const rootFolder = pathParts[0];
  const nestedFolders = pathParts
    .slice(1, -1)
    .map(folder => folder.replace(/^\d+-/, ''));

  return ['ref-arch', rootFolder, ...nestedFolders, docFileId].join('/');
}

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
        // Create cross-platform glob pattern using forward slashes
        const normalizedRefArchDir = normalizePath(refArchDir);
        const pattern = createGlobPattern(normalizedRefArchDir, 'RA*', '**', '*.{md,mdx}');
        
        // Use glob with explicit options for cross-platform compatibility
        const docFiles = glob.sync(pattern, {
          windowsPathsNoEscape: true,
          nonull: false
        });

        for (const filePath of docFiles) {
          try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const { data: frontMatter } = matter(fileContent);
            
            if (frontMatter.id && frontMatter.title && frontMatter.tags && 
                Array.isArray(frontMatter.tags) && frontMatter.last_update?.date) {
              
              const lastUpdatedAt = new Date(frontMatter.last_update.date);
              const relativePath = path.relative(refArchDir, filePath);
              
              // Normalize path separators for consistent processing
              const normalizedRelativePath = normalizePath(relativePath);
              const docTitle = frontMatter.title;
              const docFileId = frontMatter.id;
              const docId = createDocumentId(normalizedRelativePath, docFileId);

              // Map documents to their corresponding tags
              for (const [primaryId, associatedTags] of Object.entries(TAG_MAPPING)) {
                if (frontMatter.tags.some(docTag => associatedTags.includes(docTag))) {
                  pageMapping[primaryId].push({ id: docId, title: docTitle, lastUpdatedAt });
                }
              }
            }
          } catch (fileError) {
            console.warn(`Warning: Could not process file ${filePath}:`, fileError.message);
            continue;
          }
        }
        
        // Process and sort the mapped documents
        for (const primaryId in pageMapping) {
          const uniqueDocsMap = new Map();
          pageMapping[primaryId].forEach(doc => uniqueDocsMap.set(doc.id, doc));
          const uniqueDocs = Array.from(uniqueDocsMap.values());

          pageMapping[primaryId] = uniqueDocs
            .sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt)
            .map(({ id, title }) => ({ id, title }));
        }

        // Generate TypeScript output
        const outputContent = `
export interface MappedDoc {
  id: string;
  title: string;
}

export const pageMapping: Record<string, MappedDoc[]> = ${JSON.stringify(pageMapping, null, 2)};
`;

        // Ensure output directory exists and write file
        fs.mkdirSync(outputDir, { recursive: true });
        fs.writeFileSync(outputFile, outputContent, 'utf8');
        console.log('✅ Successfully generated and sorted pageMapping.ts with correct IDs.');

      } catch (err) {
        console.error('❌ Error generating pageMapping.ts:', err);
        throw err; // Re-throw to help with debugging
      }
    },
  };
};

module.exports.createDocumentId = createDocumentId;
