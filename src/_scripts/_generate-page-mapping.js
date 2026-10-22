const path = require('path');

const createPageMappingPlugin = require('../plugins/page-mapping-generator');

async function main() {
    const siteDir = path.resolve(__dirname, '../..');
    const plugin = createPageMappingPlugin({ siteDir }, {});
    await plugin.loadContent();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
