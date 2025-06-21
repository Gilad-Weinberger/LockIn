import LegalLayout from "@/components/legal/LegalLayout";

export const metadata = {
  title: "Terms of Service | Lockin",
  description:
    "Terms of Service for Lockin - Comprehensive terms covering our productivity and task management platform",
};

export default function TermsOfService() {
  return (
    <LegalLayout>
      <div className="px-4">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Terms of Service
          </h1>

          <p className="text-sm text-gray-600 mb-8">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to Lockin ("we," "our," or "us"). These Terms of Service
                ("Terms") govern your use of our productivity and task
                management platform, including our website, mobile applications,
                and related services (collectively, the "Service"). By accessing
                or using our Service, you agree to be bound by these Terms. If
                you disagree with any part of these terms, you may not access
                the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Description of Service
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Lockin is a productivity platform that provides task management,
                scheduling, calendar integration, and productivity optimization
                tools. Our Service includes:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Task creation, organization, and management tools</li>
                <li>
                  Calendar integration with Google Calendar and other
                  third-party services
                </li>
                <li>Automated scheduling and prioritization features</li>
                <li>Productivity analytics and insights</li>
                <li>Collaboration and sharing capabilities</li>
                <li>AI-powered task optimization (Pro features)</li>
                <li>Advanced reporting and analytics (Pro features)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. User Accounts and Registration
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    3.1 Account Creation
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    To use certain features of our Service, you must register
                    for an account. You may register using your email address or
                    through third-party authentication providers such as Google.
                    You agree to provide accurate, current, and complete
                    information during registration and to update such
                    information to keep it accurate, current, and complete.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    3.2 Account Security
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    You are responsible for safeguarding your account
                    credentials and for all activities that occur under your
                    account. You agree to notify us immediately of any
                    unauthorized use of your account or any other breach of
                    security.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    3.3 Account Termination
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    We reserve the right to suspend or terminate your account if
                    you violate these Terms or engage in any conduct that we
                    determine is harmful to other users, our business, or third
                    parties.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Subscription Plans and Billing
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    4.1 Free and Paid Plans
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    We offer both free and paid subscription plans. Free
                    accounts have limited features and usage restrictions. Paid
                    plans provide access to additional features, increased
                    limits, and premium functionality.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    4.2 Payment Processing
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Subscription payments are processed through LemonSqueezy,
                    our third-party payment processor. By subscribing to a paid
                    plan, you agree to LemonSqueezy's terms of service and
                    authorize recurring charges to your payment method.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    4.3 Billing and Renewals
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Subscription fees are billed in advance on a recurring basis
                    (monthly or annually, as selected). Subscriptions
                    automatically renew unless canceled before the next billing
                    cycle. You can manage your subscription through your account
                    settings or the customer portal.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    4.4 Cancellation and Refunds
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    You may cancel your subscription at any time. Cancellations
                    take effect at the end of the current billing period. We do
                    not provide refunds for partial billing periods, except as
                    required by applicable law or in cases of service outages or
                    technical issues that prevent access to paid features.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    4.5 Price Changes
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    We reserve the right to modify subscription prices. Any
                    price changes will be communicated to you at least 30 days
                    in advance and will take effect on your next billing cycle.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Third-Party Integrations
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    5.1 Google Calendar Integration
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Our Service integrates with Google Calendar to provide
                    calendar synchronization and scheduling features. By
                    connecting your Google Calendar, you grant us permission to
                    access, read, and modify your calendar events as necessary
                    to provide our services. This integration is governed by
                    Google's terms of service and privacy policy in addition to
                    these Terms.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    5.2 Third-Party Services
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Our Service may integrate with various third-party services
                    and APIs. We are not responsible for the availability,
                    accuracy, or reliability of third-party services. Your use
                    of third-party integrations is subject to the respective
                    third-party's terms of service and privacy policies.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    5.3 Data Synchronization
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    When you enable third-party integrations, data may be
                    synchronized between our Service and the third-party
                    service. You are responsible for ensuring you have the
                    necessary rights and permissions to sync this data.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. User Content and Data
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    6.1 Your Content
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    You retain ownership of all content you create, upload, or
                    share through our Service, including tasks, notes, files,
                    and other data ("User Content"). By using our Service, you
                    grant us a limited, non-exclusive, royalty-free license to
                    use, store, and process your User Content solely to provide
                    and improve our services.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    6.2 Content Responsibility
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    You are solely responsible for your User Content and the
                    consequences of posting or sharing it. You represent and
                    warrant that you have all necessary rights to your User
                    Content and that it does not violate any law or infringe any
                    third-party rights.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    6.3 Data Backup and Loss
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    While we implement reasonable backup procedures, you are
                    responsible for maintaining your own backups of important
                    data. We are not liable for any loss or corruption of User
                    Content.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Acceptable Use Policy
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  You agree not to use our Service to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights of others</li>
                  <li>
                    Upload or share malicious software, viruses, or harmful
                    content
                  </li>
                  <li>
                    Attempt to gain unauthorized access to our systems or other
                    users' accounts
                  </li>
                  <li>
                    Use our Service for any illegal, harmful, or fraudulent
                    activities
                  </li>
                  <li>Spam, harass, or abuse other users</li>
                  <li>
                    Attempt to reverse engineer, decompile, or hack our Service
                  </li>
                  <li>
                    Use automated tools to access our Service without permission
                  </li>
                  <li>
                    Share or resell access to our Service without authorization
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Privacy and Data Protection
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is important to us. Our collection, use, and
                protection of your personal information is governed by our
                Privacy Policy, which is incorporated into these Terms by
                reference. By using our Service, you consent to the collection
                and use of your information as described in our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Intellectual Property
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    9.1 Our Rights
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    The Service and its original content, features, and
                    functionality are and will remain the exclusive property of
                    Lockin and its licensors. The Service is protected by
                    copyright, trademark, and other intellectual property laws.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    9.2 Limited License
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    We grant you a limited, non-exclusive, non-transferable
                    license to use our Service in accordance with these Terms.
                    This license does not include any right to resell or make
                    commercial use of our Service or its contents.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Service Availability and Modifications
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    10.1 Service Availability
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    We strive to maintain high availability of our Service, but
                    we do not guarantee uninterrupted access. Our Service may be
                    temporarily unavailable due to maintenance, updates, or
                    technical issues.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    10.2 Service Modifications
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    We reserve the right to modify, suspend, or discontinue any
                    part of our Service at any time. We will provide reasonable
                    notice of significant changes that materially affect your
                    use of the Service.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. Disclaimer of Warranties
              </h2>
              <p className="text-gray-700 leading-relaxed">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
                WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED. WE DISCLAIM
                ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES
                OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
                NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE
                UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                12. Limitation of Liability
              </h2>
              <p className="text-gray-700 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL LOCKIN
                BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
                OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF
                PROFITS, DATA, OR USE, ARISING OUT OF OR RELATED TO YOUR USE OF
                THE SERVICE, REGARDLESS OF THE THEORY OF LIABILITY AND WHETHER
                OR NOT WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                13. Indemnification
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to defend, indemnify, and hold harmless Lockin and its
                officers, directors, employees, and agents from and against any
                claims, damages, losses, liabilities, costs, and expenses
                (including reasonable attorney fees) arising out of or related
                to your use of the Service, your violation of these Terms, or
                your violation of any rights of a third party.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                14. Termination
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Either party may terminate these Terms at any time. Upon
                termination, your right to use the Service will immediately
                cease. We may also terminate or suspend your account
                immediately, without prior notice or liability, for any reason,
                including if you breach these Terms. Upon termination, you may
                request deletion of your data in accordance with our Privacy
                Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                15. Governing Law and Jurisdiction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance
                with the laws of [Your Jurisdiction], without regard to its
                conflict of law provisions. Any legal action or proceeding
                arising under these Terms will be brought exclusively in the
                courts of [Your Jurisdiction].
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                16. Changes to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. If we
                make material changes, we will notify you by email or through
                our Service at least 30 days before the changes take effect.
                Your continued use of the Service after the effective date
                constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                17. Contact Information
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms of Service, please
                contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@lockin.com
                  <br />
                  <strong>Address:</strong> [Your Business Address]
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                18. Severability
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If any provision of these Terms is held to be invalid or
                unenforceable, the remaining provisions will remain in full
                force and effect. The invalid or unenforceable provision will be
                replaced with a valid provision that most closely approximates
                the intent of the original provision.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                19. Entire Agreement
              </h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms, together with our Privacy Policy and any other
                legal notices published by us on the Service, constitute the
                entire agreement between you and Lockin concerning the Service
                and supersede all prior or contemporaneous communications and
                proposals.
              </p>
            </section>
          </div>
        </div>
      </div>
    </LegalLayout>
  );
}
