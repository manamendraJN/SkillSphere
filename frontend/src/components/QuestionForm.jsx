import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, AlertCircle, HelpCircle } from 'lucide-react';

const QuestionForm = ({ isOpen, onClose, onQuestionAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in to ask a question');
      return;
    }
    setError(null);
    axios
      .post('http://localhost:8080/api/create/questions', { title, description })
      .then((response) => {
        onQuestionAdded(response.data);
        setTitle('');
        setDescription('');
        onClose();
      })
      .catch((error) => {
        console.error('Error adding question:', error);
        setError('Failed to add question. Please try again.');
      });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-white rounded-2xl shadow-3xl border border-teal-200 w-full max-w-lg p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-teal-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </motion.button>

          {/* Header */}
          <h2 className="text-2xl font-bold text-teal-800 mb-6 flex items-center">
            <HelpCircle className="w-6 h-6 mr-2 text-teal-600" /> Ask a Question
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Question Title"
                className="w-full p-3 bg-transparent border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder-gray-600 peer"
                required
              />
              <label className="absolute -top-2 left-3 px-1 text-sm text-gray-600 bg-white peer-focus:text-teal-600 transition-all">
                Title
              </label>
            </div>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className="w-full p-3 bg-transparent border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder-gray-600 peer"
                rows="4"
                required
              />
              <label className="absolute -top-2 left-3 px-1 text-sm text-gray-600 bg-white peer-focus:text-teal-600 transition-all">
                Description
              </label>
            </div>
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="flex-1 flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors"
              >
                <Send className="w-5 h-5 mr-2" /> Submit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={onClose}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
              >
                <X className="w-5 h-5 mr-2" /> Cancel
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuestionForm;