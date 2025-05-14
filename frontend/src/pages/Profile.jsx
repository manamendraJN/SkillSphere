import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
      const errorMessage = err.response?.data || err.message;
      console.error('Password update failed:', errorMessage); // Debug error
      setError('Failed to update password: ' + errorMessage);
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
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Profile Details</h3>
        <p><strong>Username:</strong> {profile.username}</p>
        <p><strong>Email:</strong> {profile.email}</p>
      </div>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label htmlFor="previousPassword" className="block text-sm font-medium">Previous Password</label>
          <input
            type="password"
            id="previousPassword"
            value={updateForm.previousPassword}
            onChange={(e) => setUpdateForm({ ...updateForm, previousPassword: e.target.value })}
            className="mt-1 block w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={updateForm.newPassword}
            onChange={(e) => setUpdateForm({ ...updateForm, newPassword: e.target.value })}
            className="mt-1 block w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={updateForm.confirmPassword}
            onChange={(e) => setUpdateForm({ ...updateForm, confirmPassword: e.target.value })}
            className="mt-1 block w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Update Password
        </button>
      </form>
      <button
        onClick={handleDelete}
        className="w-full bg-red-500 text-white p-2 rounded mt-4 hover:bg-red-600"
      >
        Delete Account
      </button>
    </div>
  );
};

export default Profile;