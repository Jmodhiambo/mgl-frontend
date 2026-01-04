import React from 'react';
import { Briefcase, Heart, TrendingUp, Users, Zap, Coffee, Award, Globe, Mail, Send } from 'lucide-react';
import { CareersSEO } from '@shared/components/SEO';

const CareersPage: React.FC = () => {
  document.title = 'Careers - MGLTickets';
  const values = [
    {
      icon: Heart,
      title: 'Passion for Events',
      description: 'We love what we do and believe in the power of bringing people together through amazing experiences.'
    },
    {
      icon: TrendingUp,
      title: 'Growth Mindset',
      description: 'We encourage continuous learning, experimentation, and personal development for all team members.'
    },
    {
      icon: Users,
      title: 'Collaborative Spirit',
      description: 'We work together, support each other, and celebrate wins as a team.'
    },
    {
      icon: Zap,
      title: 'Innovation First',
      description: 'We embrace new ideas, challenge the status quo, and aren\'t afraid to take calculated risks.'
    },
  ];

  const perks = [
    {
      icon: Coffee,
      title: 'Flexible Work',
      description: 'Remote-friendly with flexible hours to support work-life balance'
    },
    {
      icon: TrendingUp,
      title: 'Career Growth',
      description: 'Clear career paths and opportunities for advancement'
    },
    {
      icon: Award,
      title: 'Competitive Pay',
      description: 'Market-competitive salaries and performance bonuses'
    },
    {
      icon: Users,
      title: 'Team Events',
      description: 'Regular team outings and access to amazing events'
    },
    {
      icon: Globe,
      title: 'Learning Budget',
      description: 'Professional development budget for courses and conferences'
    },
    {
      icon: Heart,
      title: 'Health Coverage',
      description: 'Comprehensive health insurance for you and your family'
    },
  ];

  // Currently not hiring - empty array
  const openPositions: any[] = [];

  return (
    <>
      <CareersSEO />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Team</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Help us revolutionize event ticketing in Kenya and make unforgettable experiences accessible to everyone
            </p>
          </div>

          {/* Mission Statement */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-8 md:p-12 mb-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Building the Future of Events</h2>
            <p className="text-xl leading-relaxed max-w-3xl mx-auto opacity-90">
              At MGLTickets, we're not just building a ticketing platform – we're creating connections, enabling experiences, and transforming how Kenyans discover and attend events. Join us in this exciting journey.
            </p>
          </div>

          {/* Our Values */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Benefits & Perks */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Benefits & Perks</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {perks.map((perk, index) => {
                const Icon = perk.icon;
                return (
                  <div key={index} className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{perk.title}</h3>
                    <p className="text-sm text-gray-600">{perk.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Open Positions */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Open Positions</h2>
            
            {openPositions.length > 0 ? (
              <div className="space-y-6">
                {openPositions.map((position, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{position.title}</h3>
                        <p className="text-gray-600 mb-3">{position.description}</p>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
                            {position.department}
                          </span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                            {position.location}
                          </span>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                            {position.type}
                          </span>
                        </div>
                      </div>
                      <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all whitespace-nowrap">
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Open Positions Right Now</h3>
                <p className="text-gray-600 mb-6">
                  We're not actively hiring at the moment, but we're always interested in hearing from talented individuals who share our passion.
                </p>
                <a
                  href="mailto:careers@mgltickets.com"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all"
                >
                  <Mail className="w-5 h-5" />
                  Send Us Your CV
                </a>
              </div>
            )}
          </div>

          {/* Life at MGLTickets */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Life at MGLTickets</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Working at MGLTickets means being part of a fast-growing startup that's making a real impact on Kenya's event industry. Our team is passionate, collaborative, and committed to excellence.
              </p>
              <p>
                We believe in creating an environment where everyone can do their best work. Whether you're working from our Nairobi office or remotely, you'll have the tools, support, and flexibility you need to succeed.
              </p>
              <p>
                We celebrate diversity and are committed to creating an inclusive workplace where everyone feels valued and respected. We welcome applications from all backgrounds and experiences.
              </p>
            </div>
          </div>

          {/* Hiring Process */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Hiring Process</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Application Review</h3>
                  <p className="text-gray-600">We carefully review all applications and respond within 1-2 weeks.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Initial Conversation</h3>
                  <p className="text-gray-600">A friendly chat with our team to learn more about you and share about the role.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Technical Assessment</h3>
                  <p className="text-gray-600">For technical roles, a practical assessment to showcase your skills.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Team Interviews</h3>
                  <p className="text-gray-600">Meet potential teammates and learn more about working at MGLTickets.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                  5
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Offer & Onboarding</h3>
                  <p className="text-gray-600">If it's a match, we'll make an offer and help you get started!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Spontaneous Application */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-lg p-8 md:p-12 text-white">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Don't See Your Dream Role?</h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                We're always looking for talented individuals who are passionate about events and technology. Send us your CV and tell us how you'd like to contribute to MGLTickets.
              </p>
              <a
                href="mailto:careers@mgltickets.com"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                <Send className="w-5 h-5" />
                Send Spontaneous Application
              </a>
              <div className="mt-6 pt-6 border-t border-white border-opacity-20">
                <p className="text-sm opacity-75">
                  Email: <a href="mailto:careers@mgltickets.com" className="underline hover:opacity-100">careers@mgltickets.com</a>
                </p>
              </div>
            </div>
          </div>

          {/* Equal Opportunity Statement */}
          <div className="mt-12 bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-gray-600 text-sm">
              MGLTickets is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees. We do not discriminate based on race, religion, color, national origin, gender, sexual orientation, age, marital status, veteran status, or disability status.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CareersPage;