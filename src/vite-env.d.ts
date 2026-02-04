/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Shared .env variables
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_BUILD_DATE: string;
  readonly VITE_RECAPTCHA_SITE_KEY: string;
  readonly VITE_GTM_ID: string;
  readonly VITE_GA4_ID: string;
  readonly VITE_ENABLE_ANALYTICS: boolean;
  readonly VITE_ENABLE_CHAT_WIDGET: boolean;
  readonly VITE_MAINTENANCE_MODE: boolean;
  readonly VITE_TWITTER_HANDLE: string;
  readonly VITE_FACEBOOK_PAGE_ID: string;
  readonly VITE_INSTAGRAM_HANDLE: string;
  readonly VITE_WHATSAPP_NUMBER: string;
  readonly VITE_DEFAULT_OG_IMAGE: string;
  readonly VITE_SITE_NAME: string;
  readonly VITE_MPESA_SHORTCODE: string;
  readonly VITE_MPESA_PASSKEY: string;

  // Mode-specific .env variables
  readonly VITE_API_URL: string;
  readonly VITE_BASE_URL: string;
  readonly VITE_USER_DOMAIN: string;
  readonly VITE_ORGANIZER_DOMAIN: string;
  readonly VITE_ADMIN_DOMAIN: string;
  readonly VITE_USER_BASE_PATH: string;
  readonly VITE_ORGANIZER_BASE_PATH: string;
  readonly VITE_ADMIN_BASE_PATH: string;
  readonly VITE_ENABLE_DEBUG: boolean;
  // Add other VITE_ prefixed env variables here as are added to the .env file and use them
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}