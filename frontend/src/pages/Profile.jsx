import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Key, Trash2, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ username: '', email: '' });
  const [updateForm, setUpdateForm] = useState({ previousPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validation for password match
    if (updateForm.newPassword !== updateForm.confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="container mx-auto p-6 max-w-lg"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-teal-200 p-6">
        <h2 className="text-2xl font-bold text-teal-800 mb-6 flex items-center">
          <Key className="w-6 h-6 mr-2 text-teal-600" /> Profile Settings
        </h2>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-100 p-3 rounded-lg flex items-center space-x-2 text-orange-600 font-semibold mb-4"
          >
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </motion.div>
        )}

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-teal-100 p-3 rounded-lg flex items-center space-x-2 text-teal-600 font-semibold mb-4"
          >
            <CheckCircle className="w-5 h-5" />
            <p>{success}</p>
          </motion.div>
        )}

        {/* Profile Details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-teal-800">Profile Details</h3>
          <p className="text-gray-600 mt-2"><strong>Username:</strong> {profile.username}</p>
          <p className="text-gray-600"><strong>Email:</strong> {profile.email}</p>
        </div>

        {/* Password Update Form */}
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="relative">
            <input
              type="password"
              id="previousPassword"
              value={updateForm.previousPassword}
              onChange={(e) => setUpdateForm({ ...updateForm, previousPassword: e.target.value })}
              className="w-full p-3 bg-transparent border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder-gray-400 peer"
              placeholder="Previous Password"
              required
            />
            <label className="absolute -top-2 left-3 px-1 text-sm text-gray-600 bg-white peer-focus:text-teal-600 transition-all">
              Previous Password
            </label>
          </div>
          <div className="relative">
            <input
              type="password"
              id="newPassword"
              value={updateForm.newPassword}
              onChange={(e) => setUpdateForm({ ...updateForm, newPassword: e.target.value })}
              className="w-full p-3 bg-transparent border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder-gray-400 peer"
              placeholder="New Password"
              required
            />
            <label className="absolute -top-2 left-3 px-1 text-sm text-gray-600 bg-white peer-focus:text-teal-600 transition-all">
              New Password
            </label>
          </div>
          <div className="relative">
            <input
              type="password"
              id="confirmPassword"
              value={updateForm.confirmPassword}
              onChange={(e) => setUpdateForm({ ...updateForm, confirmPassword: e.target.value })}
              className="w-full p-3 bg-transparent border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder-gray-400 peer"
              placeholder="Confirm New Password"
              required
            />
            <label className="absolute -top-2 left-3 px-1 text-sm text-gray-600 bg-white peer-focus:text-teal-600 transition-all">
              Confirm New Password
            </label>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors"
          >
            <Key className="w-5 h-5 mr-2" /> Update Password
          </motion.button>
        </form>

        {/* Delete Account Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDelete}
          className="w-full flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors mt-4"
        >
          <Trash2 className="w-5 h-5 mr-2" /> Delete Account
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Profile;