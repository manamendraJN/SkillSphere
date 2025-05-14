import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Trash2, Edit2, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown,
  CheckCircle, MessageSquare, Send, User as UserIcon, AlertCircle, Search
} from 'lucide-react';

const QuestionList = ({ questions, setQuestions, filteredQuestions, setFilteredQuestions, error, setError }) => {
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [answerCounts, setAnswerCounts] = useState({});
  const [newAnswer, setNewAnswer] = useState({});
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editAnswerContent, setEditAnswerContent] = useState('');

  // Debug user and answers
  useEffect(() => {
    console.log('QuestionList user:', user);
    console.log('QuestionList answers:', answers);
  }, [user, answers]);

  // Update filtered questions based on search term
  useEffect(() => {
    const filtered = questions.filter((question) =>
      question.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredQuestions(filtered);
  }, [searchTerm, questions, setFilteredQuestions]);

  // Fetch answer counts for all questions
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || questions.length === 0) return;

    questions.forEach((question) => {
      axios
        .get(`http://localhost:8080/api/get/${question.id}/answers`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setAnswerCounts((prev) => ({
            ...prev,
            [question.id]: res.data.length,
          }));
        })
        .catch((err) => {
          console.error(`Error fetching answers for question ${question.id}:`, err);
        });
    });
  }, [questions]);

  const userQuestions = filteredQuestions.filter((question) => user && question.userId === user.id);
  const otherQuestions = filteredQuestions.filter((question) => user && question.userId !== user.id);

  const fetchAnswers = async (questionId) => {
    if (answers[questionId]) return;
    try {
      const response = await axios.get(`http://localhost:8080/api/get/${questionId}/answers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAnswers((prev) => ({ ...prev, [questionId]: response.data }));
    } catch (error) {
      console.error('Error fetching answers:', error);
      setError('Failed to load answers');
    }
  };

  const toggleAnswers = (questionId) => {
    if (expandedQuestionId === questionId) {
      setEnhancedQuestionId(null);
    } else {
      setExpandedQuestionId(questionId);
      fetchAnswers(questionId);
    }
  };

  const handleDeleteQuestion = (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    axios
      .delete(`http://localhost:8080/api/delete/questions/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then(() => {
        setQuestions(questions.filter((q) => q.id !== id));
        setFilteredQuestions(filteredQuestions.filter((q) => q.id !== id));
        setAnswers((prev) => {
          const newAnswers = { ...prev };
          delete newAnswers[id];
          return newAnswers;
        });
        setAnswerCounts((prev) => {
          const newCounts = { ...prev };
          delete newCounts[id];
          return newCounts;
        });
        setError(null);
      })
      .catch((error) => {
        console.error('Error deleting question:', error);
        setError(error.response?.data || 'You can only delete your own questions');
      });
  };

  const handleEditQuestion = (question) => {
    setEditingQuestionId(question.id);
    setEditTitle(question.title);
    setEditDescription(question.description);
  };

  const handleUpdateQuestion = (id) => {
    axios
      .put(
        `http://localhost:8080/api/edit/questions/${id}`,
        { title: editTitle, description: editDescription },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      .then((response) => {
        setQuestions(questions.map((q) => (q.id === id ? response.data : q)));
        setFilteredQuestions(filteredQuestions.map((q) => (q.id === id ? response.data : q)));
        setEditingQuestionId(null);
        setError(null);
      })
      .catch((error) => {
        console.error('Error updating question:', error);
        setError(error.response?.data || 'Failed to update question');
      });
  };

  const handleAddAnswer = (questionId, e) => {
    e.preventDefault();
    if (!localStorage.getItem('token')) {
      setError('Please log in to add an answer');
      return;
    }
    setError(null);
    axios
      .post(
        `http://localhost:8080/api/create/${questionId}/answers`,
        { content: newAnswer[questionId] || '' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      .then((response) => {
        setAnswers((prev) => ({
          ...prev,
          [questionId]: [...(prev[questionId] || []), response.data],
        }));
        setAnswerCounts((prev) => ({
          ...prev,
          [questionId]: (prev[questionId] || 0) + 1,
        }));
        setNewAnswer((prev) => ({ ...prev, [questionId]: '' }));
      })
      .catch((error) => {
        console.error('Error adding answer:', error);
        setError(error.response?.data || 'Failed to add answer');
      });
  };

  const handleEditAnswer = (answer) => {
    setEditingAnswerId(answer.id);
    setEditAnswerContent(answer.content);
  };

  const handleUpdateAnswer = (questionId, answerId) => {
    axios
      .put(
        `http://localhost:8080/api/edit/${questionId}/answers/${answerId}`,
        { content: editAnswerContent },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      .then((response) => {
        setAnswers((prev) => ({
          ...prev,
          [questionId]: prev[questionId].map((a) => (a.id === answerId ? response.data : a)),
        }));
        setEditingAnswerId(null);
        setError(null);
      })
      .catch((error) => {
        console.error('Error updating answer:', error);
        setError(error.response?.data || 'Failed to update answer');
      });
  };

  const handleUpvote = (questionId, answerId) => {
    axios
      .post(
        `http://localhost:8080/api/${questionId}/answers/${answerId}/upvote`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      .then((response) => {
        setAnswers((prev) => ({
          ...prev,
          [questionId]: prev[questionId].map((a) => (a.id === answerId ? response.data : a)),
        }));
      })
      .catch((error) => console.error('Error upvoting:', error.response?.data));
  };

  const handleDownvote = (questionId, answerId) => {
    axios
      .post(
        `http://localhost:8080/api/${questionId}/answers/${answerId}/downvote`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      .then((response) => {
        setAnswers((prev) => ({
          ...prev,
          [questionId]: prev[questionId].map((a) => (a.id === answerId ? response.data : a)),
        }));
      })
      .catch((error) => console.error('Error downvoting:', error.response?.data));
  };

  const handleMarkBest = (questionId, answerId) => {
    axios
      .post(
        `http://localhost:8080/api/${questionId}/answers/${answerId}/best`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      .then((response) => {
        setAnswers((prev) => ({
          ...prev,
          [questionId]: prev[questionId].map((a) => (a.id === answerId ? response.data : a)),
        }));
      })
      .catch((error) => console.error('Error marking best:', error.response?.data));
  };

  const handleDeleteAnswer = (questionId, answerId) => {
    if (!window.confirm('Are you sure you want to delete this answer?')) return;
    axios
      .delete(`http://localhost:8080/api/delete/${questionId}/answers/${answerId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then(() => {
        setAnswers((prev) => ({
          ...prev,
          [questionId]: prev[questionId].filter((a) => a.id !== answerId),
        }));
        setAnswerCounts((prev) => ({
          ...prev,
          [questionId]: prev[questionId] - 1,
        }));
        setError(null);
      })
      .catch((error) => {
        console.error('Error deleting answer:', error);
        setError(error.response?.data || 'You can only delete your own answers');
      });
  };

  const renderQuestions = (questions, sectionTitle) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-teal-800 flex items-center">
        <MessageSquare className="w-5 h-5 mr-1 text-teal-600" /> {sectionTitle}
      </h3>
      {questions.length === 0 ? (
        <p className="text-gray-700 text-sm flex items-center">
          <MessageSquare className="w-4 h-4 mr-1 text-teal-600" />
          {searchTerm ? 'No questions match your search.' : `No ${sectionTitle.toLowerCase()}.`}
        </p>
      ) : (
        <AnimatePresence>
          {questions.map((question) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              whileHover={{ scale: 1.01 }}
              className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-teal-200"
            >
              {editingQuestionId === question.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2 border border-teal-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm text-gray-900 font-medium"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full p-2 border border-teal-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm text-gray-900"
                    rows="2"
                  />
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpdateQuestion(question.id)}
                      className="px-3 py-1 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors flex items-center text-sm"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" /> Save
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditingQuestionId(null)}
                      className="px-3 py-1 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors flex items-center text-sm"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start space-x-3">
                    {user && question.userId === user.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-teal-400 shadow-md"
                      >
                        {user.profileIcon ? (
                          <img
                            src={user.profileIcon}
                            alt="Your Profile Icon"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.username?.charAt(0).toUpperCase() || <UserIcon className="w-8 h-8 text-teal-600" />
                        )}
                      </motion.div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{question.title}</h3>
                      <p className="text-gray-800 text-sm mt-1">{question.description}</p>
                      <p className="text-teal-700 text-sm font-medium mt-1 flex items-center">
                        <UserIcon className="w-3 h-3 mr-1" /> {question.username || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleAnswers(question.id)}
                      className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full hover:bg-teal-200 transition-colors flex items-center text-sm font-medium"
                    >
                      {expandedQuestionId === question.id ? (
                        <ChevronUp className="w-4 h-4 mr-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 mr-1" />
                      )}
                      {expandedQuestionId === question.id
                        ? 'Hide Answers'
                        : `Show Answers (${answerCounts[question.id] || 0})`}
                    </motion.button>
                    {user && question.userId === user.id && (
                      <div className="flex space-x-1">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEditQuestion(question)}
                          className="px-2 py-1 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors flex items-center text-sm"
                        >
                          <Edit2 className="w-3 h-3 mr-1" /> Edit
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="px-2 py-1 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors flex items-center text-sm"
                        >
                          <Trash2 className="w-3 h-3 mr-1" /> Delete
                        </motion.button>
                      </div>
                    )}
                  </div>
                  <AnimatePresence>
                    {expandedQuestionId === question.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3 space-y-3"
                      >
                        {answers[question.id]?.length > 0 ? (
                          answers[question.id].map((answer) => (
                            <div
                              key={answer.id}
                              className="p-3 bg-teal-50 rounded-lg flex items-start space-x-3"
                            >
                              {user && answer.userId === user.id && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ duration: 0.3 }}
                                  className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-teal-400 shadow-md"
                                >
                                  {user.profileIcon ? (
                                    <img
                                      src={user.profileIcon}
                                      alt="Your Profile Icon"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    user.username?.charAt(0).toUpperCase() || <UserIcon className="w-6 h-6 text-teal-600" />
                                  )}
                                </motion.div>
                              )}
                              <div className="flex-1">
                                {editingAnswerId === answer.id ? (
                                  <div className="space-y-2">
                                    <textarea
                                      value={editAnswerContent}
                                      onChange={(e) => setEditAnswerContent(e.target.value)}
                                      className="w-full p-2 border border-teal-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm text-gray-900"
                                      rows="2"
                                    />
                                    <div className="flex space-x-2">
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleUpdateAnswer(question.id, answer.id)}
                                        className="px-3 py-1 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors flex items-center text-sm"
                                      >
                                        <CheckCircle className="w-3 h-3 mr-1" /> Save
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setEditingAnswerId(null)}
                                        className="px-3 py-1 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors flex items-center text-sm"
                                      >
                                        Cancel
                                      </motion.button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <motion.div
                                      whileHover={{ scale: 1.01 }}
                                    >
                                      <p className="text-gray-900 text-sm">{answer.content}</p>
                                      <p className="text-teal-700 text-xs font-medium mt-1 flex items-center">
                                        <UserIcon className="w-3 h-3 mr-1" /> {answer.username || 'Unknown'}
                                      </p>
                                    </motion.div>
                                    <div className="mt-1 flex items-center space-x-3">
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleUpvote(question.id, answer.id)}
                                        className="text-teal-600 hover:text-teal-800 flex items-center text-sm"
                                      >
                                        <ThumbsUp className="w-3 h-3 mr-1" /> {answer.upvotes}
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleDownvote(question.id, answer.id)}
                                        className="text-teal-600 hover:text-teal-800 flex items-center text-sm"
                                      >
                                        <ThumbsDown className="w-3 h-3 mr-1" /> {answer.downvotes}
                                      </motion.button>
                                      {answer.isBestAnswer && (
                                        <span className="text-xs text-teal-600 font-medium flex items-center">
                                          <CheckCircle className="w-3 h-3 mr-1" /> Best Answer
                                        </span>
                                      )}
                                    </div>
                                    <div className="mt-2 flex space-x-2">
                                      {user && question.userId === user.id && (
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => handleMarkBest(question.id, answer.id)}
                                          className="px-2 py-1 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors flex items-center text-xs"
                                        >
                                          <CheckCircle className="w-3 h-3 mr-1" /> Mark as Best
                                        </motion.button>
                                      )}
                                      {user && answer.userId === user.id && (
                                        <>
                                          <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleEditAnswer(answer)}
                                            className="px-2 py-1 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors flex items-center text-xs"
                                          >
                                            <Edit2 className="w-3 h-3 mr-1" /> Edit
                                          </motion.button>
                                          <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleDeleteAnswer(question.id, answer.id)}
                                            className="px-2 py-1 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors flex items-center text-xs"
                                          >
                                            <Trash2 className="w-3 h-3 mr-1" /> Delete
                                          </motion.button>
                                        </>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-700 text-sm flex items-center">
                            <MessageSquare className="w-4 h-4 mr-1 text-teal-600" /> No answers yet.
                          </p>
                        )}
                        {user && question.userId !== user.id && (
                          <motion.form
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            onSubmit={(e) => handleAddAnswer(question.id, e)}
                            className="mt-3 bg-teal-50 p-3 rounded-lg"
                          >
                            <h4 className="text-sm font-semibold text-teal-800 mb-2 flex items-center">
                              <MessageSquare className="w-4 h-4 mr-1 text-teal-600" /> Add an Answer
                            </h4>
                            {error && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-orange-100 p-1 rounded-lg flex items-center space-x-1 text-orange-600 font-medium text-xs mb-2"
                              >
                                <AlertCircle className="w-4 h-4" />
                                <p>{error}</p>
                              </motion.div>
                            )}
                            <div className="relative">
                              <textarea
                                value={newAnswer[question.id] || ''}
                                onChange={(e) =>
                                  setNewAnswer((prev) => ({ ...prev, [question.id]: e.target.value }))
                                }
                                placeholder="Your Answer"
                                className="w-full p-2 bg-transparent border border-teal-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm text-gray-900 placeholder-gray-600 peer"
                                rows="3"
                                required
                              />
                              <label className="absolute -top-1.5 left-2 px-1 text-xs text-gray-600 bg-teal-50 peer-focus:text-teal-600 transition-all">
                                Answer
                              </label>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="submit"
                              className="mt-2 w-full px-3 py-1 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors flex items-center justify-center text-sm"
                            >
                              <Send className="w-3 h-3 mr-1" /> Submit Answer
                            </motion.button>
                          </motion.form>
                        )}
                        {user && question.userId === user.id && (
                          <p className="mt-2 text-gray-700 text-sm flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1 text-orange-600" /> You cannot answer your own question.
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-1/4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions..."
            className="w-full p-2 pl-8 border border-teal-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm text-gray-900"
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-teal-600" />
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-orange-100 p-2 rounded-lg flex items-center space-x-1 text-orange-600 text-sm font-medium"
        >
          <AlertCircle className="w-4 h-4" />
          <p>{error}</p>
        </motion.div>
      )}

      {!user ? (
        <p className="text-gray-700 text-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-1 text-orange-600" /> Please log in to view your questions.
        </p>
      ) : (
        <>
          {renderQuestions(userQuestions, 'Your Questions')}
          {renderQuestions(otherQuestions, 'Other Users\' Questions')}
        </>
      )}
    </div>
  );
};

export default QuestionList;