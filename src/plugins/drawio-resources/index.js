import { visit } from 'unist-util-visit';
import { readFileSync } from 'node:fs';

/**
 * MDX AST transformer (remark) plugin to be run before default docusaurus remark plugins
 * Provides support for markdown-friendly syntax to embed drawio resources within markdown documents
 *
 * Processes ![](<path-without-extension>.drawio) image include syntax as follows:
 * - injects a drawio file import statement at the top of the markdown document
 * - injects a file import statement for the image of the drawio at the top of the markdown document
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
                const drawioImport = defineImport(`drawio${counter}`, node.url);
                const drawioXmlImport = defineImport(`drawioXml${counter}`, node.url + '?source');
                root.children.unshift(drawioImport);
                root.children.unshift(drawioXmlImport);

                // substitute <DrawioResources> JSX node for image node
                node.type = 'mdxJsxFlowElement';
                node.name = 'DrawioResources';
                // props to pass to DrawioResources component
                const props = [
                    passProp('drawioFile', `drawio${counter}`),
                    passProp('drawioXml', `drawioXml${counter}`),
                ];

                // drawio/demo.drawio -> import the image from images/demo.svg
                const imgPath = `images/${node.url.split('drawio/')[1].split('.drawio')[0]}.svg`;
                const absPath = vfile.history.at(-1).split('readme.md')[0] + imgPath;
                // eventually, the image won't be there locally. we'll generate it before deployment
                if (fileExists(absPath)) {
                    const imgImport = defineImport(`drawioImg${counter}`, imgPath + '?resource');
                    root.children.unshift(imgImport);
                    props.push(passProp('drawioImg', `drawioImg${counter}`));
                }
                node.attributes = props;
                counter++;
            }
        });

        // remark treats our drawio syntax as inline Markdown content which it wraps in <p> by default
        // as a result <div> is wrapped in <p>, creating a warning. undo this
        root.children.forEach((node, i) => {
            const ch = node.children;
            try {
                // try/catch to make sure to not throw here
                if (node.type === 'paragraph' && ch.length === 1 && ch[0].url && ch[0].url.endsWith('.drawio')) {
                    root.children[i] = ch[0];
                }
            } catch {}
        });
        return ast;
    };
};

function defineImport(name, path) {
    return {
        type: 'mdxjsEsm',
        value: `import ${name} from './${path}';`,
        data: {
            estree: {
                type: 'Program',
                body: [
                    {
                        type: 'ImportDeclaration',
                        specifiers: [
                            {
                                type: 'ImportDefaultSpecifier',
                                local: { type: 'Identifier', name: name },
                            },
                        ],
                        source: {
                            type: 'Literal',
                            value: `./${path}`,
                            raw: `'./${path}'`,
                        },
                    },
                ],
            },
        },
    };
}

function fileExists(path) {
    try {
        readFileSync(path, 'utf8');
        return true;
    } catch {
        return false;
    }
}

function passProp(prop, value) {
    return {
        type: 'mdxJsxAttribute',
        name: prop,
        value: {
            type: 'mdxJsxAttributeValueExpression',
            value: value, // prop value
            data: {
                estree: {
                    type: 'Program',
                    body: [
                        {
                            type: 'ExpressionStatement',
                            expression: {
                                type: 'Identifier',
                                // yes, it's the value
                                name: value,
                            },
                        },
                    ],
                },
            },
        },
    };
}
