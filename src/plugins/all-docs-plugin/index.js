module.exports = function (context) {
  return {
    name: 'docusaurus-sidebar-tags-plugin',

    async allContentLoaded({ allContent, actions }) {
      const { setGlobalData } = actions;
      const docIdToTags = {};

      console.log('[FINAL PLUGIN] Starting tag collection...');

      // This is the correct key, as revealed by the ultimate debug log.
      const docsPluginData = allContent['docusaurus-plugin-content-docs'];

      if (!docsPluginData) {
        console.log('[FINAL PLUGIN] Docs data not found. Exiting.');
        setGlobalData({ docIdToTags: {} });
        return;
      }
      
      // The key insight: We must loop through the instances *inside* the main plugin data object.
      // In your case, this will loop through 'default' and 'community'.
      for (const instanceName in docsPluginData) {
        const docsInstance = docsPluginData[instanceName];
        
        if (docsInstance.loadedVersions[0]?.docs) {
          const allDocs = docsInstance.loadedVersions[0].docs;
          console.log(`[FINAL PLUGIN] Processing instance: "${instanceName}". Found ${allDocs.length} docs.`);

          allDocs.forEach((doc) => {
            if (doc.frontMatter.tags && Array.isArray(doc.frontMatter.tags)) {
              docIdToTags[doc.id] = doc.frontMatter.tags;
            }
          });
        }
      }

      console.log(`[FINAL PLUGIN] Finished. Collected tags for ${Object.keys(docIdToTags).length} documents.`);
      // Optional: uncomment the next line to see the final map in your terminal
      // console.log(docIdToTags);

      setGlobalData({ docIdToTags });
    },
  };
};