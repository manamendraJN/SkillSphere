import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Key, Trash2, CheckCircle, User, Image } from 'lucide-react';

const Profile = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ username: '', email: '', profileIcon: '' });
  const [updateForm, setUpdateForm] = useState({ previousPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inputErrors, setInputErrors] = useState({ newPassword: false, confirmPassword: false });
  const [profileIconFile, setProfileIconFile] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      console.log('No user or token, redirecting to login');
      navigate('/login');
      return;
    }

    console.log('Fetching profile with token:', token);

    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Profile fetch successful:', response.data);
        setProfile({
          username: response.data.username,
          email: response.data.email,
          profileIcon: response.data.profileIcon || '',
        });
        localStorage.setItem('profileIcon', response.data.profileIcon || '');
      } catch (err) {
        const errorMessage = err.response?.data || err.message;
        console.error('Profile fetch failed:', errorMessage);
        setError('Failed to fetch profile: ' + errorMessage);
      }
    };

    fetchProfile();
  }, [user, token, navigate]);

  const validateInputs = () => {
    const errors = { newPassword: false, confirmPassword: false };
    if (updateForm.newPassword && updateForm.newPassword.length < 8) {
      errors.newPassword = true;
      setError('New password must be at least 8 characters long');
    }
    if (updateForm.newPassword && updateForm.newPassword !== updateForm.confirmPassword) {
      errors.confirmPassword = true;
      setError('New password and confirm password do not match');
    }
    setInputErrors(errors);
    return !errors.newPassword && !errors.confirmPassword;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('Image size must be less than 2MB');
        return;
      }
      // Check image resolution
      const img = new Image();
      img.onload = () => {
        if (img.width < 128 || img.height < 128) {
          setError('Image resolution must be at least 128x128 pixels for clarity');
          return;
        }
        setProfileIconFile(file);
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (updateForm.newPassword && !validateInputs()) return;

    console.log('Sending profile update with token:', token);

    try {
      let profileIconBase64 = profile.profileIcon;
      if (profileIconFile) {
        const reader = new FileReader();
        profileIconBase64 = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(profileIconFile);
        });
      }

      const updateData = {
        username: profile.username,
        email: profile.email,
        password: updateForm.newPassword || undefined,
        profileIcon: profileIconBase64,
      };

      const response = await axios.put(
        'http://localhost:8080/api/auth/profile',
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Profile update successful:', response.data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('profileIcon', profileIconBase64 || '');
      setSuccess('Profile updated successfully');
      setUpdateForm({ previousPassword: '', newPassword: '', confirmPassword: '' });
      setInputErrors({ newPassword: false, confirmPassword: false });
      setProfileIconFile(null);
      setProfile((prev) => ({ ...prev, profileIcon: profileIconBase64 }));
    } catch (err) {
      const errorMessage = err.response?.data || err.message;
      console.error('Profile update failed:', errorMessage);
      setError(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    setError('');
    setSuccess('');

    console.log('Sending delete request with token:', token);

    try {
      await axios.delete('http://localhost:8080/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Account deleted successfully');
      logout();
      navigate('/login');
    } catch (err) {
      const errorMessage = err.response?.data || err.message;
      console.error('Account deletion failed:', errorMessage);
      setError('Failed to delete account: ' + errorMessage);
    }
  };

  const toggleImageModal = () => {
    setIsImageModalOpen((prev) => !prev);
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3, ease: 'easeOut' },
    }),
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="container mx-auto p-8 max-w-lg min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-gray-100"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-teal-200 p-8 w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M30 0L0 30l30 30 30-30L30 0z%22 fill=%22%23e6fffa%22 fill-opacity=%220.1%22/%3E%3C/svg%3E')] opacity-50 pointer-events-none"></div>

        {/* Header with Centered Avatar */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            className="w-32 h-32 bg-teal-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-teal-400 shadow-lg cursor-pointer"
            onClick={toggleImageModal}
          >
            {profile.profileIcon ? (
              <img src={profile.profileIcon} alt="Profile Icon" className="w-full h-full object-cover" />
            ) : (
              <User className="w-16 h-16 text-teal-600" />
            )}
          </motion.div>
          <h2 className="mt-6 text-3xl font-extrabold text-teal-800 flex items-center">
            <Key className="w-7 h-7 mr-2 text-teal-600" /> Profile Settings
          </h2>
        </div>

        {/* Image Preview Modal */}
        <AnimatePresence>
          {isImageModalOpen && profile.profileIcon && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={toggleImageModal}
            >
              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white rounded-xl p-4 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={profile.profileIcon}
                  alt="Profile Icon Preview"
                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                />
                <button
                  onClick={toggleImageModal}
                  className="mt-4 w-full px-4 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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

        <form onSubmit={handleUpdate} className="space-y-6">
          <motion.div
            custom={0}
            variants={inputVariants}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            <input
              type="file"
              id="profileIcon"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-3 bg-transparent border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder-gray-400 peer transition-all shadow-sm"
            />
            <label className="absolute -top-2 left-3 px-1 text-sm text-gray-600 bg-white peer-focus:text-teal-600 transition-all">
              Profile Icon
            </label>
          </motion.div>

          {[
            { id: 'previousPassword', label: 'Previous Password', value: updateForm.previousPassword, error: false },
            { id: 'newPassword', label: 'New Password', value: updateForm.newPassword, error: inputErrors.newPassword },
            { id: 'confirmPassword', label: 'Confirm New Password', value: updateForm.confirmPassword, error: inputErrors.confirmPassword },
          ].map((field, index) => (
            <motion.div
              key={field.id}
              custom={index + 1}
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
                className={`w-full p-3 bg-transparent border ${field.error ? 'border-red-400' : 'border-teal-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder-gray-400 peer transition-all shadow-sm`}
                placeholder={field.label}
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
            className="w-full flex items-center font-bold justify-center px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-full hover:from-teal-600 hover:to-teal-800 transition-all duration-300"
          >
            <Key className="w-5 h-5 mr-2" /> Update Profile
          </motion.button>
        </form>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDelete}
          className="w-full flex items-center font-bold justify-center px-4 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-full hover:from-red-600 hover:to-red-800 transition-all duration-300 mt-4"
        >
          <Trash2 className="w-5 h-5 mr-2" /> Delete Account
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Profile;