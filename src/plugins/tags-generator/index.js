module.exports = function (context, options) {
  return {
    name: 'docusaurus-tags-plugin',
    async allContentLoaded({ allContent, actions }) {
      const { setGlobalData } = actions;

      const docsContentKey = 'docusaurus-plugin-content-docs';
      const docsPluginContent = allContent[docsContentKey];

      if (!docsPluginContent) {
        console.error(
          `Tags plugin ERROR: Docs plugin content not found using key "${docsContentKey}".`,
          `Available keys are: ${Object.keys(allContent)}`,
        );
        setGlobalData({ docIdToTags: {} });
        return;
      }

      const docIdToTags = {};

     
      const defaultDocsInstance = docsPluginContent['default'];

      if (defaultDocsInstance && defaultDocsInstance.loadedVersions) {
        defaultDocsInstance.loadedVersions.forEach((version) => {
          version.docs.forEach((doc) => {
            const tags = doc.frontMatter?.tags || [];
            if (tags.length > 0) {
              docIdToTags[doc.id] = tags;
            }
          });
        });
      }

      setGlobalData({
        docIdToTags,
      });
      console.log('✅ Tags plugin loaded successfully and processed docs.');
    },
  };
};