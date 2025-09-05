import React, { JSX } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

function EditorComponent() {
    return (
        <BrowserOnly>
            {() => {
                const Editor = require('@site/src/components/Editor').default;
                return <Editor />;
            }}
        </BrowserOnly>
    );
}

export default function QuickStart(): JSX.Element {
    return (
        <Layout>
            <main style={{ padding: '2rem' }}>
                <h1>Create New Document</h1>
                <EditorComponent />
            </main>
        </Layout>
    );
}
