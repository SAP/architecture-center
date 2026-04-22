/**
 * Custom webpack configuration plugin
 * Suppresses non-critical warnings from dependencies
 */

module.exports = function (context, options) {
    return {
        name: 'custom-webpack-config',

        configureWebpack(config, isServer) {
            return {
                ignoreWarnings: [
                    // Suppress vscode-languageserver-types dynamic require warning
                    // This is a known issue with the package and doesn't affect functionality
                    {
                        module: /vscode-languageserver-types/,
                        message: /Critical dependency: require function is used in a way/,
                    },
                    // Suppress any other dynamic require warnings from node_modules
                    {
                        module: /node_modules/,
                        message: /Critical dependency: the request of a dependency is an expression/,
                    },
                ],
            };
        },
    };
};