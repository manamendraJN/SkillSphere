import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ username: '', email: '' });
  const [updateForm, setUpdateForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile({ username: response.data.username, email: response.data.email });
        setUpdateForm({ username: response.data.username, email: response.data.email, password: '' });
      } catch (err) {
        setError('Failed to fetch profile: ' + (err.response?.data || err.message));
      }
    };

    fetchProfile();
  }, [user, token, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await axios.put(
        'http://localhost:8080/api/auth/profile',
        updateForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile({ username: updateForm.username, email: updateForm.email });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', updateForm.username);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile: ' + (err.response?.data || err.message));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete('http://localhost:8080/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      logout();
      navigate('/login');
    } catch (err) {
      setError('Failed to delete account: ' + (err.response?.data || err.message));
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Current Profile</h3>
        <p><strong>Username:</strong> {profile.username}</p>
        <p><strong>Email:</strong> {profile.email}</p>
      </div>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium">Username</label>
          <input
            type="text"
            id="username"
            value={updateForm.username}
            onChange={(e) => setUpdateForm({ ...updateForm, username: e.target.value })}
            className="mt-1 block w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input
            type="email"
            id="email"
            value={updateForm.email}
            onChange={(e) => setUpdateForm({ ...updateForm, email: e.target.value })}
            className="mt-1 block w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">New Password (optional)</label>
          <input
            type="password"
            id="password"
            value={updateForm.password}
            onChange={(e) => setUpdateForm({ ...updateForm, password: e.target.value })}
            className="mt-1 block w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Update Profile
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