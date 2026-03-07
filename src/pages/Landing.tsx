/**
 * Landing page.
 */
import { Link } from 'react-router-dom';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <div className="text-7xl mb-6">🎓</div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
              Ultimate Student Productivity Tool
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Get organized, stay ahead, and work productively. Manage your classes, tasks, exams, and focus sessions all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn-primary text-lg px-10 py-4"
              >
                🚀 Get Started Free
              </Link>
              <Link
                to="/login"
                className="btn-secondary text-lg px-10 py-4 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Three Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card card-hover text-center p-8">
            <div className="text-5xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Get Organized</h2>
            <p className="text-gray-600 leading-relaxed">
              Manage your academic calendar with support for weekly, rotating, block, and custom schedules. Never miss a class or deadline.
            </p>
          </div>
          <div className="card card-hover text-center p-8">
            <div className="text-5xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Stay Ahead</h2>
            <p className="text-gray-600 leading-relaxed">
              Track tasks, exams, and projects with smart reminders. Get notified before important deadlines and exams.
            </p>
          </div>
          <div className="card card-hover text-center p-8">
            <div className="text-5xl mb-4">⏱️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Work Productively</h2>
            <p className="text-gray-600 leading-relaxed">
              Use Pomodoro timer to maintain focus. Track your study sessions and see your productivity improve over time.
            </p>
          </div>
        </div>
      </div>

      {/* Problem vs Solution */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Pain Points</h2>
              <ul className="space-y-2 text-gray-600">
                <li>• Forgetting assignments and exam dates</li>
                <li>• Difficulty managing multiple class schedules</li>
                <li>• Lack of focus during study sessions</li>
                <li>• No centralized place for academic planning</li>
                <li>• Missing important deadlines</li>
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How This App Helps</h2>
              <ul className="space-y-2 text-gray-600">
                <li>• Smart reminders for tasks, exams, and deadlines</li>
                <li>• Flexible schedule support for any school system</li>
                <li>• Built-in Pomodoro timer for focused study</li>
                <li>• Unified dashboard for all your academic needs</li>
                <li>• Cross-device sync so you're always up to date</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6 max-w-3xl mx-auto">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">What is this app?</h3>
            <p className="text-gray-600">
              This is a comprehensive student productivity tool that combines academic calendar management, task tracking, exam scheduling, and focus tools in one platform.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">How do reminders work?</h3>
            <p className="text-gray-600">
              You can set up configurable reminders for tasks, exams, and study sessions. The app sends smart reminders based on priority and due dates.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Does it sync across devices?</h3>
            <p className="text-gray-600">
              Yes! Your data syncs in real-time across all your devices. Access your schedule, tasks, and progress from anywhere.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <p className="text-gray-400">support@studentproductivity.com</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">About</h3>
              <p className="text-gray-400">
                Helping students stay organized and productive since 2024.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 Student Productivity. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

