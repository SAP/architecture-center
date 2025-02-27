const log = console.log;

export default function noSvgr(context, opts) {
    return {
        name: 'no-svgr',
        configureWebpack(config, isServer, utils, content) {
            log("no svgr plugin");
            const templ = '[name]-[hash][ext]';
            const rules = config.module.rules;
            // svgr shouldn't process svg if query ?resource is used
            rules.find(r => r.test.toString().includes(".svg")).resourceQuery = { not: [/resource/] };
            rules.push({
                test: /\.svg$/,
                resourceQuery: /resource/,
                type: 'asset/resource',
                generator: { filename: templ }
            });

            return {};
        }
    }
}
