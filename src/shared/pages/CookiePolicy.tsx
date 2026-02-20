import React from 'react';
import { CookieSEO } from '@shared/components/SEO';
import { CookieContent } from '@shared/pages';

/**
 * CookiePolicy — full page wrapper.
 *
 * This file handles only page-level concerns:
 *   - SEO / document title
 *   - Background and layout chrome
 *
 * All actual policy copy lives in CookieContent.tsx.
 * To update the cookie policy, edit CookieContent.tsx only.
 */
const CookiePolicy: React.FC = () => {
  document.title = 'Cookie Policy - MGLTickets';

  return (
    <>
      <CookieSEO />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16">
        <CookieContent />
      </div>
    </>
  );
};

export default CookiePolicy;