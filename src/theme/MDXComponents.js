// Import the original mapper
import MDXComponents from '@theme-original/MDXComponents';
import { Icon } from '@ui5/webcomponents-react'; // loads ui5-button wrapped in a ui5-webcomponents-react component
import { setDefaultFontLoading } from '@ui5/webcomponents-base/dist/config/Fonts.js';
import DrawioResources from '../components/DrawioResources';
import Contributors from '../components/Contributors';

setDefaultFontLoading(false); // https://github.com/SAP/ui5-webcomponents/blob/main/docs/2-advanced/01-configuration.md#defaultFontLoading
export default {
    // Re-use the default mapping
    ...MDXComponents,
    SAPIcons: Icon, // Make SAP Icons and web components available
    DrawioResources,
    Contributors
};
