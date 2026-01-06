import React, { useEffect } from 'react';
import APP_CONFIG from '@shared/config/app.config';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonicalUrl?: string;
  noindex?: boolean;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  canonicalUrl,
  noindex,
  author,
  publishedTime,
  modifiedTime,
}) => {
  // Auto-detect defaults based on app type
  const finalOgImage = ogImage || APP_CONFIG.defaultOgImage;
  const finalNoindex = noindex !== undefined ? noindex : !APP_CONFIG.allowIndexing;
  const fullTitle = `${title} | ${APP_CONFIG.siteName}`;
  const canonical = canonicalUrl || `${APP_CONFIG.siteUrl}${window.location.pathname}`;

  useEffect(() => {
    // Set document title
    document.title = fullTitle;

    // Helper function to set or update meta tag
    const setMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Helper function to set link tag
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      
      element.href = href;
    };

    // Primary Meta Tags
    setMetaTag('title', fullTitle);
    setMetaTag('description', description);
    if (keywords) setMetaTag('keywords', keywords);
    if (author) setMetaTag('author', author);

    // Canonical URL
    setLinkTag('canonical', canonical);

    // Robots - Force noindex for non-public sites
    if (finalNoindex) {
      setMetaTag('robots', 'noindex, nofollow');
    } else {
      // Remove noindex if it exists
      const robotsMeta = document.querySelector('meta[name="robots"]');
      if (robotsMeta?.getAttribute('content')?.includes('noindex')) {
        robotsMeta.remove();
      }
    }

    // Open Graph / Facebook
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:url', canonical, true);
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', finalOgImage, true);
    setMetaTag('og:site_name', APP_CONFIG.siteName, true);
    setMetaTag('og:locale', 'en_KE', true);

    // Article specific tags
    if (publishedTime) setMetaTag('article:published_time', publishedTime, true);
    if (modifiedTime) setMetaTag('article:modified_time', modifiedTime, true);
    if (author) setMetaTag('article:author', author, true);

    // Twitter
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:url', canonical);
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', finalOgImage);
    setMetaTag('twitter:site', APP_CONFIG.twitterHandle);
    setMetaTag('twitter:creator', APP_CONFIG.twitterHandle);

    // Additional Meta Tags (set once, don't update on every page)
    if (!document.querySelector('meta[name="viewport"]')) {
      setMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    }
    if (!document.querySelector('meta[http-equiv="Content-Type"]')) {
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'Content-Type');
      meta.setAttribute('content', 'text/html; charset=utf-8');
      document.head.appendChild(meta);
    }
    setMetaTag('language', 'English');
    setMetaTag('geo.region', 'KE');
    setMetaTag('geo.placename', 'Nairobi');

  }, [fullTitle, description, keywords, canonical, finalOgImage, ogType, finalNoindex, author, publishedTime, modifiedTime]);

  return null; // This component doesn't render anything
};

export default SEO;

// ============================================
// Pre-configured SEO Components
// ============================================

export const HomeSEO: React.FC = () => (
  <SEO
    title="Book Event Tickets Online"
    description="Discover and book tickets for the best events in Kenya. Secure ticketing platform with M-Pesa payment. Browse concerts, festivals, sports, and more."
    keywords="event tickets Kenya, book tickets online, Kenya events, concerts Kenya, M-Pesa tickets, Nairobi events"
  />
);

export const DashboardSEO: React.FC = () => (
  <SEO
    title="User Dashboard - MGLTickets"
    description="Manage your profile, preferences, and notifications on MGLTickets. Access your digital tickets and QR codes for entry to events. Secure ticketing platform with M-Pesa payment."
    keywords="event tickets Kenya, book tickets online, Kenya events, concerts Kenya, M-Pesa tickets, Nairobi events"
  />
);

export const EventSEO: React.FC = () => (
  <SEO
    title="Book Event Tickets Online"
    description="Discover and book tickets for the best events in Kenya. Secure ticketing platform with M-Pesa payment. Browse concerts, festivals, sports, and more."
    keywords="event tickets Kenya, book tickets online, Kenya events, concerts Kenya, M-Pesa tickets, Nairobi events"
  />
);

export const BookingSEO: React.FC = () => (
  <SEO
    title="Buy Event Tickets Online"
    description="View your ticket bookings and manage your upcoming event attendance. Secure ticketing platform with M-Pesa payment on MGLTickets."
    keywords="event tickets Kenya, book tickets online, Kenya events, concerts Kenya, M-Pesa tickets, Nairobi events"
    noindex={true}
  />
);

export const ProfileSEO: React.FC = () => (
  <SEO
    title="User Profile - MGLTickets"
    description="Manage your profile, preferences, and notifications on MGLTickets. Access your digital tickets and QR codes for entry to events. Secure ticketing platform with M-Pesa payment."
    keywords="event tickets Kenya, book tickets online, Kenya events, concerts Kenya, M-Pesa tickets, Nairobi events"
    noindex={true}
  />
);

