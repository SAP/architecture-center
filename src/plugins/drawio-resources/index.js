import { visit } from 'unist-util-visit';

/**
 * MDX AST transformer (remark) plugin to be run before default docusaurus remark plugins
 * Provides support for markdown-friendly syntax to embed drawio resources within markdown documents
 *
 * Processes ![](<path-without-extension>.drawio) image include syntax as follows:
 * - injects a drawio file import statement at the top of the markdown document
 * - adds a <DrawioResources> JSX component invocation in place of the markdown syntax
 */
export default (options) => {
    return async (ast, vfile) => {
        let counter = 1;
        const root = ast;
        visit(ast, 'image', (node) => {
            // match by file extension
            if (node.url.endsWith('.drawio')) {
                // inject import statement at the root
                const drawioImport = {
                    type: 'mdxjsEsm',
                    value: `import drawio${counter} from '!!file-loader!./${node.url}';`,
                    data: {
                        estree: {
                            type: 'Program',
                            body: [
                                {
                                    type: 'ImportDeclaration',
                                    specifiers: [
                                        {
                                            type: 'ImportDefaultSpecifier',
                                            local: { type: 'Identifier', name: `drawio${counter}` },
                                        },
                                    ],
                                    source: {
                                        type: 'Literal',
                                        value: `!!file-loader!./${node.url}`,
                                        raw: `'!!file-loader!./${node.url}'`,
                                    },
                                },
                            ],
                        },
                    },
                };
                root.children.unshift(drawioImport);
                // substitute <DrawioResources> JSX node for image node
                node.type = 'mdxJsxFlowElement';
                node.name = 'DrawioResources';
                node.attributes = [
                    {
                        type: 'mdxJsxAttribute',
                        name: 'drawioFile',
                        value: {
                            type: 'mdxJsxAttributeValueExpression',
                            value: `drawio${counter}`,
                            data: {
                                estree: {
                                    type: 'Program',
                                    body: [
                                        {
                                            type: 'ExpressionStatement',
                                            expression: {
                                                type: 'Identifier',
                                                name: `drawio${counter}`,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    },
                ];
                counter++;
            }
        });
        return ast;
    };
};
