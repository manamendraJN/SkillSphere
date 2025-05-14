import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    const storedUsername = localStorage.getItem('username');
    const storedProfileIcon = localStorage.getItem('profileIcon');

    console.log('Stored values:', { storedToken, storedUserId, storedUsername, storedProfileIcon });

    if (storedToken && storedUserId && storedUsername) {
      console.log('Validating token...');
      axios
        .get('http://localhost:8080/api/auth/validate', {
          headers: { Authorization: `Bearer ${storedToken}` },
        })
        .then((response) => {
          console.log('Token validation successful:', response.data);
          setToken(storedToken);
          setUser({ id: storedUserId, username: storedUsername, profileIcon: storedProfileIcon || '' });
          setLoading(false);
          console.log('User state after validation:', { id: storedUserId, username: storedUsername, profileIcon: storedProfileIcon });
        })
        .catch((error) => {
          console.error('Token validation failed:', error.response?.data || error.message);
          setError('Failed to validate token. Please log in again.');
          logout();
          setLoading(false);
        });
    } else {
      console.log('No stored token/userId/username, skipping validation');
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      // Step 1: Authenticate user
      const response = await axios.post(
        'http://localhost:8080/api/auth/login',
        { username, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const { token, userId } = response.data;
      
      // Step 2: Fetch full profile to get profileIcon
      const profileResponse = await axios.get('http://localhost:8080/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { profileIcon } = profileResponse.data;

      // Step 3: Update state and localStorage
      setToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('username', username);
      localStorage.setItem('profileIcon', profileIcon || '');
      setUser({ username, id: userId, profileIcon: profileIcon || '' });
      setError(null);
      console.log('User after login:', { username, id: userId, profileIcon });
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (username, password, email) => {
    try {
      const response = await axios.post(
        'http://localhost:8080/api/auth/register',
        { username, password, email },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const { token, userId } = response.data;
      
      // Fetch profile after registration to get initial profileIcon (if any)
      const profileResponse = await axios.get('http://localhost:8080/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { profileIcon } = profileResponse.data;

      setToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('username', username);
      localStorage.setItem('profileIcon', profileIcon || '');
      setUser({ username, id: userId, profileIcon: profileIcon || '' });
      setError(null);
      console.log('User after register:', { username, id: userId, profileIcon });
    } catch (error) {
      console.error('Register error:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('profileIcon');
    console.log('Logged out, user state:', null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};