import { useState, useEffect } from 'react';

const useIsMobile = (breakpoint = 1400) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, [breakpoint]);

    return isMobile;
};

export default useIsMobile;
