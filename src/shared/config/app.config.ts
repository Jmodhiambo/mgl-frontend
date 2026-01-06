// src/shared/config/app.config.ts

/**
 * App Configuration - Auto-detects which panel based on domain
 */

export type AppType = 'user' | 'organizer' | 'admin';

interface AppConfig {
  appType: AppType;
  siteUrl: string;
  siteName: string;
  isPublicSite: boolean;
  defaultOgImage: string;
  twitterHandle: string;
  allowIndexing: boolean;
  showFooter: boolean;
  showPublicHeader: boolean;
}

/**
 * Detect which app we're running based on hostname
 */
function detectAppType(): AppType {
  const hostname = window.location.hostname;
  
  // Check hostname
  if (hostname.includes('organizer.')) {
    return 'organizer';
  }
  if (hostname.includes('admin.')) {
    return 'admin';
  }
  
  // Check localhost port (for development)
  const port = window.location.port;
  if (port === '3001') return 'organizer'; // organizer dev server
  if (port === '3002') return 'admin';     // admin dev server
  
  // Default to user panel
  return 'user';
}

/**
 * Get configuration based on app type
 */
function getAppConfig(appType: AppType): AppConfig {
  const configs: Record<AppType, AppConfig> = {
    user: {
      appType: 'user',
      siteUrl: import.meta.env.VITE_USER_DOMAIN || 'https://mgltickets.com',
      siteName: 'MGLTickets',
      isPublicSite: true,
      defaultOgImage: 'https://mgltickets.com/og-default.png',
      twitterHandle: '@mgltickets',
      allowIndexing: true,
      showFooter: true,
      showPublicHeader: true,
    },
    organizer: {
      appType: 'organizer',
      siteUrl: import.meta.env.VITE_ORGANIZER_DOMAIN || 'https://organizer.mgltickets.com',
      siteName: 'MGLTickets Organizer',
      isPublicSite: false,
      defaultOgImage: 'https://organizer.mgltickets.com/og-default.png',
      twitterHandle: '@mgltickets',
      allowIndexing: false, // Never index
      showFooter: false,
      showPublicHeader: false,
    },
    admin: {
      appType: 'admin',
      siteUrl: import.meta.env.VITE_ADMIN_DOMAIN || 'https://admin.mgltickets.com',
      siteName: 'MGLTickets Admin',
      isPublicSite: false,
      defaultOgImage: 'https://admin.mgltickets.com/og-default.png',
      twitterHandle: '@mgltickets',
      allowIndexing: false, // Never index
      showFooter: false,
      showPublicHeader: false,
    },
  };

  return configs[appType];
}

// Export the current app configuration
export const APP_TYPE = detectAppType();
export const APP_CONFIG = getAppConfig(APP_TYPE);

// Helper functions
export const isUserPanel = () => APP_TYPE === 'user';
export const isOrganizerPanel = () => APP_TYPE === 'organizer';
export const isAdminPanel = () => APP_TYPE === 'admin';

// API Configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.mgltickets.com',
  timeout: 30000,
};

// Feature flags based on app type
export const FEATURES = {
  enablePublicEvents: isUserPanel(),
  enableOrganizerDashboard: isOrganizerPanel(),
  enableAdminPanel: isAdminPanel(),
  showFooter: APP_CONFIG.showFooter,
  showPublicHeader: APP_CONFIG.showPublicHeader,
};

// Development helpers
if (import.meta.env.DEV) {
  console.log('App Configuration:', {
    appType: APP_TYPE,
    hostname: window.location.hostname,
    port: window.location.port,
    config: APP_CONFIG,
  });
}

export default APP_CONFIG;