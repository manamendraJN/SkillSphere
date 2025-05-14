import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Key, Trash2, CheckCircle, User } from 'lucide-react';

const Profile = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ username: '', email: '' });
  const [updateForm, setUpdateForm] = useState({ previousPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inputErrors, setInputErrors] = useState({ newPassword: false, confirmPassword: false });

  useEffect(() => {
    if (!user || !token) {
      console.log('No user or token, redirecting to login');
      navigate('/login');
      return;
    }

    console.log('Fetching profile with token:', token); // Debug token

    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Profile fetch successful:', response.data); // Debug response
        setProfile({ username: response.data.username, email: response.data.email });
      } catch (err) {
        const errorMessage = err.response?.data || err.message;
        console.error('Profile fetch failed:', errorMessage); // Debug error
        setError('Failed to fetch profile: ' + errorMessage);
      }
    };

    fetchProfile();
  }, [user, token, navigate]);

  const validateInputs = () => {
    const errors = { newPassword: false, confirmPassword: false };
    if (updateForm.newPassword.length < 8) {
      errors.newPassword = true;
      setError('New password must be at least 8 characters long');
    }
    if (updateForm.newPassword !== updateForm.confirmPassword) {
      errors.confirmPassword = true;
      setError('New password and confirm password do not match');
    }
    setInputErrors(errors);
    return !errors.newPassword && !errors.confirmPassword;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateInputs()) return;

    console.log('Sending password update with token:', token); // Debug token
    console.log('Update form data:', updateForm); // Debug form data

    try {
      const response = await axios.put(
        'http://localhost:8080/api/auth/profile',
        updateForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Password update successful:', response.data); // Debug response
      localStorage.setItem('token', response.data.token);
      setSuccess('Password updated successfully');
      setUpdateForm({ previousPassword: '', newPassword: '', confirmPassword: '' });
      setInputErrors({ newPassword: false, confirmPassword: false });
    } catch (err) {
      const errorMessage = err.response?.data === 'Incorrect previous password'
        ? 'The previous password is incorrect'
        : err.response?.data || err.message;
      console.error('Password update failed:', errorMessage); // Debug error
      setError(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    setError('');
    setSuccess('');

    console.log('Sending delete request with token:', token); // Debug token

    try {
      await axios.delete('http://localhost:8080/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Account deleted successfully'); // Debug success
      logout();
      navigate('/login');
    } catch (err) {
      const errorMessage = err.response?.data || err.message;
      console.error('Account deletion failed:', errorMessage); // Debug error
      setError('Failed to delete account: ' + errorMessage);
    }
  };

  // Animation variants for inputs
  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3, ease: 'easeOut' },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="container mx-auto p-6 max-w-lg min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-gray-100"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-teal-200 p-8 w-full relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M30 0L0 30l30 30 30-30L30 0z%22 fill=%22%23e6fffa%22 fill-opacity=%220.1%22/%3E%3C/svg%3E')] opacity-50 pointer-events-none"></div>

        {/* Header with Avatar */}
        <div className="flex items-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mr-4"
          >
            <User className="w-6 h-6 text-teal-600" />
          </motion.div>
          <h2 className="text-3xl font-extrabold text-teal-800 flex items-center">
            <Key className="w-7 h-7 mr-2 text-teal-600" /> Profile Settings
          </h2>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-orange-100 p-3 rounded-lg flex items-center space-x-2 text-orange-600 font-semibold mb-4"
            >
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-teal-100 p-3 rounded-lg flex items-center space-x-2 text-teal-600 font-semibold mb-4"
            >
              <CheckCircle className="w-5 h-5" />
              <p>{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Details */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 p-4 bg-teal-50 rounded-xl border border-teal-200"
        >
          <h3 className="text-lg font-semibold text-teal-800 mb-2">Profile Details</h3>
          <p className="text-gray-700"><strong>Username:</strong> {profile.username}</p>
          <p className="text-gray-700"><strong>Email:</strong> {profile.email}</p>
        </motion.div>

        {/* Password Update Form */}
        <form onSubmit={handleUpdate} className="space-y-6">
          {[
            { id: 'previousPassword', label: 'Previous Password', value: updateForm.previousPassword, error: false },
            { id: 'newPassword', label: 'New Password', value: updateForm.newPassword, error: inputErrors.newPassword },
            { id: 'confirmPassword', label: 'Confirm New Password', value: updateForm.confirmPassword, error: inputErrors.confirmPassword },
          ].map((field, index) => (
            <motion.div
              key={field.id}
              custom={index}
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              className="relative"
            >
              <input
                type="password"
                id={field.id}
                value={field.value}
                onChange={(e) => setUpdateForm({ ...updateForm, [field.id]: e.target.value })}
                className={`w-full p-3 bg-transparent border ${field.error ? 'border-red-400' : 'border-teal-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder-gray-400 peer transition-all`}
                placeholder={field.label}
                required
              />
              <label className="absolute -top-2 left-3 px-1 text-sm text-gray-600 bg-white peer-focus:text-teal-600 transition-all">
                {field.label}
              </label>
            </motion.div>
          ))}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 4px 15px rgba(45, 212, 191, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-full hover:from-teal-600 hover:to-teal-800 transition-all duration-300"
          >
            <Key className="w-5 h-5 mr-2" /> Update Password
          </motion.button>
        </form>

        {/* Delete Account Button */}
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDelete}
          className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-full hover:from-red-600 hover:to-red-800 transition-all duration-300 mt-4"
        >
          <Trash2 className="w-5 h-5 mr-2" /> Delete Account
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Profile;