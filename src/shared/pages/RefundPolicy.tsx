import React from 'react';
import { RefundSEO } from '@shared/components/SEO';
import { RefundContent } from '@shared/pages';

/**
 * RefundPolicy — full page wrapper.
 *
 * This file handles only page-level concerns:
 *   - SEO / document title
 *   - Background and layout chrome
 *
 * All actual policy copy lives in RefundContent.tsx.
 * To update the refund policy, edit RefundContent.tsx only.
 */
const RefundPolicy: React.FC = () => {
  document.title = 'Refund Policy - MGLTickets';

  return (
    <>
      <RefundSEO />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16">
        <RefundContent />
      </div>
    </>
  );
};

export default RefundPolicy;