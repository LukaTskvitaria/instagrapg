import { useEffect, useState } from 'react';

/**
 * Hook to suppress hydration warnings caused by browser extensions
 * that modify the DOM after server-side rendering
 */
export function useSuppressHydration() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Component wrapper to suppress hydration warnings for specific elements
 * that might be affected by browser extensions
 */
export function NoSSR({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return children as React.ReactElement;
}
