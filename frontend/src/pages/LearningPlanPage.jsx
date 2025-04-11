import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

const LearningPlanPage = () => {
  const { token, loading } = useContext(AuthContext);
  const [learningPlans, setLearningPlans] = useState([]);
  const [expandedPlanId, setExpandedPlanId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Helper to get the first letter of the username in uppercase
  const getInitial = (username) => {
    return username && username.length > 0 ? username.charAt(0).toUpperCase() : 'U';
  };

  const fetchLearningPlans = async () => {
    if (!loading && token) {
      try {
        const response = await axios.get('http://localhost:8080/api/learning-plans', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('All learning plans fetched:', response.data);
        setLearningPlans(response.data);
      } catch (error) {
        console.error('Error fetching all learning plans:', error);
      }
    }
  };
  
  useEffect(() => {
    fetchLearningPlans();
  }, [loading, token]);

  const toggleExpand = (planId) => {
    setExpandedPlanId(expandedPlanId === planId ? null : planId);
  };

  // Filter plans based on the search term
  const filteredPlans = learningPlans.filter((plan) =>
    plan.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-gradient-to-br from-[#e0f7fa] to-[#f1f8e9] min-h-screen font-sans">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-[#00796b] mb-8 drop-shadow-md">
          📚 My Learning Plans
        </h2>

        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="🔍 Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-1/2 p-2 rounded-full border border-gray-300 focus:ring focus:ring-teal-300 shadow"
          />
          <button
            onClick={() => navigate('/add-learning-plan')}
            className="bg-[#00796b] text-white px-6 py-2 rounded-full shadow hover:bg-[#004d40] transition"
          >
            ➕ Create New Learning Plan
          </button>
        </div>

        <div className="space-y-6">
          {filteredPlans.length > 0 ? (
            filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-2xl shadow-lg px-6 py-5 border border-gray-100 hover:shadow-xl transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    {/* Owner Avatar */}
                    <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-lg mr-4">
                      {getInitial(plan.username)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">
                        {plan.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        🗓 Deadline: {plan.deadline || 'No deadline specified'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleExpand(plan.id)}
                    className="text-[#00796b] flex items-center px-3 py-1 bg-[#e0f2f1] hover:bg-[#b2dfdb] rounded-full transition"
                  >
                    {expandedPlanId === plan.id ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" /> Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" /> Show Details
                      </>
                    )}
                  </button>
                </div>

                {expandedPlanId === plan.id && (
                  <div className="mt-5 border-t pt-4 text-gray-700 space-y-3">
                    <p>
                      <strong>Description:</strong>{' '}
                      {plan.description || 'No description available'}
                    </p>
                    <p>
                      <strong>Duration:</strong>{' '}
                      {plan.duration || 'Not specified'} hrs
                    </p>
                    <p>
                      <strong>Status:</strong>{' '}
                      {plan.status || 'Status unknown'}
                    </p>
                    <p>
                      <strong>Modules:</strong>{' '}
                      {plan.modules && plan.modules.length > 0
                        ? plan.modules.join(', ')
                        : 'No modules assigned'}
                    </p>
                    <p>
                      <strong>Progress:</strong>{' '}
                      {plan.completed ? (
                        <span className="text-green-600 font-semibold">
                          Completed ✅
                        </span>
                      ) : (
                        <button
                          onClick={() => handleMarkComplete(plan.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded-full text-xs hover:bg-green-600"
                        >
                          Mark as Completed
                        </button>
                      )}
                    </p>

                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        💬 Comments
                      </h4>
                      <ul className="space-y-2">
                        {plan.comments && plan.comments.length > 0 ? (
                          plan.comments.map((c, idx) => (
                            <li key={idx} className="bg-gray-100 p-3 rounded-xl">
                              <strong>{c.username || 'User'}:</strong> {c.message}
                              {c.resourceLink && (
                                <div>
                                  🔗{' '}
                                  <a
                                    href={c.resourceLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                  >
                                    View Resource
                                  </a>
                                </div>
                              )}
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500">No comments yet.</li>
                        )}
                      </ul>

                      <div className="mt-3 grid gap-2">
                        <input
                          type="text"
                          placeholder="Write your comment..."
                          className="border p-2 rounded-md focus:ring focus:ring-teal-300"
                          id={`comment-${plan.id}`}
                        />
                        <input
                          type="text"
                          placeholder="Optional: Resource link"
                          className="border p-2 rounded-md focus:ring focus:ring-teal-300"
                          id={`resource-${plan.id}`}
                        />
                        <button
                          onClick={() =>
                            handleAddComment(
                              plan.id,
                              document.getElementById(`comment-${plan.id}`).value,
                              document.getElementById(`resource-${plan.id}`).value
                            )
                          }
                          className="bg-[#00796b] text-white px-4 py-2 rounded-full hover:bg-[#004d40]"
                        >
                          ➕ Add Comment
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-10">
              No learning plans found for "{searchTerm}".
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPlanPage;
