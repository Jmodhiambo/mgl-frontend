// src/shared/articles/help/organizers/event-marketing-tools.tsx
import React from 'react';
import { Share2, Link2, Image, Info } from 'lucide-react';

const EventMarketingTools: React.FC = () => {
  return (
    <article className="prose prose-lg max-w-none">
      <p className="text-gray-700 leading-relaxed mb-6">
        Getting your event in front of the right people matters as much as setting it up well.
        Here's what MGLTickets gives you to help promote it.
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Link2 className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Your Event's Direct Link</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Every event gets its own shareable link the moment it's published. Share it directly
          on WhatsApp, social media, or your own website — anyone who clicks it lands straight on
          your event page ready to buy.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Image className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">A Strong Cover Image</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Your event's cover image is the first thing people see, whether on the homepage,
          category listings, or a shared link preview. A clear, high-quality image goes a long
          way toward getting clicks.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Share2 className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 m-0">Discoverability on MGLTickets</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Beyond your own promotion, your event is automatically listed in its category and
          shows up in relevant searches. Events with strong early sales are more likely to
          surface in "Featured Events" on the homepage.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm m-0">
            A complete, well-written event description — including what's included in each
            ticket type — tends to convert better than a sparse one, since it answers buyers'
            questions before they even ask.
          </p>
        </div>
      </div>
    </article>
  );
};

export default EventMarketingTools;