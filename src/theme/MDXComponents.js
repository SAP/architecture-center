// Import the original mapper
import MDXComponents from '@theme-original/MDXComponents';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import the FontAwesomeIcon component.
import { library } from '@fortawesome/fontawesome-svg-core'; // Import the library component.
import { fab } from '@fortawesome/free-brands-svg-icons'; // Import all brands icons.
import { fas } from '@fortawesome/free-solid-svg-icons'; // Import all solid icons.
import { Icon } from '@ui5/webcomponents-react'; // loads ui5-button wrapped in a ui5-webcomponents-react component
import { setDefaultFontLoading } from '@ui5/webcomponents-base/dist/config/Fonts.js';
import DrawioResources from '../components/DrawioResources';
import Contributors from '../components/Contributors';

setDefaultFontLoading(false); // https://github.com/SAP/ui5-webcomponents/blob/main/docs/2-advanced/01-configuration.md#defaultFontLoading
library.add(fab, fas); // Add all icons to the library so you can use them without importing them individually.

export default {
    // Re-use the default mapping
    ...MDXComponents,
    SAPIcons: Icon, // Make SAP Icons and web components available
    FAIcon: FontAwesomeIcon, // Make the FontAwesomeIcon component available in MDX as <icon />.
    DrawioResources,
    Contributors,
};
