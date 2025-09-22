"use client";

import { useEffect } from 'react';
import Script from 'next/script';

/**
 * Component to fix Grammarly extension hydration issues
 * Removes Grammarly attributes that cause hydration mismatches
 */
export function GrammarlyFix() {
  useEffect(() => {
    // Remove Grammarly attributes that cause hydration issues
    const removeGrammarlyAttributes = () => {
      if (typeof document !== 'undefined') {
        const body = document.body;
        if (body) {
          body.removeAttribute('data-new-gr-c-s-check-loaded');
          body.removeAttribute('data-gr-ext-installed');
          body.removeAttribute('data-gr-c-s-loaded');
        }
      }
    };

    // Remove attributes immediately
    removeGrammarlyAttributes();

    // Also remove them after a short delay in case they're added later
    const timeoutId = setTimeout(removeGrammarlyAttributes, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <Script
      id="grammarly-fix"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          // Prevent Grammarly from adding attributes during SSR
          if (typeof window !== 'undefined') {
            const observer = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.target.tagName === 'BODY') {
                  const body = mutation.target;
                  if (body.hasAttribute('data-new-gr-c-s-check-loaded')) {
                    body.removeAttribute('data-new-gr-c-s-check-loaded');
                  }
                  if (body.hasAttribute('data-gr-ext-installed')) {
                    body.removeAttribute('data-gr-ext-installed');
                  }
                  if (body.hasAttribute('data-gr-c-s-loaded')) {
                    body.removeAttribute('data-gr-c-s-loaded');
                  }
                }
              });
            });
            
            // Start observing when DOM is ready
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', function() {
                observer.observe(document.body, {
                  attributes: true,
                  attributeFilter: ['data-new-gr-c-s-check-loaded', 'data-gr-ext-installed', 'data-gr-c-s-loaded']
                });
              });
            } else {
              observer.observe(document.body, {
                attributes: true,
                attributeFilter: ['data-new-gr-c-s-check-loaded', 'data-gr-ext-installed', 'data-gr-c-s-loaded']
              });
            }
          }
        `,
      }}
    />
  );
}
