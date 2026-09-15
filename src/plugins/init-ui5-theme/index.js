// Set Docusaurus theme immediately to prevent FOUC in Safari
const setDocusaurusTheme = `(function() {
    // Default to dark mode as per docusaurus config
    var theme = 'dark';
    try {
        var stored = window['localStorage'].getItem('theme');
        if (stored === 'light' || stored === 'dark') {
            theme = stored;
        }
    } catch(e) {}
    document.documentElement.setAttribute('data-theme', theme);
})();`;

const callInitTheme = `(function() {
    const configScript = document.createElement('script');
    configScript.type = 'application/json';
    configScript.setAttribute('data-ui5-config', '');

    // assumes docusaurus's default mode is set to 'dark'
    let theme = 'sap_horizon_dark';
    try {
        if (window['localStorage'].getItem('theme') === 'light') theme = 'sap_horizon';
    } catch {}

    configScript.textContent = JSON.stringify({ theme: theme });
    document.head.appendChild(configScript);
})();`;

// init ui5 theme inline in script tag to prevent dark mode FOUC (Flash of Unstyled Content)
export default () => {
    return {
        name: 'init-ui5-theme',
        injectHtmlTags() {
            return {
                headTags: [
                    {
                        tagName: 'script',
                        innerHTML: setDocusaurusTheme,
                    },
                    {
                        tagName: 'script',
                        innerHTML: callInitTheme,
                    },
                ],
            };
        },
    };
};
