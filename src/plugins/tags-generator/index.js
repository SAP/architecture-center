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
        setGlobalData({ docIdToTags: {}, sidebarContext: null });
        return;
      }

      const docIdToTags = {};
      let sidebarContext = null;


      const defaultDocsInstance = docsPluginContent['default'];

      if (defaultDocsInstance && defaultDocsInstance.loadedVersions) {
        defaultDocsInstance.loadedVersions.forEach((version) => {
          version.docs.forEach((doc) => {
            const tags = doc.frontMatter?.tags || [];
            // Normalize to a compact UTC calendar date (YYYY-MM-DD): YAML may give a
            // Date object or a string, and keeping it date-only both trims the global
            // bundle and lets the client parse it as UTC midnight consistently.
            const rawDate = doc.frontMatter?.last_update?.date;
            const lastUpdateDate = rawDate instanceof Date
              ? rawDate.toISOString().slice(0, 10)
              : (rawDate ? String(rawDate).slice(0, 10) : null);
            if (tags.length > 0 || lastUpdateDate) {
              docIdToTags[doc.id] = {
                tags,
                lastUpdateDate,
              };
            }
          });
        });

        // Capture sidebar context from the loaded versions (includes all sidebars)
        if (defaultDocsInstance.loadedVersions.length > 0) {
          const currentVersion = defaultDocsInstance.loadedVersions[0];
          if (currentVersion.sidebars) {
            sidebarContext = currentVersion.sidebars;
          }
        }
      }

      setGlobalData({
        docIdToTags,
        sidebarContext,
      });
    },
  };
};
