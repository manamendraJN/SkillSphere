import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import QuestionForm from '../components/QuestionForm';
import QuestionList from '../components/QuestionList';
import { HelpCircle, PlusCircle } from 'lucide-react';

const QAPage = () => {
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [error, setError] = useState(null);

  // Fetch questions on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view questions');
      return;
    }

    axios
      .get('http://localhost:8080/api/getall/questions', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setQuestions(response.data);
        setFilteredQuestions(response.data);
        setError(null);
      })
      .catch((error) => {
        console.error('Error fetching questions:', error);
        setError('Failed to load questions');
      });
  }, []);

  // Handle new question addition
  const handleQuestionAdded = (newQuestion) => {
    setQuestions((prevQuestions) => [newQuestion, ...prevQuestions]); // Add new question to the top
    setFilteredQuestions((prevFiltered) => [newQuestion, ...prevFiltered]); // Update filtered questions
    setIsQuestionFormOpen(false);
  };

  return (
    <div className="min-h-screen bg-teal-50 py-12 px-4 sm:px-6 lg:px-8 ml-0">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <h1 className="text-4xl font-extrabold text-teal-800 mb-10 text-center flex items-center justify-center">
          <HelpCircle className="w-10 h-10 mr-3 text-teal-600" />
          Q&A Hub
        </h1>

        {/* Ask a Question Button */}
        <div className="mb-10 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsQuestionFormOpen(true)}
            className="px-6 py-3 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors flex items-center shadow-lg">
          
            <PlusCircle className="w-6 h-6 mr-2" />
            Ask a Question
          </motion.button>
        </div>

        {/* Question List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <QuestionList
            questions={questions}
            setQuestions={setQuestions}
            filteredQuestions={filteredQuestions}
            setFilteredQuestions={setFilteredQuestions}
            error={error}
            setError={setError}
          />
        </motion.div>

        {/* Question Form Modal */}
        <QuestionForm
          isOpen={isQuestionFormOpen}
          onClose={() => setIsQuestionFormOpen(false)}
          onQuestionAdded={handleQuestionAdded}
        />
      </div>
    </div>
  );
};

export default QAPage;