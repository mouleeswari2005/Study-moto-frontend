/**
 * Shared Navigation component with glassmorphism, mobile menu, and bottom nav.
 */
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

export const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close "More" menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };

    if (moreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [moreMenuOpen]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Primary navigation links (shown directly)
  const primaryNavLinks = [
    { path: '/dashboard', label: 'Dashboard'},
    { path: '/tasks', label: 'Tasks'},
    { path: '/exams', label: 'Exams'},
    { path: '/classes', label: 'Classes'},
    { path: '/streaks', label: 'Streaks'},
    { path: '/calendar', label: 'Calendar'},
    { path: '/reminders', label: 'Reminders'},
    
  ];

  // Secondary navigation links (shown in "More" dropdown)
  const moreNavLinks = [
    { path: '/academic-projects', label: 'Projects'},
    { path: '/notes', label: 'Notes'},
    { path: '/extra-activities', label: 'Activities'},
    { path: '/study-plans', label: 'Study Plans'},
    { path: '/summer-vacations', label: 'Summer Vacation'},
    { path: '/pomodoro', label: 'Focus'},
    { path: '/settings', label: 'Settings'},
  ];

  // All nav links for mobile menu
  const navLinks = [...primaryNavLinks, ...moreNavLinks];

  // Bottom nav links (most important ones)
  const bottomNavLinks = [
    { path: '/dashboard', label: 'Dashboard'},
    { path: '/tasks', label: 'Tasks'},
    { path: '/exams', label: 'Exams'},
    { path: '/pomodoro', label: 'Focus'},
    { path: '/settings', label: 'Settings'},
  ];

  return (
    <>
      {/* Top Navigation - Fixed with Glassmorphism */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-white/20 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                StudyMoto
              </h1>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="flex items-center space-x-1">
                {primaryNavLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(link.path)
                        ? 'bg-indigo-100/80 backdrop-blur-sm text-indigo-700 shadow-sm'
                        : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {/* More Menu Dropdown */}
                <div className="relative" ref={moreMenuRef}>
                  <button
                    onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      moreNavLinks.some(link => isActive(link.path))
                        ? 'bg-indigo-100/80 backdrop-blur-sm text-indigo-700 shadow-sm'
                        : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                    }`}
                  >
                    More
                    <svg 
                      className={`inline-block ml-1 w-4 h-4 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {moreMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-white/20 py-2 z-50 animate-slide-up">
                      {moreNavLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setMoreMenuOpen(false)}
                          className={`block px-4 py-2 text-sm font-medium transition-all duration-200 ${
                            isActive(link.path)
                              ? 'bg-indigo-100/80 text-indigo-700'
                              : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                          }`}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4 pl-4 border-l border-gray-200/50">
                <Link
                  to="/notifications"
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-lg transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user?.full_name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-lg transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-3">
              <Link
                to="/notifications"
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-lg transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-white/60 transition-all duration-200"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden pb-4 border-t border-white/20 mt-4 pt-4 animate-slide-up">
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(link.path)
                        ? 'bg-indigo-100/80 backdrop-blur-sm text-indigo-700 shadow-sm'
                        : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/profile')
                      ? 'bg-indigo-100/80 backdrop-blur-sm text-indigo-700 shadow-sm'
                      : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3 text-lg">👤</span>
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50/60 transition-all duration-200"
                >
                  <span className="mr-3 text-lg">🚪</span>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden backdrop-blur-md bg-white/80 border-t border-white/20 shadow-soft">
        <div className="max-w-7xl mx-auto px-2">
          <div className="flex justify-around items-center py-2">
            {bottomNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px] ${
                  isActive(link.path)
                    ? 'text-indigo-600 bg-indigo-50/80 backdrop-blur-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                <span className="text-xs font-medium">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};

