/**
 * Privacy Policy page.
 */
import { Link } from 'react-router-dom';

export const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">Last updated: December 2024</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700 mb-4">
                Student Productivity ("we", "our", or "us") is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your
                information when you use our student productivity web application.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Information We Collect
              </h2>
              <p className="text-gray-700 mb-4">We collect information that you provide directly to us:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Account information (email, name, password)</li>
                <li>Academic data (classes, tasks, exams, schedules)</li>
                <li>Usage data (Pomodoro sessions, preferences)</li>
                <li>Device information and usage patterns</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>To provide and maintain our service</li>
                <li>To notify you about changes to our service</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information to improve our service</li>
                <li>To monitor the usage of our service</li>
                <li>To detect, prevent and address technical issues</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
              <p className="text-gray-700 mb-4">
                We use industry-standard security measures to protect your personal information.
                However, no method of transmission over the Internet or electronic storage is 100%
                secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Request data portability</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy, please contact us at:{' '}
                <a href="mailto:privacy@studentproductivity.com" className="text-indigo-600 hover:text-indigo-500">
                  privacy@studentproductivity.com
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

