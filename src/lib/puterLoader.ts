/**
 * Lazy loader for Puter.js
 * Avoids loading third-party scripts on initial page load which can trigger
 * cross-origin "Script error." in iframe or sandboxed environments.
 */

let puterLoadPromise: Promise<boolean> | null = null;

export function loadPuterScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if ((window as any).puter?.ai?.chat) return Promise.resolve(true);
  if (puterLoadPromise) return puterLoadPromise;

  puterLoadPromise = new Promise<boolean>((resolve) => {
    try {
      const existing = document.querySelector('script[src*="js.puter.com"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(true), { once: true });
        existing.addEventListener('error', () => resolve(false), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.warn('Failed to load Puter.js script');
        resolve(false);
      };
      document.head.appendChild(script);
    } catch {
      resolve(false);
    }
  });

  return puterLoadPromise;
}
