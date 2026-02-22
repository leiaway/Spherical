import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Returns true when viewport width is below MOBILE_BREAKPOINT (768px).
 * Listens to matchMedia so it updates on resize.
 *
 * **Side effects:** Subscribes to window.matchMedia('(max-width: 767px)').change; cleans up on unmount.
 *
 * @returns boolean - true if viewport &lt; 768px (may be undefined on first render before effect runs)
 *
 * @example
 * const isMobile = useIsMobile();
 * return isMobile ? <MobileNav /> : <DesktopNav />;
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
