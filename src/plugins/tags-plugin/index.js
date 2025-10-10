const path = require('path');
const fs = require('fs');
const jsyaml = require('js-yaml');

const frontMatterRegex = /^---\s*([\s\S]*?)\s*---/;

function getAllFiles(dirPath, extensions, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, extensions, arrayOfFiles);
    } else {
      if (extensions.includes(path.extname(file))) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

module.exports = function (context, options) {
  return {
    name: 'docusaurus-tags',

    async loadContent() {
      const tagsFilePath = path.join(context.siteDir, 'docs', 'tags.yml');

      if (!fs.existsSync(tagsFilePath)) {
        throw new Error(
          `[Tags Plugin] The tags file was not found at the expected path: ${tagsFilePath}. Please ensure docs/tags.yml exists.`
        );
      }

      let tagsData;
      try {
        const fileContents = fs.readFileSync(tagsFilePath, 'utf8');
        tagsData = jsyaml.load(fileContents);

        if (typeof tagsData !== 'object' || tagsData === null) {
          throw new Error('[Tags Plugin] The tags.yml file does not contain a valid YAML object.');
        }
      } catch (e) {
        console.error('[Tags Plugin] CRITICAL ERROR parsing tags.yml.');
        throw e;
      }

      const tagsWithCounts = {};
      for (const tagKey in tagsData) {
        if (Object.hasOwnProperty.call(tagsData, tagKey) && tagKey !== 'demo') {
          tagsWithCounts[tagKey] = {
            ...tagsData[tagKey],
            count: 0,
          };
        }
      }

      const refArchDirPath = path.join(context.siteDir, 'docs', 'ref-arch');

      if (!fs.existsSync(refArchDirPath)) {
        console.warn(
          `[Tags Plugin] Directory to scan not found: ${refArchDirPath}. Tag counts will all be 0.`
        );
        return tagsWithCounts;
      }

      const allMarkdownFiles = getAllFiles(refArchDirPath, ['.md', '.mdx']);

      for (const filePath of allMarkdownFiles) {
        try {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const match = frontMatterRegex.exec(fileContent);

          if (match && match[1]) {
            const frontMatter = jsyaml.load(match[1]);

            if (frontMatter && Array.isArray(frontMatter.tags)) {
              for (const tag of frontMatter.tags) {
                if (tagsWithCounts[tag]) {
                  tagsWithCounts[tag].count++;
                }
              }
            }
          }
        } catch (e) {
          console.error(`[Tags Plugin] Error processing file: ${filePath}. Skipping.`, e);
        }
      }
      
      const sortedTags = Object.fromEntries(
        Object.entries(tagsWithCounts).sort(([, a], [, b]) => b.count - a.count)
      );

      console.log('[Tags Plugin] Final sorted tag data (ignoring "demo"):');
      console.log(JSON.stringify(sortedTags, null, 2));

      return sortedTags;
    },

    async contentLoaded({ content, actions }) {
      const { setGlobalData } = actions;
      setGlobalData({ tags: content });
    },
  };
};