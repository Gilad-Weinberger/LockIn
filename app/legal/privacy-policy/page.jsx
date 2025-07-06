import LegalLayout from "@/components/legal/LegalLayout";

export const metadata = {
  title: "Privacy Policy | Lockin",
  description:
    "Privacy Policy for Lockin - Comprehensive privacy information covering data collection, usage, and your rights",
};

export default function PrivacyPolicy() {
  return (
    <LegalLayout>
      <div className="px-4 pb-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Privacy Policy for Lockin
          </h1>

          <p className="text-sm text-gray-600 mb-8">
            <strong>Effective Date:</strong> June 25, 2025
          </p>

          <p className="text-gray-700 leading-relaxed mb-8">
            Lockin values your privacy. This policy explains how we collect,
            use, and protect your information.
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Information We Collect
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  <strong>Personal Data:</strong> We collect email addresses and
                  names when you create an account. This data is used to manage
                  your account, authenticate access, and provide customer
                  support.
                </li>
                <li>
                  <strong>Task and Productivity Data:</strong> We collect and
                  process information about your tasks, projects, scheduling
                  preferences, productivity patterns, AI prioritization rules,
                  and calendar data to provide AI-powered task management,
                  intelligent scheduling, and productivity optimization
                  services.
                </li>
                <li>
                  <strong>Google Calendar Data:</strong> For Professional plan
                  users who connect Google Calendar, we access your calendar
                  events, titles, dates, and times to provide scheduling
                  optimization and avoid conflicts. We temporarily store
                  authentication tokens in secure HTTP-only cookies during the
                  connection process.
                </li>
                <li>
                  <strong>Usage Analytics:</strong> We use PostHog analytics to
                  collect information about how you use our platform, including
                  feature usage, page views, click patterns, session data, and
                  performance metrics to improve our services and user
                  experience.
                </li>
                <li>
                  <strong>Technical Data:</strong> We collect cookies for
                  authentication and session management, IP addresses for
                  security and analytics, device information, and browser data
                  to ensure proper functionality and security of our platform.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Use of Information
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  <strong>Personal Data:</strong> Your email address and name
                  are used for account management, authentication,
                  service-related communications, and customer support.
                </li>
                <li>
                  <strong>AI Processing:</strong> Your tasks and productivity
                  data are processed by our AI systems to provide intelligent
                  prioritization using the Eisenhower Matrix, automatic
                  scheduling based on your preferences and deadlines, custom AI
                  rules implementation, and personalized productivity insights.
                  Free plan users have monthly limits (25 AI-processed tasks),
                  while Professional plan users have unlimited access.
                </li>
                <li>
                  <strong>Calendar Integration:</strong> Google Calendar data is
                  used to synchronize events, automatically schedule tasks
                  around existing commitments, avoid scheduling conflicts, and
                  optimize your time blocks for maximum productivity.
                </li>
                <li>
                  <strong>Analytics and Improvement:</strong> Usage data
                  collected through PostHog is used to analyze platform
                  performance, understand user behavior patterns, identify areas
                  for improvement, track feature adoption, and enhance the
                  overall user experience.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibent text-gray-900 mb-4">
                3. Data Sharing and Third-Party Services
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  We do not sell, trade, or share your personal data or
                  productivity information with third parties for marketing
                  purposes. We only share data as necessary to provide our
                  services:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>
                    <strong>LemonSqueezy:</strong> For payment processing and
                    subscription management (only billing information is shared)
                  </li>
                  <li>
                    <strong>Google Services:</strong> For Google Calendar
                    integration and authentication (only when you explicitly
                    connect your account)
                  </li>
                  <li>
                    <strong>PostHog:</strong> For analytics and performance
                    monitoring (anonymized usage data only)
                  </li>
                  <li>
                    <strong>Firebase:</strong> For secure data storage and
                    authentication services
                  </li>
                  <li>
                    <strong>Legal Compliance:</strong> When required by law or
                    to protect our rights and users' safety
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Cookies and Tracking Technologies
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  We use several types of cookies and tracking technologies:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>
                    <strong>Authentication Cookies:</strong> To keep you logged
                    in and maintain your session securely
                  </li>
                  <li>
                    <strong>Temporary Storage Cookies:</strong> For Google
                    Calendar connection process (secure HTTP-only cookies that
                    expire in 10 minutes)
                  </li>
                  <li>
                    <strong>Analytics Cookies:</strong> Through PostHog to track
                    page views, user interactions, and platform performance
                  </li>
                  <li>
                    <strong>Preference Cookies:</strong> To remember your
                    settings and customizations
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  You can control cookies through your browser settings, but
                  disabling certain cookies may impact your ability to use some
                  features of our platform.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Data Security and Storage
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We implement comprehensive security measures to protect your
                data including encrypted data storage through Firebase, secure
                authentication systems, HTTPS encryption for all data
                transmission, regular security monitoring and updates, and
                access controls to limit data access to authorized personnel
                only. However, no method of transmission over the internet is
                100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. User Rights and Data Control
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  You have full control over your data and can:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>
                    <strong>Access:</strong> View all your personal data and
                    productivity information through your account dashboard
                  </li>
                  <li>
                    <strong>Modify:</strong> Update your profile information,
                    preferences, and AI rules at any time
                  </li>
                  <li>
                    <strong>Delete:</strong> Request deletion of your account
                    and all associated data
                  </li>
                  <li>
                    <strong>Export:</strong> Download your tasks and data in a
                    portable format
                  </li>
                  <li>
                    <strong>Disconnect Integrations:</strong> Remove Google
                    Calendar or other third-party connections
                  </li>
                  <li>
                    <strong>Control AI Processing:</strong> Disable AI features
                    or set custom rules for data processing
                  </li>
                </ul>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Updates to Privacy Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this policy from time to time to reflect changes
                in our practices or applicable laws. You will be notified of any
                material changes via email or through our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Governing Law
              </h2>
              <p className="text-gray-700 leading-relaxed">
                This Privacy Policy is governed by the laws of Israel.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Support
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy or need
                support, please contact us at{" "}
                <a
                  href="mailto:lockintasks.contact@gmail.com"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  lockintasks.contact@gmail.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </LegalLayout>
  );
}
