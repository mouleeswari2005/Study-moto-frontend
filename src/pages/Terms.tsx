/**
 * Terms of Service page.
 */
import { Link } from 'react-router-dom';

export const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">Last updated: December 2024</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Agreement to Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing or using Student Productivity, you agree to be bound by these Terms of
                Service. If you disagree with any part of these terms, you may not access the
                service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Use License</h2>
              <p className="text-gray-700 mb-4">
                Permission is granted to temporarily use Student Productivity for personal,
                non-commercial use only. This is the grant of a license, not a transfer of title,
                and under this license you may not:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to reverse engineer any software</li>
                <li>Remove any copyright or proprietary notations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Accounts</h2>
              <p className="text-gray-700 mb-4">
                When you create an account with us, you must provide accurate, complete, and
                current information. You are responsible for safeguarding your password and for all
                activities that occur under your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Prohibited Uses</h2>
              <p className="text-gray-700 mb-4">You may not use our service:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>In any way that violates any applicable law or regulation</li>
                <li>To transmit any malicious code or viruses</li>
                <li>To impersonate or attempt to impersonate the company</li>
                <li>In any way that infringes upon the rights of others</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                In no event shall Student Productivity, nor its directors, employees, partners,
                agents, suppliers, or affiliates, be liable for any indirect, incidental, special,
                consequential, or punitive damages resulting from your use of the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these terms at any time. We will notify users of any
                changes by updating the "Last updated" date. Your continued use of the service
                after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms of Service, please contact us at:{' '}
                <a href="mailto:legal@studentproductivity.com" className="text-indigo-600 hover:text-indigo-500">
                  legal@studentproductivity.com
                </a>
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link to="/" className="text-indigo-600 hover:text-indigo-500">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

