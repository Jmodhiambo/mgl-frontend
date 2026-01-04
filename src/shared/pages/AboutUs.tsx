import React from 'react';
import { Calendar, Users, Target, Heart, Award, TrendingUp, Globe, Shield } from 'lucide-react';
import { AboutSEO } from '@shared/components/SEO';

const AboutUs: React.FC = () => {
  document.title = 'About Us - MGLTickets';
  return (
    <>
      <AboutSEO />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-6">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">About MGLTickets</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Kenya's premier event ticketing platform, connecting event organizers with passionate audiences across the nation.
            </p>
          </div>

          {/* Mission Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              At MGLTickets, we're on a mission to revolutionize event ticketing in Kenya. We believe that attending events should be seamless, secure, and enjoyable from start to finish. Our platform empowers event organizers to reach wider audiences while providing attendees with a trusted, user-friendly way to discover and book tickets for the experiences they love.
            </p>
          </div>

          {/* Story Section */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-8 md:p-12 mb-12 text-white">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-lg leading-relaxed">
              <p>
                MGLTickets was born from a simple observation: event ticketing in Kenya needed to be better. Too often, event organizers struggled with manual processes, while attendees faced uncertainty about ticket authenticity and payment security.
              </p>
              <p>
                Founded in 2024, we set out to bridge this gap by creating a platform that serves both sides of the equation. Today, we're proud to be Kenya's fastest-growing event ticketing solution, trusted by thousands of organizers and attendees alike.
              </p>
              <p>
                From small community gatherings to large-scale concerts and festivals, MGLTickets powers events of all sizes, making it easier than ever to bring people together for unforgettable experiences.
              </p>
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Trust</h3>
                <p className="text-gray-600 text-sm">
                  Security and transparency in every transaction, building confidence for organizers and attendees.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Innovation</h3>
                <p className="text-gray-600 text-sm">
                  Constantly evolving our platform with cutting-edge features and seamless user experiences.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Community</h3>
                <p className="text-gray-600 text-sm">
                  Supporting Kenya's vibrant event ecosystem and fostering connections that matter.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Excellence</h3>
                <p className="text-gray-600 text-sm">
                  Delivering exceptional service and support at every touchpoint of your event journey.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Our Impact</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">10K+</div>
                <p className="text-gray-600">Events Hosted</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">500K+</div>
                <p className="text-gray-600">Tickets Sold</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">2K+</div>
                <p className="text-gray-600">Event Organizers</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">99.9%</div>
                <p className="text-gray-600">Uptime</p>
              </div>
            </div>
          </div>

          {/* What We Offer */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">What We Offer</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-md p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">For Event Organizers</h3>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Easy event creation and management dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Secure payment processing via M-Pesa</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Real-time sales analytics and reporting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Ticket verification and attendee management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Marketing and promotional tools</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-md p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">For Event Attendees</h3>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Discover exciting events happening near you</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Secure and convenient mobile ticketing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Instant ticket delivery to your email and account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Easy ticket management and sharing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Customer support when you need it</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Why Choose MGLTickets?</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Globe className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Local Expertise</h3>
                  <p className="text-gray-700">
                    Built specifically for the Kenyan market, we understand the unique needs of local event organizers and attendees. Our platform integrates seamlessly with M-Pesa and other local payment methods.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Shield className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Security First</h3>
                  <p className="text-gray-700">
                    Every ticket comes with a unique QR code for verification. Our platform uses industry-standard encryption to protect your data and transactions, giving you peace of mind.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Exceptional Support</h3>
                  <p className="text-gray-700">
                    Our dedicated support team is always ready to help. Whether you're an organizer setting up your first event or an attendee with a question, we're here for you.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Continuous Innovation</h3>
                  <p className="text-gray-700">
                    We're constantly improving our platform based on user feedback and emerging technologies. With MGLTickets, you're always getting the latest and greatest in event ticketing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Join the MGLTickets Community</h2>
            <p className="text-xl mb-8 opacity-90">
              Whether you're hosting an event or looking for your next experience, we're here to make it happen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="bg-white text-orange-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-orange-50 transition-colors"
              >
                Get Started Today
              </a>
              <a
                href="/contact"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-orange-600 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutUs;