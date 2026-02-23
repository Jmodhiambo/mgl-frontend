// src/shared/components/ENV.tsx - MGLTickets Shared Environment Configuration
// This file centralizes access to environment variables used across the MGLTickets frontend.

// Environment-general variables

// APP VERSION
export const APP_NAME = import.meta.env.VITE_APP_NAME;
export const APP_VERSION = import.meta.env.VITE_APP_VERSION;
export const BUILD_DATE = import.meta.env.VITE_BUILD_DATE;

// RECAPTCHA
export const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

// ANALYTICS
export const GTM_ID = import.meta.env.VITE_GTM_ID;
export const GA4_ID = import.meta.env.VITE_GA4_ID;

// FEATURE FLAGS
export const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS;
export const ENABLE_CHAT_WIDGET = import.meta.env.VITE_ENABLE_CHAT_WIDGET;
export const MAINTENANCE_MODE = import.meta.env.VITE_MAINTENANCE_MODE;

// SOCIAL MEDIA & CONTACT
export const TWITTER_HANDLE = import.meta.env.VITE_TWITTER_HANDLE;
export const FACEBOOK_PAGE = import.meta.env.VITE_FACEBOOK_PAGE_ID;
export const INSTAGRAM_HANDLE = import.meta.env.VITE_INSTAGRAM_HANDLE;
export const WHATSAPP_URL = import.meta.env.VITE_WHATSAPP_URL;
export const SUPPORT_PHONE_NUMBER = import.meta.env.VITE_SUPPORT_PHONE_NUMBER;

// EMAIL CONTACTS
export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL;
export const ORGANIZER_EMAIL = import.meta.env.VITE_ORGANIZER_EMAIL;
export const NO_REPLY_EMAIL = import.meta.env.VITE_NO_REPLY_EMAIL;
export const BILLING_EMAIL = import.meta.env.VITE_BILLING_EMAIL;
export const PRESS_EMAIL = import.meta.env.VITE_PRESS_EMAIL;
export const TECH_EMAIL = import.meta.env.VITE_TECH_SUPPORT_EMAIL;
export const PARTNERSHIP_EMAIL = import.meta.env.VITE_PARTNERSHIP_EMAIL;

// SEO
export const DEFAULT_OG_IMAGE = import.meta.env.VITE_DEFAULT_OG_IMAGE_URL;
export const SITE_NAME = import.meta.env.VITE_SITE_NAME;

// PAYMENT
export const MPESA_SHORTCODE = import.meta.env.VITE_MPESA_SHORTCODE;
export const MPESA_PASSKEY = import.meta.env.VITE_MPESA_PASSKEY;
export const MPESA_CALLBACK_URL = import.meta.env.VITE_MPESA_CALLBACK_URL;


// Environment-specific variables

// DOMAIN CONFIGURATION
export const USER_DOMAIN = import.meta.env.VITE_USER_DOMAIN;
export const ORGANIZER_DOMAIN = import.meta.env.VITE_ORGANIZER_DOMAIN;
export const ADMIN_DOMAIN = import.meta.env.VITE_ADMIN_DOMAIN;

// BASE URL
export const BASE_URL = import.meta.env.VITE_BASE_URL;

// API CONFIGURATION
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// DEBUG MODE
export const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE;