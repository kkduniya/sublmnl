"use client"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-400">Last Updated: August 26, 2025</p>
        </div>

        <div className="space-y-8 text-gray-300">
          <section>
            <p className="mb-4">
              This Privacy Policy describes how Sublmnl ("we," "us," or "our") collects, uses, and discloses information when you use our website and services at {" "}
              <a href="https://sublmnl.ca/" target="_blank" rel="noopener noreferrer" className="text-[#b1d239] hover:text-[#b1d239]/80">https://sublmnl.ca/</a>
              {" "}(the “Service").
            </p>
            <p className="mb-4">
              By accessing or using the Service, you agree to the collection, use, and disclosure of your information in accordance with this policy.
            </p>
            <p className="mb-4">
              We are committed to protecting the personal information of our users in compliance with applicable privacy laws, including Canada’s Personal Information Protection and Electronic Documents Act (PIPEDA), the European Union’s General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA), Quebec’s Law 25, and other applicable international data protection regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">1. Information We Collect</h2>
            <p className="mb-4">We collect information to provide, personalize and improve our Service.</p>

            <p className="mb-4 font-semibold">Information You Provide to Us:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>
                <span className="font-semibold">Account Information:</span> When you create an account, we collect information such as your email address and a password.
              </li>
              <li>
                <span className="font-semibold">Personal Input for Affirmations:</span> A central feature of our Service involves you entering your personal "desires" or "goals" to generate customized subliminal audio tracks. This input may include sensitive personal information. We treat this data with a high standard of care, applying strict access controls and data handling practices to protect your privacy.
              </li>
              <li>
                <span className="font-semibold">Payment Information:</span> If you purchase a track or subscription, our third-party payment processor, Stripe, will collect your payment information (e.g., credit card details). We do not directly store your full payment card details on our servers.
              </li>
              <li>
                <span className="font-semibold">Communications:</span> When you contact us for support or inquiries, we collect the content of your communications and any contact information you provide.
              </li>
            </ul>

            <p className="mb-4 font-semibold">Information We Collect Automatically:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="font-semibold">Usage Data:</span> We collect information on how the Service is accessed and used ("Usage Data"). This may include your device's Internet Protocol (IP) address, browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers, and other diagnostic data.
              </li>
              <li>
                <span className="font-semibold">Cookies and Tracking Technologies:</span> We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. For more details, please refer to our {" "}
                <a href="/cookies" className="text-[#b1d239] hover:text-[#b1d239]/80">Cookie Policy</a>.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We use the collected information for various purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To Provide and Maintain the Service: Including processing your requests for custom subliminal audio tracks based on your inputted desires.</li>
              <li>To Manage Your Account: To allow you to access and manage your account and track your downloads.</li>
              <li>For Analytics and Performance: To monitor the usage of our Service and gather valuable analytics to improve our offerings.</li>
              <li>To Communicate with You: To send you service-related notifications, updates, and respond to your inquiries.</li>
              <li>For Security: To detect, prevent, and address technical issues or fraudulent activity.</li>
              <li>For Legal Compliance: To comply with legal obligations and enforce our {" "}
                <a href="/terms" className="text-[#b1d239] hover:text-[#b1d239]/80">Terms of Service</a>.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">3. Sharing Your Information</h2>
            <p className="mb-4">We do not sell your personal information. We may share your information in the following situations:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="font-semibold">With Service Providers:</span> We may employ third-party companies and individuals to support our Service. These include Payment Processors, Hosting and Infrastructure Providers, Analytics Providers, and AI Content Generation Providers, such as OpenAI, whose API we use to generate your personalized affirmations. We send the category you select and the personal goal(s) you input to this provider strictly to generate affirmations in real time. This input may include sensitive personal information. The data is not used to train the AI model and is not retained after processing.
              </li>
              <li>
                <span className="font-semibold">For Business Transfers:</span> If Sublmnl is involved in a merger, acquisition, or asset sale, your Personal Data may be transferred. We will provide notice before your Personal Data is transferred and becomes subject to a different Privacy Policy.
              </li>
              <li>
                <span className="font-semibold">For Legal Reasons:</span> We may disclose your Personal Data in the good faith belief that such action is necessary to:
                <ul className="list-disc pl-6 space-y-2 mt-2">
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
              When you use the Service to generate subliminal affirmations, you provide selected inputs such as a category (e.g., health, career) and a freeform personal goal. This input may include sensitive personal information and is treated with care and respect for your privacy.
            </p>
            <p className="mb-4">
              To create personalized affirmations, we transmit your selected inputs to a third-party AI service - currently OpenAI - using their API. This means that the processing of your input (i.e., generating the affirmations) occurs outside of Sublmnl’s proprietary infrastructure, on OpenAI's systems. We do not train the AI model with your data; it is a pre-trained model that responds in real-time using only the current input you provide.
            </p>
            <p className="mb-4">
              We use a fixed prompt structure that includes your selected category and goal. No additional personal information or chat history is used in this process.
            </p>
            <p className="mb-4">
              Before sending your input to OpenAI, we format it but do not otherwise pre-process, enrich, or store it beyond what is needed to complete the request. Once we receive the generated affirmations, we integrate them into audio tracks locally and deliver them to you.
            </p>
            <p className="mb-4">
              We implement safeguards to avoid linking this input to your identity during processing. We do not share your specific desires or affirmations with any third parties in a way that directly identifies you, except as required to provide the service or comply with applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">5. Data Security</h2>
            <p className="mb-4">The security of your data is important to us. We implement multiple safeguards to protect your personal information, including:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>End-to-end encryption for data transmitted between your device and our servers</li>
              <li>Encryption at rest for stored personal data</li>
              <li>Strict access controls, ensuring that only authorized personnel can access sensitive information</li>
            </ul>
            <p className="mb-4">
              While we use commercially reasonable and industry-standard security practices, no method of transmission over the Internet or electronic storage can be guaranteed 100% secure. We continuously review and update our practices to help protect your data, but we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">6. International Data Transfer</h2>
            <p className="mb-4">
              Your information, including Personal Data, may be transferred to - and processed on - servers located outside of your province, territory, or country, including in jurisdictions such as the United States, where privacy and data protection laws may differ from those in your home region.
            </p>
            <p className="mb-4">
              Some of our key service providers, including Vercel (for hosting), Stripe (for payment processing), and OpenAI (for generating personalized affirmations), are based in or process data in the United States and other countries. As a result, your Personal Data may be subject to the laws of those jurisdictions.
            </p>
            <p className="mb-4">
              By using our Service and submitting your information, you consent to this international transfer, processing, and storage of your Personal Data. We take appropriate steps to protect your data across borders, including the use of contractual data processing agreements and other safeguards required under applicable laws such as the GDPR and PIPEDA, to ensure your data receives a comparable level of protection wherever it is processed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">7. Your Data Protection Rights</h2>
            <p className="mb-4">Depending on your location and the laws that apply to you, you may have certain rights regarding your personal data. Below is an overview of your rights under applicable data protection frameworks:</p>

            <h3 className="text-xl font-semibold mb-2">7.1. Your Rights Under PIPEDA (Canada)</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Access the personal information we hold about you, subject to limited exceptions.</li>
              <li>Request corrections to any inaccuracies in your personal information.</li>
              <li>Withdraw your consent to the collection, use, or disclosure of your personal information, subject to legal or contractual restrictions and reasonable notice.</li>
              <li>Be informed about the purposes for which your personal information is collected, used, or disclosed.</li>
            </ul>
            <p className="mb-4">We are required to respond to access requests in writing within 30 days of receipt.</p>

            <h3 className="text-xl font-semibold mb-2">7.2. Your Rights Under Quebec’s Law 25 (Canada)</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>The right to be informed of automated decision-making that affects you.</li>
              <li>The right to request human intervention in such decisions.</li>
              <li>Enhanced transparency regarding how your personal information is collected and transferred.</li>
              <li>The right to data portability (effective from September 2024).</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2">7.3. Your Rights Under GDPR (European Union &amp; UK)</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Access your personal data.</li>
              <li>Correct inaccuracies in your data.</li>
              <li>Erase your personal data (“right to be forgotten”).</li>
              <li>Restrict or object to certain types of processing.</li>
              <li>Receive your data in a portable format.</li>
              <li>Withdraw consent at any time where processing is based on consent.</li>
              <li>Lodge a complaint with your local data protection authority.</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2">7.4. Your Rights Under CCPA/CPRA (California Residents)</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Know what personal information is being collected and how it is used.</li>
              <li>Access your personal information.</li>
              <li>Request deletion of your personal information.</li>
              <li>Correct inaccurate personal information.</li>
              <li>Opt out of the sale or sharing of your personal data.</li>
              <li>Not be discriminated against for exercising any of your privacy rights.</li>
            </ul>
            <p className="mb-4">We do not sell your personal information.</p>

            <h3 className="text-xl font-semibold mb-2">7.5. Other Jurisdictions</h3>
            <p className="mb-4">
              If you reside in a jurisdiction with data protection laws not specifically listed above (such as India, New York, or other U.S. states), we will comply with the applicable laws of your region to the extent required. You may contact us at {" "}
              <a href="mailto:hello@sublmnl.ca" className="text-[#b1d239] hover:text-[#b1d239]/80">hello@sublmnl.ca</a> to inquire about your rights or submit a request.
            </p>

            <h3 className="text-xl font-semibold mb-2">Exercising Your Rights</h3>
            <p className="mb-4">
              To exercise any of the above rights, please contact us at {" "}
              <a href="mailto:hello@sublmnl.ca" className="text-[#b1d239] hover:text-[#b1d239]/80">hello@sublmnl.ca</a>. We may request verification of your identity before processing your request. We will respond within the timeframes required by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">8. Children’s Privacy</h2>
            <p className="mb-4">
              Our Service is not intended for individuals under the age of 16, and we do not knowingly collect personally identifiable information from anyone under that age. In accordance with applicable data protection laws, including the U.S. Children’s Online Privacy Protection Act (COPPA) and the EU General Data Protection Regulation (GDPR), we do not permit individuals under the age of 16 to use the Service or submit personal information without verifiable parental consent.
            </p>
            <p className="mb-4">
              If you are a parent or guardian and believe that your child has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from a child under the age of 16, we will take steps to delete that information promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">9. Data Retention</h2>
            <p className="mb-4">We retain personal information only as long as necessary to provide our Service, fulfill the purposes outlined in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce agreements.</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>
                <span className="font-semibold">Account Information</span> (name, email, password) is stored to enable login and is retained as long as your account is active. To delete your account and associated data, email us at {" "}
                <a href="mailto:hello@sublmnl.ca" className="text-[#b1d239] hover:text-[#b1d239]/80">hello@sublmnl.ca</a>. Upon request, we will delete your account and all associated personal data, including stored audio tracks, unless retention is required by law.
              </li>
              <li>
                <span className="font-semibold">Desires and Affirmation Inputs</span> (e.g., your selected category and goal) are used solely to generate your personalized audio and are deleted immediately after the track is created. We do not store this input or the raw affirmations returned by the AI.
              </li>
              <li>
                <span className="font-semibold">Final Audio Tracks</span> are stored and linked to your account so you can access them after creation.
              </li>
              <li>
                <span className="font-semibold">Payment Information</span> is handled securely by our payment processor, Stripe. We do not store full payment card details on our servers. Stripe retains this data in accordance with its own privacy and retention policies.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">10. Privacy Officer Contact Information</h2>
            <p className="mb-4">We have designated a Privacy Officer responsible for overseeing compliance with applicable privacy laws, including PIPEDA, Quebec’s Law 25, and the GDPR.</p>
            <p className="mb-2">Privacy Officer</p>
            <p className="mb-2">Nitasha Asdhir</p>
            <p className="mb-2">Founder, Sublmnl</p>
            <p className="mb-4">
              <a href="mailto:hello@sublmnl.ca" className="text-[#b1d239] hover:text-[#b1d239]/80">hello@sublmnl.ca</a>
            </p>
            <p className="mb-4">If you have any questions, concerns, or requests regarding your personal information or this Privacy Policy, please contact us using the details above.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">11. Changes to This Privacy Policy</h2>
            <p className="mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#e4ffa8]/80 to-[#b1d239]/80 bg-clip-text text-transparent mb-4">12. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us: {" "}
              <a href="mailto:hello@sublmnl.ca" className="text-[#b1d239] hover:text-[#b1d239]/80">hello@sublmnl.ca</a>
            </p>
          </section>
        </div>

      </div>
    </div>
  )
}