import LegalLayout from "@/components/legal/LegalLayout";

export const metadata = {
  title: "Privacy Policy | Lockin",
  description:
    "Privacy Policy for Lockin - Comprehensive privacy information covering data collection, usage, and your rights",
};

export default function PrivacyPolicy() {
  return (
    <LegalLayout>
      <div className="px-4">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Privacy Policy
          </h1>

          <p className="text-sm text-gray-600 mb-8">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                This Privacy Policy describes how Lockin ("we," "our," or "us")
                collects, uses, shares, and protects your personal information
                when you use our productivity and task management platform,
                including our website, mobile applications, and related services
                (collectively, the "Service"). We are committed to protecting
                your privacy and ensuring transparency about our data practices.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                By using our Service, you consent to the collection, use, and
                sharing of your information as described in this Privacy Policy.
                If you do not agree with our policies and practices, do not use
                our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Information We Collect
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    2.1 Information You Provide Directly
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>
                      <strong>Account Information:</strong> Email address,
                      password, display name, and profile information when you
                      create an account
                    </li>
                    <li>
                      <strong>Profile Data:</strong> Optional profile
                      information such as profile picture, preferences, and
                      settings
                    </li>
                    <li>
                      <strong>Content:</strong> Tasks, notes, project
                      information, comments, and other content you create or
                      upload
                    </li>
                    <li>
                      <strong>Payment Information:</strong> Billing details
                      processed through our payment processor (LemonSqueezy)
                    </li>
                    <li>
                      <strong>Communications:</strong> Messages, feedback, and
                      correspondence you send to us
                    </li>
                    <li>
                      <strong>Survey Data:</strong> Responses to surveys, polls,
                      or research studies
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    2.2 Information from Third-Party Services
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>
                      <strong>Google Account Information:</strong> When you sign
                      in with Google, we receive your email address, name, and
                      profile picture
                    </li>
                    <li>
                      <strong>Google Calendar Data:</strong> When you connect
                      Google Calendar, we access your calendar events, titles,
                      descriptions, attendees, dates, times, and settings
                    </li>
                    <li>
                      <strong>OAuth Tokens:</strong> Authentication tokens for
                      third-party services you connect
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    2.3 Automatically Collected Information
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>
                      <strong>Usage Data:</strong> Information about how you use
                      our Service, including features accessed, time spent, and
                      interaction patterns
                    </li>
                    <li>
                      <strong>Device Information:</strong> Device type,
                      operating system, browser type and version, screen
                      resolution, and device identifiers
                    </li>
                    <li>
                      <strong>Log Data:</strong> IP address, access times, pages
                      viewed, referring URLs, and crash reports
                    </li>
                    <li>
                      <strong>Location Information:</strong> General location
                      derived from IP address (not precise geolocation)
                    </li>
                    <li>
                      <strong>Cookies and Tracking:</strong> Cookies,
                      localStorage, session data, and similar tracking
                      technologies
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    2.4 Analytics and Performance Data
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Application performance metrics and error reporting</li>
                    <li>
                      Feature usage statistics and user behavior analytics
                    </li>
                    <li>Service reliability and uptime monitoring data</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. How We Use Your Information
              </h2>

              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  We use the information we collect for the following purposes:
                </p>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    3.1 Core Service Functions
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>
                      Providing and maintaining our task management and
                      productivity features
                    </li>
                    <li>
                      Processing user authentication and account management
                    </li>
                    <li>Syncing data across devices and platforms</li>
                    <li>
                      Facilitating calendar integration and scheduling features
                    </li>
                    <li>Processing payments and managing subscriptions</li>
                    <li>Enabling collaboration and sharing features</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    3.2 Service Improvement and Personalization
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Analyzing usage patterns to improve our Service</li>
                    <li>
                      Personalizing your experience and providing relevant
                      features
                    </li>
                    <li>Developing new features and functionality</li>
                    <li>
                      Providing AI-powered productivity suggestions and
                      optimizations
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    3.3 Communication and Support
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>
                      Responding to your inquiries and providing customer
                      support
                    </li>
                    <li>Sending service-related notifications and updates</li>
                    <li>
                      Communicating about account changes, security issues, or
                      policy updates
                    </li>
                    <li>
                      Sending marketing communications (with your consent)
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    3.4 Security and Legal Compliance
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>
                      Protecting against fraud, abuse, and security threats
                    </li>
                    <li>Enforcing our Terms of Service and other policies</li>
                    <li>
                      Complying with legal obligations and responding to legal
                      requests
                    </li>
                    <li>Conducting internal audits and quality assurance</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Information Sharing and Disclosure
              </h2>

              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  We do not sell your personal information. We may share your
                  information in the following circumstances:
                </p>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    4.1 Service Providers
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    We share information with trusted third-party service
                    providers who assist us in operating our Service:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>
                      <strong>Firebase (Google):</strong> Authentication,
                      database, and hosting services
                    </li>
                    <li>
                      <strong>LemonSqueezy:</strong> Payment processing and
                      subscription management
                    </li>
                    <li>
                      <strong>Google APIs:</strong> Calendar integration and
                      OAuth authentication
                    </li>
                    <li>
                      <strong>Cloud Infrastructure:</strong> Data storage and
                      application hosting
                    </li>
                    <li>
                      <strong>Analytics Services:</strong> Usage analytics and
                      performance monitoring
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    4.2 Legal Requirements
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    We may disclose your information if required by law or in
                    response to:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Court orders, subpoenas, or other legal processes</li>
                    <li>
                      Government investigations or law enforcement requests
                    </li>
                    <li>Compliance with applicable laws and regulations</li>
                    <li>
                      Protection of our rights, property, or safety, or that of
                      our users
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    4.3 Business Transfers
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    In the event of a merger, acquisition, or sale of assets,
                    your information may be transferred to the acquiring entity,
                    subject to the same privacy protections.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    4.4 Consent
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    We may share your information with your explicit consent or
                    at your direction, such as when you choose to share content
                    publicly or integrate with additional third-party services.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Data Storage and Security
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    5.1 Data Storage
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Your data is stored using Firebase Firestore and other
                    Google Cloud services. Data may be stored and processed in
                    various locations, including the United States and other
                    countries where our service providers operate.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    5.2 Security Measures
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    We implement appropriate technical and organizational
                    security measures to protect your information:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Encryption of data in transit and at rest</li>
                    <li>Regular security assessments and updates</li>
                    <li>Access controls and authentication requirements</li>
                    <li>
                      Monitoring for unauthorized access or suspicious activity
                    </li>
                    <li>
                      Secure coding practices and vulnerability management
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    5.3 Data Retention
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    We retain your information for as long as necessary to
                    provide our services, comply with legal obligations, and
                    resolve disputes. Specific retention periods include:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>
                      <strong>Account Data:</strong> Until account deletion or 3
                      years after last activity
                    </li>
                    <li>
                      <strong>Task and Content Data:</strong> Until deleted by
                      user or account closure
                    </li>
                    <li>
                      <strong>Payment Information:</strong> As required by tax
                      and accounting regulations
                    </li>
                    <li>
                      <strong>Log Data:</strong> Typically 30-90 days for
                      operational purposes
                    </li>
                    <li>
                      <strong>Analytics Data:</strong> Aggregated data may be
                      retained indefinitely
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Your Rights and Choices
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    6.1 Account Management
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>
                      <strong>Access:</strong> View and download your personal
                      information through your account settings
                    </li>
                    <li>
                      <strong>Update:</strong> Modify your profile information,
                      preferences, and settings
                    </li>
                    <li>
                      <strong>Delete:</strong> Request deletion of your account
                      and associated data
                    </li>
                    <li>
                      <strong>Export:</strong> Download your content and data in
                      a portable format
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    6.2 Privacy Controls
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>
                      <strong>Communication Preferences:</strong> Opt out of
                      marketing emails and notifications
                    </li>
                    <li>
                      <strong>Third-Party Integrations:</strong> Disconnect or
                      revoke access to connected services
                    </li>
                    <li>
                      <strong>Data Processing:</strong> Object to certain types
                      of data processing
                    </li>
                    <li>
                      <strong>Cookies:</strong> Manage cookie preferences
                      through your browser settings
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    6.3 Legal Rights (GDPR, CCPA, and Other Laws)
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    Depending on your location, you may have additional rights
                    under applicable privacy laws:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>
                      <strong>Right to Know:</strong> Information about data
                      collection and processing practices
                    </li>
                    <li>
                      <strong>Right of Access:</strong> Request copies of your
                      personal information
                    </li>
                    <li>
                      <strong>Right to Rectification:</strong> Correct
                      inaccurate or incomplete data
                    </li>
                    <li>
                      <strong>Right to Erasure:</strong> Request deletion of
                      your personal information
                    </li>
                    <li>
                      <strong>Right to Portability:</strong> Receive your data
                      in a machine-readable format
                    </li>
                    <li>
                      <strong>Right to Restrict Processing:</strong> Limit how
                      we process your information
                    </li>
                    <li>
                      <strong>Right to Object:</strong> Object to processing
                      based on legitimate interests
                    </li>
                    <li>
                      <strong>Right to Non-Discrimination:</strong> Equal
                      service regardless of privacy choices
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    6.4 Exercising Your Rights
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    To exercise your rights, contact us at privacy@lockin.com or
                    through your account settings. We will respond to requests
                    within 30 days (or as required by applicable law). We may
                    need to verify your identity before processing certain
                    requests.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Cookies and Tracking Technologies
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    7.1 Types of Cookies
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    We use the following types of cookies and similar
                    technologies:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>
                      <strong>Essential Cookies:</strong> Required for basic
                      functionality and security
                    </li>
                    <li>
                      <strong>Authentication Cookies:</strong> Keep you logged
                      in and maintain session state
                    </li>
                    <li>
                      <strong>Preference Cookies:</strong> Remember your
                      settings and customizations
                    </li>
                    <li>
                      <strong>Analytics Cookies:</strong> Help us understand
                      usage patterns and improve our Service
                    </li>
                    <li>
                      <strong>Performance Cookies:</strong> Monitor service
                      performance and identify issues
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    7.2 Managing Cookies
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    You can control cookies through your browser settings.
                    However, disabling certain cookies may impact your ability
                    to use some features of our Service. Essential cookies
                    cannot be disabled without affecting core functionality.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. International Data Transfers
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our Service is operated from and data may be transferred to
                countries other than your country of residence. These countries
                may have different data protection laws. When we transfer your
                information internationally, we ensure appropriate safeguards
                are in place, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-4">
                <li>
                  Standard contractual clauses approved by relevant authorities
                </li>
                <li>
                  Adequacy decisions by the European Commission or other
                  regulators
                </li>
                <li>Certification schemes and codes of conduct</li>
                <li>Your explicit consent where required</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Children's Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our Service is not intended for children under 13 years of age
                (or the minimum age in your jurisdiction). We do not knowingly
                collect personal information from children under 13. If you are
                a parent or guardian and believe your child has provided us with
                personal information, please contact us immediately. If we
                discover we have collected information from a child under 13, we
                will delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Third-Party Services and Links
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our Service may contain links to third-party websites or
                integrate with third-party services (such as Google Calendar).
                This Privacy Policy does not apply to third-party services. We
                encourage you to review the privacy policies of any third-party
                services you use. We are not responsible for the privacy
                practices of third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. California Privacy Rights (CCPA)
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  If you are a California resident, you have specific rights
                  under the California Consumer Privacy Act (CCPA):
                </p>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    11.1 Categories of Information
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    In the past 12 months, we have collected the following
                    categories of personal information:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Identifiers (email, name, account ID)</li>
                    <li>
                      Commercial information (subscription details, payment
                      history)
                    </li>
                    <li>Internet activity (usage data, device information)</li>
                    <li>
                      Professional information (work-related tasks and calendar
                      data)
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    11.2 Sale of Personal Information
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    We do not sell personal information for monetary
                    consideration. We do not share personal information with
                    third parties for their direct marketing purposes.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    11.3 CCPA Rights
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>
                      <strong>Right to Know:</strong> Request disclosure about
                      our data practices
                    </li>
                    <li>
                      <strong>Right to Delete:</strong> Request deletion of your
                      personal information
                    </li>
                    <li>
                      <strong>Right to Opt-Out:</strong> Opt out of sale of
                      personal information (not applicable as we don't sell
                      data)
                    </li>
                    <li>
                      <strong>Right to Non-Discrimination:</strong> Equal
                      treatment regardless of privacy rights exercise
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                12. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect
                changes in our practices, technology, legal requirements, or
                other factors. We will notify you of material changes by email,
                through our Service, or by other appropriate means at least 30
                days before the changes take effect. Your continued use of our
                Service after the effective date constitutes acceptance of the
                updated Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                13. Contact Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions, concerns, or requests regarding this
                Privacy Policy or our data practices, please contact us:
              </p>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Data Protection Contact
                </h4>
                <p className="text-gray-700 space-y-1">
                  <strong>Email:</strong> privacy@lockin.com
                  <br />
                  <strong>Subject Line:</strong> "Privacy Policy Inquiry"
                  <br />
                  <strong>Address:</strong> [Your Business Address]
                  <br />
                  <strong>Response Time:</strong> We aim to respond within 30
                  days
                </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg mt-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  EU Representative (if applicable)
                </h4>
                <p className="text-gray-700">
                  If you are in the European Union and wish to contact our EU
                  representative regarding data protection matters, please
                  contact [EU Representative Contact Information].
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                14. Definitions
              </h2>
              <div className="space-y-3">
                <div>
                  <strong className="text-gray-800">
                    Personal Information:
                  </strong>
                  <span className="text-gray-700">
                    {" "}
                    Information that identifies, relates to, or could reasonably
                    be linked with a particular individual.
                  </span>
                </div>
                <div>
                  <strong className="text-gray-800">Processing:</strong>
                  <span className="text-gray-700">
                    {" "}
                    Any operation performed on personal information, including
                    collection, use, storage, disclosure, and deletion.
                  </span>
                </div>
                <div>
                  <strong className="text-gray-800">Third Party:</strong>
                  <span className="text-gray-700">
                    {" "}
                    Any individual, company, or organization other than you and
                    us.
                  </span>
                </div>
                <div>
                  <strong className="text-gray-800">Service Provider:</strong>
                  <span className="text-gray-700">
                    {" "}
                    A third party that processes personal information on our
                    behalf to provide services to us.
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </LegalLayout>
  );
}
