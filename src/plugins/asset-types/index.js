// Map assets like drawios, svgs etc. to Asset Modules types which should be used.
// see https://webpack.js.org/guides/asset-modules/
export default () => {
    return {
        name: 'asset-types',
        configureWebpack(config) {
            const templ = '[name]-[hash][ext]';
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
                    generator: { filename: templ },
                }
            );

            return {};
        },
    };
};
