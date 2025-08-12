"use client"

import { useState } from "react"
import Link from "next/link"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-400">Last Updated: June 5, 2025</p>
        </div>

        <div className="space-y-8 text-gray-300">
          <section>
            <p className="mb-4">
            This Privacy Policy describes how Sublmnl ("we," "us," or "our") collects, uses, and discloses information when you use our website and services at sublmnl-three.vercel.app (the "Service")
            </p>
            <p className="mb-4">
            By accessing or using the Service, you agree to the collection, use, and disclosure of your information in accordance with this policy. We are committed to protecting the personal information of our users in compliance with applicable Canadian privacy laws, including the Personal Information Protection and Electronic Documents Act (PIPEDA).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">1. Information We Collect</h2>
            <p className="mb-4">We collect information to provide and improve our Service.</p>
            
            <p className="mb-4 font-semibold">Information You Provide to Us:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>
                <span className="font-semibold">Account Information:</span> When you create an account, we collect information such as your email address and a password.
              </li>
              <li>
                <span className="font-semibold">Desires and Affirmations:</span>  The core of our Service involves you inputting your "desires" or "goals" to create personalized subliminal audio tracks. This information, which may include sensitive personal details, is collected to generate your custom content.

              </li>
              <li>
                <span className="font-semibold">Payment Information:</span> If you purchase a track or subscription, our third-party payment processor (e.g., Stripe, PayPal) will collect your payment information (e.g., credit card details). We do not directly store your full payment card details on our servers.

              </li>
              <li>
                <span className="font-semibold">Communications:</span>When you contact us for support or inquiries, we collect the content of your communications and any contact information you provide.
              </li>
            </ul>

            <p className="mb-4 font-semibold">Information We Collect Automatically:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="font-semibold">Usage Data:</span> We collect information on how the Service is accessed and used ("Usage Data"). This may include your device's Internet Protocol (IP) address, browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers, and other diagnostic data.
              </li>
              <li>
                <span className="font-semibold">Cookies and Tracking Technologies:</span> We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. For more details, please refer to our {" "}
                <a href="/cookies"  rel="noopener noreferrer" className="text-[#b1d239] hover:text-[#b1d239]/80">
                Cookie Policy.
                </a>
                
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We use the collected information for various purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To Provide and Maintain the Service: Including processing your requests for custom subliminal audio tracks based on your inputted desires.</li>

              <li>To Manage Your Account: To allow you to access and manage your account and track your downloads.</li>

              <li>To Improve and Personalize the Service: To understand how users interact with our platform, optimize features, and offer a more tailored experience, including enhancing our "AI-Powered Affirmations" and "Neural Embedding Technology".</li>

              <li>For Analytics and Performance: To monitor the usage of our Service and gather valuable analytics to improve our offerings.</li>

              <li>To Communicate with You: To send you service-related notifications, updates, and respond to your inquiries.</li>

              <li>For Security: To detect, prevent, and address technical issues or fraudulent activity.</li>

              <li>For Legal Compliance: To comply with legal obligations and enforce our{" "}
              <a href="/terms"  rel="noopener noreferrer" className="text-[#b1d239] hover:text-[#b1d239]/80">
              Terms of Service.
                </a>
                 </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">3. Sharing Your Information</h2>
            <p className="mb-4">We do not sell your personal information. We may share your information in the following situations:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="font-semibold">With Service Providers:</span>We may employ third-party companies and individuals to facilitate our Service (e.g., payment processors, hosting providers, analytics providers). These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
              </li>
              <li>
                <span className="font-semibold">For Business Transfers:</span>  If Sublmnl is involved in a merger, acquisition, or asset sale, your Personal Data may be transferred. We will provide notice before your Personal Data is transferred and becomes subject to a different Privacy Policy.
              </li>
              <li>
                <span className="font-semibold">For Legal Reasons:</span>We may disclose your Personal Data in the good faith belief that such action is necessary to :
                <ul className="list-disc pl-6 space-y-2">
                    <li>Comply with a legal obligation.</li>
                    <li>Protect and defend the rights or property of Sublmnl.</li>
                    <li>Prevent or investigate possible wrongdoing in connection with the Service.</li>
                    <li>Protect the personal safety of users of the Service or the public.</li>
                    <li>Protect against legal liability.</li>
                </ul>
              </li>
              <li>
                <span className="font-semibold">Aggregated or Anonymized Data:</span> We may share aggregated or anonymized information that does not directly identify you with third parties for research, marketing, analytics, or other purposes.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">4. Data Related to Your Desires and Affirmations</h2>
            <p className="mb-4">
            The information you provide regarding your "desires" or "goals" for creating subliminal affirmations is handled with utmost care. While we use this data to generate your personalized audio, we take measures to protect its privacy. We will not share this specific content with third parties in a way that directly identifies you or your specific desires, except as necessary to provide the Service (e.g., processing through our AI models) or as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">5. Data Security</h2>
            <p className="mb-4">
            The security of your data is important to us. We strive to use commercially acceptable means to protect your Personal Data. However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we endeavor to protect your "Secure & Private" information, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">6. International Data Transfer</h2>
            <p className="mb-4">
            Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your province, territory, or country where the data protection laws may differ from those from your jurisdiction. If you are located outside Canada and choose to provide information to us, please note that we transfer the data, including Personal Data, to Canada and process it there. Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer. PIPEDA allows for international data transfers, provided that the organization ensures comparable protection through contracts or other means.

            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">7. Your Data Protection Rights (Under PIPEDA)</h2>
            <p className="mb-4">Under PIPEDA, you have specific rights concerning your personal information. These may include:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>The right to access</strong> The right to access your personal information held by an organization, subject to limited exceptions.</li>
              <li><strong>The right to correct</strong> inaccuracies in your personal information.</li>
              <li><strong>The right to withdraw consent</strong> to the collection, use, or disclosure of your personal information, subject to legal or contractual restrictions and reasonable notice.</li>
              <li><strong>The right to be informed</strong> of the purposes for which your personal information is being collected, used, and disclosed.</li>
            </ul>
            <p className="mb-4">To exercise any of these rights, please contact us using the details below. We are required to respond to a request for access to personal information in writing within 30 days of receipt of the request.

            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">8. Children's Privacy</h2>
            <p className="mb-4">
            Our Service is not intended for individuals under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from children without verification of parental consent, we will take steps to remove that information from our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">9. Changes to This Privacy Policy</h2>
            <p className="mb-4">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">10. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us:
              <br />
              <a href="mailto:hello@sublmnl.ca" className="text-[#b1d239] hover:text-[#b1d239]/80">
                hello@sublmnl.ca
              </a>
            </p>
          </section>
        </div>

      </div>
    </div>
  )
}