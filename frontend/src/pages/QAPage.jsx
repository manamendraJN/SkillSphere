import { useState } from 'react';
import { motion } from 'framer-motion';
import QuestionForm from '../components/QuestionForm';
import QuestionList from '../components/QuestionList';
import { HelpCircle, PlusCircle } from 'lucide-react';

const QAPage = () => {
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);

  const handleQuestionAdded = (newQuestion) => {
    console.log('New question added:', newQuestion);
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
            className="px-6 py-3 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors flex items-center shadow-md"
          >
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
          <QuestionList />
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