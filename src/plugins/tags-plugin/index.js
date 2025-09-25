const path = require('path');
const fs = require('fs');
const jsyaml = require('js-yaml');

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

      try {
        const fileContents = fs.readFileSync(tagsFilePath, 'utf8');
        const tagsData = jsyaml.load(fileContents);
        
        if (typeof tagsData !== 'object' || tagsData === null) {
          throw new Error('[Tags Plugin] The tags.yml file does not contain a valid YAML object.');
        }

        return tagsData;
      } catch (e) {
        console.error('[Tags Plugin] CRITICAL ERROR parsing tags.yml.');
        throw e; 
      }
    },

    async contentLoaded({ content, actions }) {
      const { setGlobalData } = actions;
      setGlobalData({ tags: content });
    },
  };
};