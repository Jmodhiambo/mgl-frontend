import React from 'react';
import { TermsSEO } from '@shared/components/SEO';
import TermsContent from './TermsContent';

/**
 * TermsOfService — full page wrapper.
 *
 * This file handles only page-level concerns:
 *   - SEO / document title
 *   - Background and layout chrome
 *
 * All actual legal copy lives in TermsContent.tsx.
 * To update the terms, edit TermsContent.tsx only.
 */
const TermsOfService: React.FC = () => {
  document.title = 'Terms of Service - MGLTickets';

  return (
    <>
      <TermsSEO />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16">
        <TermsContent />
      </div>
    </>
  );
};

export default TermsOfService;