export const OrganizerProfileSEO: React.FC = () => (
  <SEO
    title="Setup Organizer Profile - MGLTickets"
    description="Create and manage your event organizer profile on MGLTickets. Connect with audiences and sell tickets for your events in Kenya."
    keywords="event tickets Kenya, book tickets online, Kenya events, concerts Kenya, M-Pesa tickets, Nairobi events"
    noindex={true}
  />
);

export const CheckoutSEO: React.FC = () => (
  <SEO
    title="Checkout - MGLTickets"
    description="Complete your ticket purchase securely on MGLTickets. Pay with M-Pesa and get instant access to your event tickets."
    keywords="event tickets Kenya, book tickets online, Kenya events, concerts Kenya, M-Pesa tickets, Nairobi events"
    noindex={true}
  />
);

export const MyEventsSEO: React.FC = () => (
  <SEO
    title="My Events - MGLTickets"
    description="View your favorites, co-organizing and organizing events on MGLTickets. Manage your event listings and ticket sales easily. Secure ticketing platform with M-Pesa payment."
    keywords="event tickets Kenya, book tickets online, Kenya events, concerts Kenya, M-Pesa tickets, Nairobi events"
    noindex={true}
  />
);

export const MyTicketsSEO: React.FC = () => (
  <SEO
    title="Buy Event Tickets Online"
    description="Access your digital tickets and QR codes for entry to events. Manage your bookings easily on MGLTickets. Secure ticketing platform with M-Pesa payment."
    keywords="event tickets Kenya, book tickets online, Kenya events, concerts Kenya, M-Pesa tickets, Nairobi events"
    noindex={true}
  />
);

export const AboutSEO: React.FC = () => (
  <SEO
    title="About Us"
    description="Learn about MGLTickets - Kenya's leading event ticketing platform. Discover our mission to connect event organizers with passionate audiences."
    keywords="about MGLTickets, event ticketing Kenya, ticket platform"
  />
);

export const ContactSEO: React.FC = () => (
  <SEO
    title="Contact Us"
    description="Get in touch with MGLTickets support team. Email, phone, or WhatsApp support available. We're here to help with your ticketing needs."
    keywords="contact MGLTickets, customer support, help, ticket support Kenya"
  />
);

export const FAQSEO: React.FC = () => (
  <SEO
    title="Frequently Asked Questions"
    description="Find answers to common questions about buying tickets, payments, refunds, and event attendance on MGLTickets."
    keywords="MGLTickets FAQ, ticket help, event questions, refund policy, payment help"
  />
);

export const HelpCenterSEO: React.FC = () => (
  <SEO
    title="Help Center"
    description="Browse our comprehensive help center for guides on buying tickets, managing bookings, payments, and more. Get help with MGLTickets."
    keywords="MGLTickets help, ticket guide, how to buy tickets, payment help, booking help"
  />
);

export const PrivacySEO: React.FC = () => (
  <SEO
    title="Privacy Policy"
    description="Read MGLTickets privacy policy. Learn how we collect, use, and protect your personal information."
    keywords="privacy policy, data protection, personal information"
  />
);

export const TermsSEO: React.FC = () => (
  <SEO
    title="Terms of Service"
    description="Review MGLTickets terms of service. Understand your rights and responsibilities when using our platform."
    keywords="terms of service, user agreement, terms and conditions"
  />
);

export const RefundSEO: React.FC = () => (
  <SEO
    title="Refund Policy"
    description="Understand MGLTickets refund policy. Learn about eligibility, process, and timelines for ticket refunds."
    keywords="refund policy, ticket refund, cancellation policy, money back"
  />
);

export const CareersSEO: React.FC = () => (
  <SEO
    title="Careers - Join Our Team"
    description="Explore career opportunities at MGLTickets. Join us in revolutionizing event ticketing in Kenya."
    keywords="MGLTickets careers, jobs Kenya, event tech jobs, startup jobs Nairobi"
  />
);

export const PressSEO: React.FC = () => (
  <SEO
    title="Press & Media"
    description="MGLTickets press releases, media kit, and company information. Get the latest news about Kenya's leading ticketing platform."
    keywords="MGLTickets press, media kit, press releases, company news"
  />
);

export const NotFoundSEO: React.FC = () => (
  <SEO
    title="Page Not Found - 404"
    description="The page you're looking for doesn't exist. Browse our events or return to the homepage."
    noindex={true}
  />
);

export const LoginSEO: React.FC = () => (
  <SEO
    title="Login to MGLTickets"
    description="Sign in to your MGLTickets account to access your event bookings and manage your profile."
    keywords="MGLTickets login, event bookings, account management"
    noindex={true}
  />
);

export const RegisterSEO: React.FC = () => (
  <SEO
    title="Register for MGLTickets"
    description="Create a new MGLTickets account to start booking events and manage your profile."
    keywords="MGLTickets registration, event bookings, account management"
    noindex={true}
  />
);