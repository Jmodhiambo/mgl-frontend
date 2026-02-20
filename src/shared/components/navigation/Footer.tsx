import React from 'react';
import { Calendar, MessageCircle } from 'lucide-react';

// Replace this with your actual Link component from your router
const Link: React.FC<{ to: string; children: React.ReactNode; className?: string }> = ({ to, children, className }) => (
  <a href={to} className={className}>{children}</a>
);

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">MGLTickets</span>
            </div>
            <p className="text-sm">Your trusted partner for event ticketing in Kenya.</p>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-orange-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-orange-500 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/press" className="hover:text-orange-500 transition-colors">
                  Press
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="hover:text-orange-500 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-orange-500 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-orange-500 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-orange-500 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-orange-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund" className="hover:text-orange-500 transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-orange-500 transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://twitter.com/mgltickets" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-orange-500 transition-colors"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a 
                  href="https://facebook.com/mgltickets" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-orange-500 transition-colors"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a 
                  href="https://instagram.com/mgltickets" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-orange-500 transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a 
                  href="https://wa.me/254799602055" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-orange-500 transition-colors flex items-center gap-1"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} MGLTickets. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;