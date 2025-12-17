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
      let communitySidebarContext = null;

     
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

        // Capture sidebar context from the loaded versions (current/default)
        if (defaultDocsInstance.loadedVersions.length > 0) {
          const currentVersion = defaultDocsInstance.loadedVersions[0];
          if (currentVersion.sidebars) {
            sidebarContext = currentVersion.sidebars;
            // Only log in development mode
            if (process.env.NODE_ENV === 'development') {
              console.log('✅ Tags plugin captured sidebar context at build time:', Object.keys(sidebarContext));
            }
          }
        }
      }

      // Capture community sidebar context
      const communityDocsInstance = docsPluginContent['community'];
      if (communityDocsInstance && communityDocsInstance.loadedVersions) {
        if (communityDocsInstance.loadedVersions.length > 0) {
          const communityVersion = communityDocsInstance.loadedVersions[0];
          if (communityVersion.sidebars) {
            communitySidebarContext = communityVersion.sidebars;
            // Only log in development mode
            if (process.env.NODE_ENV === 'development') {
              console.log('✅ Tags plugin captured community sidebar context at build time:', Object.keys(communitySidebarContext));
            }
          }
        }
      }

      setGlobalData({
        docIdToTags,
        sidebarContext,
        communitySidebarContext,
      });
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Tags plugin loaded successfully and processed docs with sidebar context.');
      }
    },
  };
};
