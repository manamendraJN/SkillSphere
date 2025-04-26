import { useState, useEffect, useRef, useContext, useCallback, memo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Menu, LogOut, User, MessageCircle, Home, FileText, BookOpen, HelpCircle, Library } from 'lucide-react';

const Header = memo(() => {
  const { user, logout, loading, error } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const notificationsRef = useRef(null);

  const notifications = [
    { id: 1, message: "Someone liked your answer!", time: "5 mins ago" },
    { id: 2, message: "New comment on your question.", time: "10 mins ago" },
  ];

  const sidebarItems = [
    { name: 'Home', icon: <Home className="w-5 h-5 mr-2 text-indigo-600" />, activeIcon: <Home className="w-5 h-5 mr-2 text-indigo-800" />, path: '' },
    { name: 'Skill Posts', icon: <FileText className="w-5 h-5 mr-2 text-indigo-600" />, activeIcon: <FileText className="w-5 h-5 mr-2 text-indigo-800" />, path: 'skill-posts' },
    { name: 'Learning Plans', icon: <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />, activeIcon: <BookOpen className="w-5 h-5 mr-2 text-indigo-800" />, path: 'learning-plans' },
    { name: 'Q&A Hub', icon: <HelpCircle className="w-5 h-5 mr-2 text-indigo-600" />, activeIcon: <HelpCircle className="w-5 h-5 mr-2 text-indigo-800" />, path: 'q&a-form' },
    { name: 'Profile', icon: <User className="w-5 h-5 mr-2 text-indigo-600" />, activeIcon: <User className="w-5 h-5 mr-2 text-indigo-800" />, path: 'profile' },
    { name: 'Resource', icon: <Library className="w-5 h-5 mr-2 text-indigo-600" />, activeIcon: <Library className="w-5 h-5 mr-2 text-indigo-800" />, path: 'resourceLibrary' },
  ];

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => {
      console.log('Sidebar toggled, new state:', !prev);
      return !prev;
    });
  }, []);

  const toggleNotifications = useCallback(() => setIsNotificationsOpen((prev) => !prev), []);

  useEffect(() => setIsSidebarOpen(false), [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    if (isNotificationsOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationsOpen]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed top-0 left-0 right-0 p-4 bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg z-50"
      >
        Loading...
      </motion.div>
    );
  }

  return (
    <>
      {/* Top Bar - Fixed */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 flex justify-between items-center p-4 bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg z-50"
      >
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="md:hidden text-white focus:outline-none"
            onClick={toggleSidebar}
          >
            <Menu className="w-6 h-6" />
          </motion.button>
          <Link to="/" className="text-2xl font-extrabold flex items-center space-x-2">
            <motion.span
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="text-3xl"
            >
              🌿
            </motion.span>
            <span>SkillSphere</span>
          </Link>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-200"
          >
            {error}
          </motion.div>
        )}

        {user ? (
          <div className="flex items-center space-x-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden md:block font-medium">{user?.username || 'User'}</span>
            </motion.div>
            <div className="relative" ref={notificationsRef}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleNotifications}
                className="text-white hover:text-teal-100 focus:outline-none relative"
              >
                <Bell className="w-6 h-6" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-xs flex items-center justify-center animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </motion.button>
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-3 w-80 bg-white text-gray-800 shadow-2xl rounded-xl p-4 z-10 border border-teal-100"
                  >
                    <h4 className="text-md font-bold text-gray-900 mb-3 flex items-center">
                      <Bell className="w-5 h-5 mr-2 text-teal-500" /> Notifications
                    </h4>
                    {notifications.length === 0 ? (
                      <p className="text-gray-500 text-sm">No new notifications</p>
                    ) : (
                      notifications.map((notif) => (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-gray-700 mb-3 p-2 hover:bg-teal-50 hover:text-teal-600 rounded-lg transition-colors"
                        >
                          <p className="font-medium">{notif.message}</p>
                          <span className="text-xs text-gray-400">{notif.time}</span>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="text-white hover:text-orange-200 font-medium flex items-center bg-orange-500 bg-opacity-20 px-3 py-1 rounded-full"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </motion.button>
          </div>
        ) : (
          <div className="space-x-4">
            <Link
              to="/login"
              className="text-white hover:text-teal-100 font-medium bg-teal-600 bg-opacity-20 px-4 py-2 rounded-full transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-white hover:text-teal-100 font-medium bg-green-600 bg-opacity-20 px-4 py-2 rounded-full transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </motion.div>

      {/* Sidebar - Positioned Below Top Bar */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isSidebarOpen || window.innerWidth >= 768 ? 0 : '-100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed top-24 left-5 w-72 bg-white shadow-2xl border-r border-teal-100 z-40 h-100 rounded-3xl"
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <MessageCircle className="w-6 h-6 mr-2 text-teal-500" /> Menu
          </h3>
          <nav className="space-y-3">
            {sidebarItems.map((item, idx) => {
              const isActive = location.pathname === `/${item.path}` || (item.path === '' && location.pathname === '/');
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link
                    to={`/${item.path}`}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors font-medium ${
                      isActive
                        ? 'bg-teal-100 text-teal-700'
                        : 'text-gray-700 hover:bg-teal-50 hover:text-teal-600'
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    {isActive ? item.activeIcon : item.icon}
                    {item.name}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>
      </motion.div>

      {/* Overlay for Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && window.innerWidth < 768 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed top-16 left-0 right-0 bottom-0 bg-gray-800 z-30"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>
    </>
  );
});

export default Header;