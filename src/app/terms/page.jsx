"use client"

import { useState } from "react"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-gray-400">Last Updated: June 5, 2025</p>
        </div>

        <div className="space-y-8 text-gray-300">
          <section>
            <p className="mb-4">
            Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the sublmnl-three.vercel.app website and its related services (the "Service") operated by Sublmnl ("us", "we", or "our")
            </p>
            <p className="mb-4">
            Your access to and use of the Service is conditioned upon your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who wish to access or use the Service.

            </p>
            <p className="mb-4">
            By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you do not have permission to access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">1. Service Description</h2>
            <p className="mb-4">
            Sublmnl provides a platform that allows users to create custom subliminal affirmation tracks by inputting their desires and goals, choosing background music, and generating audio files designed to influence the subconscious mind. The Service leverages "AI-Powered Affirmations" and "Neural Embedding Technology" to create these tracks.

            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">2. Accounts</h2>
            <p className="mb-4">
            When you create an account with us, you guarantee that you are above the age of 13 and that the information you provide is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on the Service.

            </p>
            <p className="mb-4">
            You are responsible for maintaining the confidentiality of your account and password, including but not limited to the restriction of access to your computer and/or account. You agree to accept responsibility for any and all activities or actions that occur under your account and/or password. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.

            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">3.  User-Generated Content (Your Desires & Affirmations)</h2>
            <p className="mb-4 font-semibold">Ownership:</p>
            <p className="mb-4">
            You retain all rights in and are solely responsible for the "desires" or "goals" and any other text or content you input into the Service to generate your custom subliminal audio ("User Content").
            </p>
            <p className="mb-4 font-semibold">License to Sublmnl:</p>
            <p className="mb-4">
            By inputting User Content, you grant Sublmnl a worldwide, non-exclusive, royalty-free, transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform your User Content solely for the purpose of operating, improving, and providing the Service (e.g., to generate your audio tracks, to enhance our AI models). This license explicitly permits the processing of your User Content to create the subliminal audio.
            </p>
            <p className="mb-4 font-semibold">Prohibited Content:</p>
            <p className="mb-4">You agree not to input any User Content that is:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically, or otherwise objectionable.</li>
              <li>Infringes any patent, trademark, trade secret, copyright, or other proprietary rights of any party.</li>
              <li>Contains software viruses or any other computer code, files, or programs designed to interrupt, destroy, or limit the functionality of any computer software or hardware or telecommunications equipment.
              </li>
              <li>False, misleading, or fraudulent.</li>
            </ul>
            <p className="mb-4 font-semibold">Disclaimer:</p>
            <p className="mb-4">
            Sublmnl does not endorse and has no control over any User Content. We are not responsible for any User Content and are not liable for any loss or damage of any kind incurred as a result of the use of any User Content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">4. Intellectual Property</h2>
            <p className="mb-4">
            The Service and its original content (excluding User Content), features, and functionality, including but not limited to text, graphics, logos, images, as well as the "AI-Powered Affirmations" and "Neural Embedding Technology", are and will remain the exclusive property of Sublmnl and its licensors. The Service is protected by copyright, trademark, and other laws of Canada and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Sublmnl.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">5. Generated Audio Tracks</h2>
            <p className="mb-4 font-semibold">License to User:</p>
            <p className="mb-4">
            Upon successful generation and payment (if applicable), you are granted a non-exclusive, non-transferable license to download and listen to your custom subliminal audio track for personal, non-commercial use.
            </p>
            <p className="mb-4 font-semibold">Restrictions:</p>
            <p className="mb-4">
            You may not redistribute, sell, publicly perform, or create derivative works from the generated audio tracks, except as expressly permitted by these Terms. "Unlimited Downloads" are for personal use only.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">6. Disclaimer of Warranties; Limitation of Liability</h2>
            <p className="mb-4 font-semibold">No Medical Advice:</p>
            <p className="mb-4">
            The Service is intended for personal development and manifestation support. It is not a substitute for professional medical, psychological, or psychiatric advice, diagnosis, or treatment. Always seek the advice of a qualified health provider with any questions you may have regarding a medical condition.
            </p>
            <p className="mb-4 font-semibold">No Guarantee of Results:</p>
            <p className="mb-4">
            Sublmnl asserts that "Manifestation works" and aims to help "make your dreams come true. Literally." and that "subliminal affirmations are powerful statements". However, we do not guarantee specific outcomes or results from the use of our Service. "Manifestation only works when you believe", and individual results may vary based on personal belief, effort, and other factors outside of our control. The Service is a tool to support your personal growth, not a guarantee of specific life changes.
            </p>
            <p className="mb-4 font-semibold">"AS IS" and "AS AVAILABLE" Basis:</p>
            <p className="mb-4">
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. Sublmnl makes no representations or warranties of any kind, express or implied, as to the operation of their Service, or the information, content or materials included therein.
            </p>
            <p className="mb-4 font-semibold">Limitation of Liability:</p>
            <p className="mb-4">
            In no event shall Sublmnl, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.

            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">7. Termination</h2>
            <p className="mb-4">
            We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms. If you wish to terminate your account, you may simply discontinue using the Service.

            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">8. Governing Law</h2>
            <p className="mb-4">
            These Terms shall be governed and construed in accordance with the laws of the Province of Ontario, Canada, without regard to its conflict of law provisions. This choice of law is made to provide a clear jurisdiction, but you should consult with a legal professional to confirm the most appropriate province.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">9. Changes to These Terms</h2>
            <p className="mb-4">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
            <p className="mb-4">
            By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.

            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">10. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about these Terms, please contact us:
              <br />
              <a href="mailto:hello@sublmnl.ca" className="text-[#b1d239] hover:text-[#b1d239]/80">
                hello@sublmnl.ca
              </a>
            </p>
          </section>
        </div>

        {/* <div className="mt-12 text-center">
          <Link 
            href="/auth" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-black bg-[#b1d239] hover:bg-[#b1d239]/80 transition-colors duration-200"
          >
            Return to Registration
          </Link>
        </div> */}
      </div>
    </div>
  )
}