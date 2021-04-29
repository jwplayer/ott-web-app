import { useState, useEffect } from 'react';
import throttle from 'lodash.throttle';

type Breakpoints = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const THROTTLE_WAIT = 500;

const getDeviceConfig = (width: number): Breakpoints => {
    if (width < 320) {
        return 'xs';
    } else if (width >= 320 && width < 720) {
        return 'sm';
    } else if (width >= 720 && width < 1024) {
        return 'md';
    } else if (width >= 1024 && width < 1440) {
        return 'lg';
    } else {
        return 'xl';
    }
};

const useBreakpoint = () => {
    const [breakPoint, setBreakpoint] = useState(() => getDeviceConfig(window.innerWidth));

    useEffect(() => {
        const calcInnerWidth = throttle(function () {
            setBreakpoint(getDeviceConfig(window.innerWidth))
        }, THROTTLE_WAIT);
        window.addEventListener('resize', calcInnerWidth);
        return () => window.removeEventListener('resize', calcInnerWidth);
    }, []);

    return breakPoint;
}
export default useBreakpoint;
