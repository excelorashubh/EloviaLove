import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Instagram, Twitter, Facebook, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 pt-20 pb-10 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8 mb-16">
          <div className="md:col-span-1 border-r border-slate-800 pr-8">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="bg-gradient-to-tr from-primary-500 to-pink-500 text-white p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                <Heart size={20} fill="currentColor" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white hover:text-pink-400 transition-colors">
                Elovia Love
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-8">
              Finding real connections in a digital world. Join thousands of happy couples who found love on Elovia Love.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/reel/DWMPilFEa7M/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-slate-800 hover:bg-primary-600 hover:text-white transition-all text-slate-400"
              >
                <Instagram size={18} />
              </a>
              <a href="#" className="p-2 rounded-full bg-slate-800 hover:bg-blue-500 hover:text-white transition-all text-slate-400">
                <Twitter size={18} />
              </a>
              <a href="#" className="p-2 rounded-full bg-slate-800 hover:bg-blue-600 hover:text-white transition-all text-slate-400">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Safety Hub</h3>
            <ul className="space-y-4">
              <li><Link to="/safety" className="text-sm hover:text-primary-400 transition-colors">Safety Overview</Link></li>
              <li><Link to="/how-verification-works" className="text-sm hover:text-primary-400 transition-colors">How Verification Works</Link></li>
              <li><Link to="/online-dating-safety-india" className="text-sm hover:text-primary-400 transition-colors">Dating Safety India</Link></li>
              <li><Link to="/report-abuse" className="text-sm hover:text-primary-400 transition-colors">Report Abuse</Link></li>
              <li><Link to="/community-guidelines" className="text-sm hover:text-primary-400 transition-colors">Guidelines</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Dating in India</h3>
            <ul className="space-y-4">
              <li><Link to="/dating-in-delhi" className="text-sm hover:text-primary-400 transition-colors">Dating in Delhi</Link></li>
              <li><Link to="/dating-in-mumbai" className="text-sm hover:text-primary-400 transition-colors">Dating in Mumbai</Link></li>
              <li><Link to="/dating-in-bangalore" className="text-sm hover:text-primary-400 transition-colors">Dating in Bangalore</Link></li>
              <li><Link to="/dating-in-kolkata" className="text-sm hover:text-primary-400 transition-colors">Dating in Kolkata</Link></li>
              <li><Link to="/dating-in-ranchi" className="text-sm hover:text-primary-400 transition-colors">Dating in Ranchi</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Resources</h3>
            <ul className="space-y-4">
              <li><Link to="/blog" className="text-sm hover:text-primary-400 transition-colors">Dating Blog</Link></li>
              <li><Link to="/pricing" className="text-sm hover:text-primary-400 transition-colors">Premium Plans</Link></li>
              <li><Link to="/faq" className="text-sm hover:text-primary-400 transition-colors">FAQ</Link></li>
              <li><Link to="/privacy" className="text-sm hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm hover:text-primary-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            © {new Date().getFullYear()} Elovia Love. Made with <Heart size={14} className="text-pink-500" fill="currentColor" /> for love.
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Sparkles size={14} className="text-primary-400" /> All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
