// src/shared/config/recaptcha.ts
/**
 * Google reCAPTCHA v3 Configuration
 */

export const RECAPTCHA_CONFIG = {
  siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY || '',
  action: {
    contact: 'contact_form',
    login: 'login',
    register: 'register',
  },
} as const;

// Type for reCAPTCHA actions
export type RecaptchaAction = typeof RECAPTCHA_CONFIG.action[keyof typeof RECAPTCHA_CONFIG.action];

// Track script loading state
let scriptLoadingPromise: Promise<void> | null = null;

/**
 * Validate reCAPTCHA configuration
 */
const validateConfig = (): void => {
  if (!RECAPTCHA_CONFIG.siteKey) {
    throw new Error('reCAPTCHA site key not configured. Please set VITE_RECAPTCHA_SITE_KEY in your environment variables.');
  }
};

/**
 * Load reCAPTCHA script dynamically
 */
export const loadRecaptchaScript = (): Promise<void> => {
  // Return existing loading promise if script is already being loaded
  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  // Check if already loaded
  if (window.grecaptcha?.ready) {
    return Promise.resolve();
  }

  scriptLoadingPromise = new Promise((resolve, reject) => {
    // Validate configuration
    try {
      validateConfig();
    } catch (error) {
      reject(error);
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector(
      `script[src*="recaptcha"]`
    );
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        scriptLoadingPromise = null;
        resolve();
      });
      existingScript.addEventListener('error', () => {
        scriptLoadingPromise = null;
        reject(new Error('Failed to load reCAPTCHA'));
      });
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_CONFIG.siteKey}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      scriptLoadingPromise = null;
      resolve();
    };
    
    script.onerror = () => {
      scriptLoadingPromise = null;
      reject(new Error('Failed to load reCAPTCHA script'));
    };
    
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
};

/**
 * Wait for reCAPTCHA to be ready
 */
const waitForRecaptchaReady = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('reCAPTCHA initialization timeout'));
    }, 10000); // 10 second timeout

    if (window.grecaptcha?.ready) {
      window.grecaptcha.ready(() => {
        clearTimeout(timeout);
        resolve();
      });
    } else {
      clearTimeout(timeout);
      reject(new Error('reCAPTCHA not available'));
    }
  });
};

/**
 * Execute reCAPTCHA and get token
 */
export const executeRecaptcha = async (action: RecaptchaAction): Promise<string> => {
  try {
    // Ensure script is loaded
    await loadRecaptchaScript();
    
    // Wait for grecaptcha to be ready
    await waitForRecaptchaReady();

    // Execute reCAPTCHA
    if (!window.grecaptcha) {
      throw new Error('reCAPTCHA not loaded');
    }
    
    const token = await window.grecaptcha.execute(RECAPTCHA_CONFIG.siteKey, { action });
    
    if (!token) {
      throw new Error('reCAPTCHA token is empty');
    }
    
    return token;
  } catch (error) {
    console.error('reCAPTCHA execution failed:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to verify reCAPTCHA. Please try again.');
  }
};

/**
 * Cleanup reCAPTCHA badge (useful for SPA navigation)
 */
export const cleanupRecaptcha = (): void => {
  const badge = document.querySelector('.grecaptcha-badge');
  if (badge) {
    badge.remove();
  }
};

/**
 * Hide reCAPTCHA badge
 */
export const hideRecaptchaBadge = (): void => {
  const style = document.createElement('style');
  style.innerHTML = '.grecaptcha-badge { visibility: hidden; }';
  document.head.appendChild(style);
};

/**
 * Show reCAPTCHA badge
 */
export const showRecaptchaBadge = (): void => {
  const badge = document.querySelector('.grecaptcha-badge') as HTMLElement;
  if (badge) {
    badge.style.visibility = 'visible';
  }
};

// TypeScript declarations for grecaptcha
declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}