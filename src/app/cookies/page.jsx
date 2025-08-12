"use client"

import { useState } from "react"
import Link from "next/link"

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Cookie Policy</h1>
          <p className="text-gray-400">Last Updated: June 5, 2025</p>
        </div>

        <div className="space-y-8 text-gray-300">
          <section>
            <p className="mb-4">
            This Cookie Policy explains what cookies are, how Sublmnl ("we," "us," or "our") uses them on our website and services at sublmnl-three.vercel.app (the "Service"), and your choices regarding cookies. We adhere to Canadian privacy laws, including PIPEDA and Canada's Anti-Spam Legislation (CASL), concerning the use of cookies and similar technologies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">1. What are Cookies?</h2>
            <p className="mb-4">
            Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently, as well as to provide reporting information and to remember information about you, such as your login details or preferences.
            </p>
            <p className="mb-4">
            Cookies can be "persistent" or "session" cookies. Persistent cookies remain on your personal computer or mobile device when you go offline, while session cookies are deleted as soon as you close your web browser.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">2. How We Use Cookies</h2>
            <p className="mb-4">We use cookies for several purposes to enhance your experience and provide our Service:</p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-2">Strictly Necessary Cookies:</h3>
                <p>
                These cookies are essential for the operation of our Service. They enable you to log into secure areas, process your requests (e.g., generating audio tracks), and navigate our Website effectively. Without these cookies, the Service would not function correctly.
                </p>
              </div>

              <div>
                <h3 className="font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-2">Analytical/Performance Cookies:</h3>
                <p>
                These cookies collect information about how visitors use our Service, such as which pages are visited most often, the duration of visits, and if users encounter error messages. This information is aggregated and anonymous and helps us understand and improve the performance and usability of our Service.
                </p>
                <p className="mt-2 italic">
                  Example: We may use services like Google Analytics to help us understand web traffic and user engagement. Google Analytics uses cookies to collect anonymous information like your IP address, browser type, and pages visited.
                </p>
              </div>

              <div>
                <h3 className="font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-2">Functionality Cookies:</h3>
                <p>
                These cookies allow our Service to remember choices you make (such as your username, language, or region) and provide enhanced, more personalized features. They can also be used to remember changes you have made to text size, fonts, and other parts of web pages that you can customize.
                </p>
              </div>

              <div>
                <h3 className="font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-2">Session Cookies:</h3>
                <p>
                We use Session Cookies to operate our Service and maintain your session state, for example, while you are generating a custom track.
                </p>
              </div>

              <div>
                <h3 className="font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-2">Preference Cookies:</h3>
                <p>
                We use Preference Cookies to remember your preferences and various settings.

                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">3. Third-Party Cookies</h2>
            <p className="mb-4">
            In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the Service, deliver advertisements on and through the Service, and so on. These third-party cookies may be set by services integrated into our platform, such as:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="font-semibold">Payment Processors:</span> If you make a purchase, our payment gateway provider may set cookies for transactional security and processing.
              </li>
              <li>
                <span className="font-semibold">Embedded Content:</span> If we embed content from other websites (e.g., YouTube for videos in tutorials), those sites may set their own cookies.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">4. Your Choices Regarding Cookies and Consent</h2>
            <p className="mb-4">
            Under Canadian law, especially PIPEDA and CASL, we are required to obtain meaningful consent for the collection, use, and disclosure of personal information, including through cookies. This means:
            </p>

            <p className="mb-4 font-semibold">Clear Information:</p>
            <p className="mb-4"> We must provide clear information about cookies at the time of collection, which should not be simply buried in our general Privacy Policy.</p>

            <p className="mb-4 font-semibold">Opt-out Option:</p>
            <p className="mb-4">You must be provided with a way to opt-out of cookies, and this opt-out should take effect immediately.</p>

            <p className="mb-4 font-semibold">Browser Settings:</p>
            <p className="mb-4">You can typically configure your web browser to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Block all cookies.</li>
              <li>Block only third-party cookies.</li>
              <li>Alert you when a cookie is being sent.</li>
              <li>Delete all cookies when you close your browser.</li>
            </ul>
            <p className="my-4">
            Please note that if you disable cookies, some features and functionalities of our Service may not function properly or may be limited. The methods for managing cookies vary depending on the browser you use. You can usually find these settings in your browser's "Options" or "Preferences" menu.
            </p>
            <p className="mb-4 font-semibold">Google Analytics Opt-out:</p>
            <p className="mb-4">If we use Google Analytics, you can opt-out of Google Analytics tracking by installing the Google Analytics opt-out browser add-on, which prevents Google Analytics JavaScript (ga.js, analytics.js, and dc.js) from sharing information with Google Analytics about visits activity.</p>
            <p className="mb-4 font-semibold">Demonstrable Consent:</p>
            <p className="mb-4">We must be able to prove your consent for cookie usage, and this information should be properly recorded and stored.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">5. More Information About Cookies</h2>
            <p className="mb-4">To learn more about cookies, including how to see what cookies have been set and how to manage and delete them, visit:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-[#b1d239] hover:text-[#b1d239]/80">
                  www.allaboutcookies.org
                </a>
              </li>
              <li>
                <a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer" className="text-[#b1d239] hover:text-[#b1d239]/80">
                  www.youronlinechoices.eu
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">6. Changes to This Cookie Policy</h2>
            <p className="mb-4">
            We may update our Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page and updating the "Last Updated" date. You are advised to review this Cookie Policy periodically for any changes. Changes to this Cookie Policy are effective when they are posted on this page.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}