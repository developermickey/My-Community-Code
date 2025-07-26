import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer class="bg-gray-100 dark:bg-[#161B22] text-gray-700 dark:text-gray-400">
      <div class="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 class="font-bold mb-4">About</h3>
          <ul class="space-y-2">
            <li>
              <a href="#" class="hover:text-primary">
                Our Story
              </a>
            </li>
            <li>
              <a href="#" class="hover:text-primary">
                Team
              </a>
            </li>
            <li>
              <a href="#" class="hover:text-primary">
                Careers
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 class="font-bold mb-4">Privacy Policy</h3>
          <ul class="space-y-2">
            <li>
              <a href="#" class="hover:text-primary">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" class="hover:text-primary">
                Cookie Policy
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 class="font-bold mb-4">Quick Info</h3>
          <ul class="space-y-2">
            <li>
              <a href="#" class="hover:text-primary">
                FAQs
              </a>
            </li>
            <li>
              <a href="#" class="hover:text-primary">
                Support
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 class="font-bold mb-4">Join Our Newsletter</h3>
          <form class="flex flex-col">
            <input
              type="email"
              placeholder="Your email"
              class="p-2 mb-2 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
            />
            <button class="px-4 py-2 text-white rounded bg-blue-700">
              Subscribe
            </button>
          </form>
        </div>
      </div>
      <div class="flex flex-col md:flex-row justify-between items-center px-4 py-6 border-t border-gray-300 dark:border-gray-700 max-w-7xl mx-auto">
        <p>&copy; {currentYear} Scriptly. All rights reserved.</p>
        <div class="flex space-x-4 mt-4 md:mt-0">
          <a href="#" class="hover:text-primary">
            Twitter
          </a>
          <a href="#" class="hover:text-primary">
            LinkedIn
          </a>
          <a href="#" class="hover:text-primary">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
