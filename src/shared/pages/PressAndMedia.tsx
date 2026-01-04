import React from 'react';
import { Newspaper, Download, Mail, Award, TrendingUp, Users, Calendar, Image } from 'lucide-react';
import { PressSEO } from '@shared/components/SEO';

const PressPage: React.FC = () => {
  document.title = 'Press & Media - MGLTickets';

  const pressReleases = [
    {
      date: 'January 2025',
      title: 'MGLTickets Surpasses 500,000 Tickets Sold Milestone',
      excerpt: 'Leading Kenyan ticketing platform reaches major milestone, demonstrating strong growth in the local events industry.',
      link: '#'
    },
    {
      date: 'December 2024',
      title: 'MGLTickets Partners with Major Kenyan Venues',
      excerpt: 'Strategic partnerships expand platform reach across Kenya\'s premier event venues.',
      link: '#'
    },
    {
      date: 'November 2024',
      title: 'MGLTickets Launches Enhanced Mobile Experience',
      excerpt: 'New mobile features make ticket purchasing and management easier than ever for event-goers.',
      link: '#'
    },
  ];

  const achievements = [
    { icon: Users, value: '500K+', label: 'Tickets Sold' },
    { icon: Calendar, value: '10K+', label: 'Events Hosted' },
    { icon: TrendingUp, value: '2K+', label: 'Event Organizers' },
    { icon: Award, value: '99.9%', label: 'Uptime' },
  ];

  return (
    <>
      <PressSEO />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4">
              <Newspaper className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Press & Media</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              News, press releases, and media resources about MGLTickets
            </p>
          </div>

          {/* Company Overview */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">About MGLTickets</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                MGLTickets is Kenya's premier event ticketing platform, connecting event organizers with passionate audiences across the nation. Founded in 2024, we've quickly become the go-to solution for event ticketing, trusted by thousands of organizers and attendees.
              </p>
              <p>
                Our platform combines cutting-edge technology with local payment solutions like M-Pesa to provide a seamless ticketing experience. From small community gatherings to large-scale concerts and festivals, MGLTickets powers events of all sizes.
              </p>
              <p>
                We're committed to revolutionizing the event industry in Kenya by making ticketing accessible, secure, and user-friendly for everyone involved.
              </p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">By the Numbers</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <div key={index} className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="text-3xl font-bold text-orange-600 mb-1">{achievement.value}</div>
                    <p className="text-gray-600 text-sm">{achievement.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Press Releases */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Recent Press Releases</h2>
            <div className="space-y-6">
              {pressReleases.map((release, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-orange-600 font-medium mb-2">{release.date}</p>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{release.title}</h3>
                      <p className="text-gray-600 mb-4">{release.excerpt}</p>
                      <a
                        href={release.link}
                        className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                      >
                        Read full release →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Press Kit */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-8 md:p-12 mb-12 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">Press Kit</h2>
            </div>
            <p className="text-lg mb-8 opacity-90">
              Download our media assets, logos, and brand guidelines for use in your coverage.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <button className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2">
                <Image className="w-5 h-5" />
                Brand Logos
              </button>
              <button className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Company Photos
              </button>
              <button className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Brand Guidelines
              </button>
            </div>
            <div className="mt-8 pt-8 border-t border-white border-opacity-20">
              <p className="text-sm opacity-90">
                <strong>Usage Guidelines:</strong> Our logos and brand assets are provided for press and media use only. Please refer to our brand guidelines for proper usage. For any questions about asset usage, contact our press team.
              </p>
            </div>
          </div>

          {/* Company Facts */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Company Facts</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Founded</h3>
                <p className="text-gray-700">2024</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Headquarters</h3>
                <p className="text-gray-700">Nairobi, Kenya</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Industry</h3>
                <p className="text-gray-700">Event Technology, Ticketing</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Market Focus</h3>
                <p className="text-gray-700">Kenya, East Africa</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Key Services</h3>
                <p className="text-gray-700">Event Ticketing, Event Management, Payment Processing</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Payment Partners</h3>
                <p className="text-gray-700">M-Pesa, Safaricom</p>
              </div>
            </div>
          </div>

          {/* Leadership */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Leadership Team</h2>
            <p className="text-gray-700 mb-6">
              MGLTickets is led by a team of experienced professionals passionate about transforming the event industry in Kenya. For leadership bios and photos, please contact our press team.
            </p>
          </div>

          {/* Media Inquiries */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-lg p-8 md:p-12 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold">Media Inquiries</h2>
            </div>
            <p className="text-lg mb-8 opacity-90">
              For press inquiries, interview requests, or additional information, please contact our media relations team.
            </p>
            <div className="space-y-4">
              <div>
                <p className="font-semibold mb-1">Press Contact</p>
                <a href="mailto:press@mgltickets.com" className="text-orange-400 hover:text-orange-300">
                  press@mgltickets.com
                </a>
              </div>
              <div>
                <p className="font-semibold mb-1">Phone</p>
                <a href="tel:+254700000000" className="text-orange-400 hover:text-orange-300">
                  +254 700 000 000
                </a>
              </div>
              <div>
                <p className="font-semibold mb-1">Response Time</p>
                <p className="opacity-90">We typically respond to media inquiries within 24 hours during business days</p>
              </div>
            </div>
          </div>

          {/* Featured Coverage */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">As Featured In</h2>
            <div className="bg-white rounded-xl shadow-md p-8">
              <p className="text-center text-gray-600 mb-6">
                MGLTickets has been featured in leading Kenyan and East African publications
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-50">
                <div className="text-2xl font-bold text-gray-400">Media Logo 1</div>
                <div className="text-2xl font-bold text-gray-400">Media Logo 2</div>
                <div className="text-2xl font-bold text-gray-400">Media Logo 3</div>
                <div className="text-2xl font-bold text-gray-400">Media Logo 4</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PressPage;