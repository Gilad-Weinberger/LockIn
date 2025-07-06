import LegalLayout from "@/components/legal/LegalLayout";

export const metadata = {
  title: "Terms of Service | Lockin",
  description:
    "Terms of Service for Lockin - Comprehensive terms covering our productivity and task management platform",
};

export default function TermsOfService() {
  return (
    <LegalLayout>
      <div className="px-4 pb-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Terms and Conditions for Lockin
          </h1>

          <p className="text-sm text-gray-600 mb-8">
            <strong>Effective Date:</strong> June 25, 2025
          </p>

          <p className="text-gray-700 leading-relaxed mb-8">
            Welcome to Lockin. By using our website and services, you agree to
            comply with the following terms.
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Overview
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Lockin is an AI-powered productivity and task management
                platform designed for individuals and professionals to organize
                their work, schedule tasks automatically, and optimize their
                productivity using advanced artificial intelligence algorithms.
                The platform offers both free and paid subscription plans with
                different feature sets and usage limits.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Accounts
              </h2>
              <p className="text-gray-700 leading-relaxed">
                To use Lockin, you must create an account by providing accurate
                information, including your email address and name. For paid
                subscriptions, you must also provide valid payment information
                through our payment processor, LemonSqueezy. By subscribing to a
                paid plan, you agree to pay the applicable fees as displayed on
                our pricing page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Subscription Plans and Billing
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    3.1 Service Plans
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    We offer a <strong>Starter Plan</strong> (free) with limited
                    AI processing (up to 25 AI-processed tasks per month) and
                    basic features, and a <strong>Professional Plan</strong>{" "}
                    (paid subscription) with unlimited AI processing, advanced
                    features, and full Google Calendar integration.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    3.2 AI Usage Limits
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Free plan users have monthly limits on AI-powered features
                    including task prioritization and scheduling. These limits
                    reset monthly. Professional plan users have unlimited access
                    to all AI features.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    3.3 Payment and Billing
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Paid subscriptions are processed through LemonSqueezy and
                    may be billed monthly or annually. Subscriptions
                    automatically renew unless canceled. You can manage your
                    subscription through your account settings or the customer
                    portal.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Data Collection and Processing
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We collect and process several types of data to provide our
                services: (1) Personal information including names and email
                addresses for account management, (2) Task and productivity data
                including your tasks, projects, scheduling preferences, and
                completion patterns to provide AI-powered prioritization and
                scheduling, (3) Usage analytics through PostHog and Vercel
                Analytics to understand how you use our platform and improve our
                services, and (4) Technical data including cookies, IP
                addresses, and device information for service functionality and
                security. For more details, please refer to our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Third-Party Integrations and Data Usage
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    5.1 Google Calendar Integration
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Professional plan users can connect their Google Calendar
                    for advanced features including automatic task scheduling,
                    calendar synchronization, and conflict avoidance. When you
                    connect Google Calendar, we temporarily store authentication
                    tokens in secure cookies and access your calendar events to
                    provide scheduling optimization. You can disconnect this
                    integration at any time through your account settings.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    5.2 AI Processing and Analytics
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Our AI systems process your task data to provide intelligent
                    prioritization using the Eisenhower Matrix framework and
                    automatic scheduling based on your preferences and
                    deadlines. We use PostHog for analytics to track feature
                    usage, performance metrics, and user behavior patterns to
                    improve our services. We are committed to protecting user
                    privacy and do not sell any collected data to third parties.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    5.3 GDPR Compliance and User Responsibilities
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Lockin is fully compliant with the General Data Protection
                    Regulation (GDPR). As a user of Lockin, you acknowledge that
                    you are the data controller for any personal data you input
                    into our system, while Lockin acts as a data processor.
                  </p>

                  <p className="text-gray-700 leading-relaxed mt-4">
                    As the data controller, you are responsible for:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
                    <li>
                      <strong>Data Accuracy:</strong> Ensuring that any personal
                      data you input into Lockin is accurate and up-to-date.
                    </li>
                    <li>
                      <strong>Consent Management:</strong> Obtaining appropriate
                      consent when sharing or collaborating on tasks that
                      contain personal information of others.
                    </li>
                    <li>
                      <strong>Data Subject Rights:</strong> Facilitating
                      GDPR-compliant requests from individuals whose data you
                      may have stored in Lockin.
                    </li>
                  </ul>

                  <p className="text-gray-700 leading-relaxed mt-4">
                    Lockin, as the data processor, will:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
                    <li>
                      <strong>Process Data as Instructed:</strong> We will only
                      process data in accordance with your instructions and the
                      terms outlined in this agreement.
                    </li>
                    <li>
                      <strong>Ensure Data Security:</strong> We implement
                      appropriate technical and organizational measures to
                      protect the data we process on your behalf.
                    </li>
                    <li>
                      <strong>Assist with Compliance:</strong> Lockin will
                      assist you in meeting your GDPR obligations, such as
                      responding to data subject requests.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Updates to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update these terms from time to time. You will be
                notified of any changes via email.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Governing Law
              </h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms & Services are governed by the laws of Israel.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Support
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms of Service or need
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
