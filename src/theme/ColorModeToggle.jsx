import ColorModeToggle from '@theme-original/ColorModeToggle';
import { setTheme } from '@ui5/webcomponents-base/dist/config/Theme';
import '@ui5/webcomponents-react/dist/Assets';
import { useEffect } from 'react';

export default function ColorModeToggleWrapper(props) {
    // run only in first render of the component
    useEffect(() => {
        // set light theme as default
        const theme = localStorage?.getItem?.('theme') || 'light';
        setTheme(theme == 'dark' ? 'sap_horizon_dark' : 'sap_horizon');
    }, []);

    const onChange = (mode) => {
        setTheme(mode === 'dark' ? 'sap_horizon_dark' : 'sap_horizon');
        props.onChange(mode);
    };
    return <ColorModeToggle {...props} onChange={onChange} />;
}
