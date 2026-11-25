// Map assets like drawios, svgs etc. to Asset Modules types which should be used.
// see https://webpack.js.org/guides/asset-modules/
import drawioAssetId from '../../_scripts/_drawio-asset-id.js';

const { resolveDocumentId } = drawioAssetId;

export default () => {
    return {
        name: 'asset-types',
        configureWebpack(config) {
            const templ = '[name]-[hash][ext]';
            // Include the corresponding document's unique id before the hash so
            // diagrams are attributable in the web-server access logs, e.g.
            // architecture-137800-<hash>.drawio instead of architecture-<hash>.drawio
            // (many documents name their diagram "architecture.drawio", which is
            // otherwise indistinguishable in the logs). webpack still interpolates
            // the [name]/[hash]/[ext] tokens in the returned string. Falls back to
            // the id-less template when no readme id can be resolved. The id is
            // read from the nearest document's readme.md and validated by the shared
            // _drawio-asset-id helper, which the post-build link rewriter uses too
            // so both agree on the id.
            const drawioFilename = (pathData) => {
                const resource = (pathData.module?.resource || '').split('?')[0];
                const documentId = resource ? resolveDocumentId(resource) : null;
                return documentId ? `[name]-${documentId}-[hash][ext]` : templ;
            };
            // Metadata is an input to the emitted filename. Track it on each
            // asset module so watch mode and webpack's module cache invalidate
            // an unchanged diagram when its readme changes or is first created.
            if (!config.plugins) config.plugins = [];
            config.plugins.push({
                apply(compiler) {
                    compiler.hooks.compilation.tap('DrawioDocumentAssetIds', (compilation) => {
                        compiler.webpack.NormalModule.getCompilationHooks(compilation).beforeLoaders.tap(
                            'DrawioDocumentAssetIds',
                            (_loaders, module) => {
                                const resource = (module.resource || '').split('?')[0];
                                if (module.type !== 'asset/resource' || !resource.endsWith('.drawio')) return;
                                resolveDocumentId(resource, {
                                    onReadme(readmePath, exists) {
                                        if (exists) module.buildInfo.fileDependencies.add(readmePath);
                                        else module.buildInfo.missingDependencies.add(readmePath);
                                    },
                                });
                            }
                        );
                    });
                },
            });
            const rules = config.module.rules;
            // svgr shouldn't process svg if query ?resource is used
            rules.find((r) => r.test.toString().includes('.svg')).resourceQuery = { not: [/resource/] };
            rules.push(
                {
                    test: /\.svg$/,
                    resourceQuery: /resource/,
                    type: 'asset/resource',
                    generator: { filename: templ },
                },
                {
                    test: /\.drawio$/,
                    resourceQuery: /source/,
                    type: 'asset/source',
                },
                {
                    test: /\.drawio$/,
                    type: 'asset/resource',
                    resourceQuery: { not: [/source/] },
                    generator: { filename: drawioFilename },
                }
            );

            return {};
        },
    };
};
