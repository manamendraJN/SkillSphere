import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';

const CreateNewLearningPlan = () => {
  const { token } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('');
  const [modules, setModules] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Get today's date formatted as YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  const handleAdd = async () => {
    if (!title || !description || !duration || !deadline || !status || !modules) {
      setErrorMessage('Please fill out all fields');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await axios.post(
        'http://localhost:8080/api/learning-plans',
        {
          title,
          description,
          duration,
          deadline,
          status,
          modules: modules.split(',').map((m) => m.trim()),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccessMessage('Learning plan created successfully!');
      setTimeout(() => {
        setSuccessMessage('');
        navigate('/learning-plans');
      }, 2000);
    } catch (error) {
      setErrorMessage('Error creating learning plan. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
      console.error('Error adding learning plan:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-teal-50 font-sans">
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <h2 className="text-3xl font-bold text-[#00796b] mb-8 flex items-center">
          <span className="mr-2">📚</span> Create New Learning Plan
        </h2>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-[#66bb6a] text-[#00796b] rounded-lg flex items-center shadow-md animate-fade-in">
            <CheckCircle className="mr-2" size={20} />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center shadow-md animate-fade-in">
            <XCircle className="mr-2" size={20} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white p-8 rounded-xl shadow-md border-2 border-[#00796b]">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-[#00796b] mb-1">
                Title
              </label>
              <input
                id="title"
                type="text"
                placeholder="Enter the title of your learning plan"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00796b] focus:outline-none shadow-sm transition-all"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-required="true"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[#00796b] mb-1">
                Description
              </label>
              <textarea
                id="description"
                placeholder="Describe your learning plan"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00796b] focus:outline-none shadow-sm transition-all"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                aria-required="true"
              />
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-[#00796b] mb-1">
                Duration (e.g., 4 weeks)
              </label>
              <input
                id="duration"
                type="text"
                placeholder="Enter the duration of your plan"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00796b] focus:outline-none shadow-sm transition-all"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                aria-required="true"
              />
            </div>

            {/* Deadline */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-[#00796b] mb-1">
                Deadline
              </label>
              <input
                id="deadline"
                type="date"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00796b] focus:outline-none shadow-sm transition-all"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={today}
                aria-required="true"
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-[#00796b] mb-1">
                Status
              </label>
              <select
                id="status"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00796b] focus:outline-none shadow-sm transition-all"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                aria-required="true"
              >
                <option value="">-- Select Status --</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Modules */}
            <div>
              <label htmlFor="modules" className="block text-sm font-medium text-[#00796b] mb-1">
                Modules (comma-separated)
              </label>
              <input
                id="modules"
                type="text"
                placeholder="e.g., HTML Basics, CSS Styling, JavaScript Fundamentals"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00796b] focus:outline-none shadow-sm transition-all"
                value={modules}
                onChange={(e) => setModules(e.target.value)}
                aria-required="true"
              />
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                onClick={handleAdd}
                disabled={loading}
                className={`flex-1 bg-[#00796b] text-white px-5 py-3 rounded-lg shadow hover:bg-teal-700 transition-all flex items-center justify-center ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                ) : (
                  <span className="mr-2">➕</span>
                )}
                {loading ? 'Creating...' : 'Add Learning Plan'}
              </button>
              <button
                onClick={() => navigate('/learning-plans')}
                className="flex-1 bg-gray-500 text-white px-5 py-3 rounded-lg shadow hover:bg-gray-600 transition-all flex items-center justify-center"
              >
                <XCircle className="mr-2" size={18} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewLearningPlan;