import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-10">
      <div className="container mx-auto px-4">
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 border-b border-gray-700 pb-10">
          {/* Column 1: About Scriptly */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-2xl font-bold text-white mb-4">Scriptly</h3>
            <p className="text-sm leading-relaxed max-w-xs">
              A vibrant community dedicated to empowering developers through
              collaboration, learning, and impactful projects.
            </p>
            <div className="mt-4 flex space-x-4">
              {/* Social Media Icons (placeholders - replace '#' with actual links) */}
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Facebook"
              >
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.502 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33V22C17.657 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Twitter"
              >
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.45c-2.43.14-4.88-.03-7.3-.49a1 1 0 01-.84-1.12L1.8 4.79a1 1 0 011.13-.85c2.42.45 4.87.62 7.3.17a1 1 0 011.12.84L10.3 19.33a1 1 0 01-1.12.85zM22 5.81a.75.75 0 00-.75-.75h-2.113a.75.75 0 00-.75.75v1.278L16.29 8.217a.75.75 0 00-.064 1.066l1.246 1.488a.75.75 0 001.07.062l.85-.705c.162-.134.305-.285.43-.448a.75.75 0 00.126-.879L22 5.81zM15.42 16.03l-.44.02c-1.84.1-3.7-.02-5.52-.37a1 1 0 01-.94-1.07l.2-3.6a1 1 0 011.08-.94c1.83.1 3.68.22 5.51-.13a1 1 0 011.07.94l-.2 3.6a1 1 0 01-1.08.94z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M.05 4.764c0-.501.446-.931 1.011-.931H2.5c.565 0 1.012.43 1.012.931v15.011c0 .5-.447.93-.931 1.011h-1.5c-.565 0-1.012-.43-.931-1.011V4.764zm5.452 0c0-.501.446-.931 1.011-.931H18c.565 0 1.012.43 1.012.931v15.011c0 .5-.447.93-.931 1.011h-1.5c-.565 0-1.012-.43-.931-1.011V4.764zm-3.5 0a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.502 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33V22C17.657 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-xl font-semibold text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  to="/chapters"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Chapters
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Community Links */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-xl font-semibold text-white mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/dashboard"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/events/create"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Create Event
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/users"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Admin Panel
                </Link>
              </li>
              {/* You might add more specific links here based on roles */}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-xl font-semibold text-white mb-4">
              Contact Info
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-center md:justify-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                123 Code Street, Tech City, Indore, India
              </li>
              <li className="flex items-center justify-center md:justify-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-9 6h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <a
                  href="mailto:info@scriptlycommunity.com"
                  className="hover:underline"
                >
                  info@scriptlycommunity.com
                </a>
              </li>
              <li className="flex items-center justify-center md:justify-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <a href="tel:+911234567890" className="hover:underline">
                  +91 12345 67890
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyrights Section */}
        <div className="text-center text-gray-400 text-sm pt-6">
          <p>&copy; {currentYear} Scriptly Community. All rights reserved.</p>
          <p className="mt-2">
            Built with ❤️ using React, Node.js, MongoDB & Tailwind CSS.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
