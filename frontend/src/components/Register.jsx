import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, User as UserIcon, Lock, Mail, UserPlus } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  // Password validation function
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return 'Password must be at least 8 characters long';
    }
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!hasLowerCase) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!hasNumber) {
      return 'Password must contain at least one number';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character (e.g., !@#$%)';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setPasswordError(null);

    // Validate password strength
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setPasswordError('Confirm password does not match');
      return;
    }

    try {
      await register(username, password, email);
      navigate('/');
    } catch (err) {
      setError(err.response?.status === 409 ? 'Username already exists' : 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4 mr-10">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-teal-200"
      >
        <h2 className="text-3xl font-extrabold text-teal-800 mb-6 flex items-center">
          <UserPlus className="w-8 h-8 mr-2 text-teal-600" /> Register
        </h2>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-orange-100 p-3 rounded-lg flex items-center space-x-2 text-orange-600 font-semibold mb-6"
          >
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </motion.div>
        )}

        {passwordError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-orange-100 p-3 rounded-lg flex items-center space-x-2 text-orange-600 font-semibold mb-6"
          >
            <AlertCircle className="w-5 h-5" />
            <p>{passwordError}</p>
          </motion.div>
        )}

        <div className="space-y-6">
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full p-3 pl-10 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 peer"
              required
            />
            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-600" />
            <label className="absolute -top-2 left-3 px-1 text-sm text-gray-600 bg-white peer-focus:text-teal-600 transition-all">
              Username
            </label>
          </div>

          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3 pl-10 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 peer"
              required
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-600" />
            <label className="absolute -top-2 left-3 px-1 text-sm text-gray-600 bg-white peer-focus:text-teal-600 transition-all">
              Email
            </label>
          </div>

          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 pl-10 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 peer"
              required
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-600" />
            <label className="absolute -top-2 left-3 px-1 text-sm text-gray-600 bg-white peer-focus:text-teal-600 transition-all">
              Password
            </label>
          </div>

          <div className="relative">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full p-3 pl-10 border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 peer"
              required
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-600" />
            <label className="absolute -top-2 left-3 px-1 text-sm text-gray-600 bg-white peer-focus:text-teal-600 transition-all">
              Confirm Password
            </label>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full px-4 py-3 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors flex items-center justify-center font-semibold"
          >
            <UserPlus className="w-5 h-5 mr-2" /> Register
          </motion.button>
        </div>

        <p className="mt-4 text-gray-700 text-center">
          Already have an account?{' '}
          <a href="/login" className="text-teal-600 hover:text-teal-800 font-medium">
            Login
          </a>
        </p>
      </motion.form>
    </div>
  );
};

export default Register;