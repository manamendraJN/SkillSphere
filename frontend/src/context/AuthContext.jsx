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
    const validateStoredToken = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUserId = localStorage.getItem('userId');
      const storedUsername = localStorage.getItem('username');
      const storedProfileIcon = localStorage.getItem('profileIcon');

      console.log('Stored values:', { storedUserId, storedUsername, storedProfileIcon });

      if (storedToken && storedUserId && storedUsername && storedToken.startsWith('eyJ')) {
        try {
          console.log('Validating token...');
          const response = await axios.get('http://localhost:8080/api/auth/validate', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          console.log('Token validation successful:', response.data);
          setToken(storedToken);
          setUser({ id: storedUserId, username: storedUsername, profileIcon: storedProfileIcon || '' });
          setLoading(false);
          console.log('User state after validation:', { id: storedUserId, username: storedUsername, profileIcon: storedProfileIcon });
          if (!storedProfileIcon) {
            setError('No profile icon set. Upload an image in your profile settings.');
          }
        } catch (error) {
          const message = error.response?.status === 401 ? 'Token expired. Please log in again.' :
                          error.response?.status === 403 ? 'Invalid token. Please log in again.' :
                          'Failed to validate token. Please log in again.';
          console.error('Token validation failed:', message);
          setError(message);
          logout();
          setLoading(false);
        }
      } else {
        console.log('No valid stored token/userId/username, skipping validation');
        setLoading(false);
      }
    };

    validateStoredToken();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(
        'http://localhost:8080/api/auth/login',
        { username, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const { token, userId } = response.data;

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
      console.log('User after login:', { username, id: userId, profileIcon });
      if (!profileIcon) {
        setError('No profile icon set. Upload an image in your profile settings.');
      }
    } catch (error) {
      const message = error.response?.status === 401 ? 'Invalid username or password.' :
                      error.response?.status === 403 ? 'Access forbidden.' :
                      'Login failed. Please try again.';
      console.error('Login error:', message);
      setError(message);
      throw new Error(message);
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
      if (!profileIcon) {
        setError('No profile icon set. Upload an image in your profile settings.');
      }
    } catch (error) {
      const message = error.response?.status === 409 ? 'Username or email already exists.' :
                      error.response?.status === 400 ? 'Invalid registration data.' :
                      'Registration failed. Please try again.';
      console.error('Register error:', message);
      setError(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('profileIcon');
    setError(null);
    console.log('Logged out, user state:', null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};