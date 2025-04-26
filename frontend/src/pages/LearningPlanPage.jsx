import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Trash2, Pencil } from 'lucide-react'; // Added Pencil icon for Edit

const LearningPlanPage = () => {
  const { token, loading } = useContext(AuthContext);
  const [learningPlans, setLearningPlans] = useState([]);
  const [expandedPlanId, setExpandedPlanId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [editPlanId, setEditPlanId] = useState(null); // For tracking which plan is being edited
  const [editedPlanData, setEditedPlanData] = useState({}); // Temporary edited plan data
  const navigate = useNavigate();

  const getInitial = (username) => {
    return username && username.length > 0 ? username.charAt(0).toUpperCase() : 'U';
  };

  const fetchLearningPlans = async () => {
    if (!loading && token) {
      try {
        const response = await axios.get('http://localhost:8080/api/learning-plans', {
          headers: { Authorization: `Bearer ${token}` },
        });
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

  const handleDeletePlan = async (planId) => {
    try {
      await axios.delete(`http://localhost:8080/api/learning-plans/${planId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLearningPlans(learningPlans.filter(plan => plan.id !== planId));
      setShowConfirmDelete(false);
      setPlanToDelete(null);
    } catch (error) {
      console.error('Error deleting learning plan:', error);
    }
  };

  const handleEditClick = (plan) => {
    setEditPlanId(plan.id);
    setEditedPlanData({
      title: plan.title || '',
      description: plan.description || '',
      duration: plan.duration || '',
      deadline: plan.deadline || '',
      status: plan.status || '',
    });
  };

  const handleCancelEdit = () => {
    setEditPlanId(null);
    setEditedPlanData({});
  };

  const handleSaveEdit = async (planId) => {
    try {
      await axios.put(`http://localhost:8080/api/learning-plans/${planId}`, editedPlanData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLearningPlans();
      setEditPlanId(null);
      setEditedPlanData({});
    } catch (error) {
      console.error('Error updating learning plan:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedPlanData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddComment = (planId, comment, resourceLink) => {
    console.log('Add comment:', comment, 'Resource:', resourceLink, 'for plan:', planId);
  };

  const handleMarkComplete = (planId) => {
    console.log('Mark plan as complete:', planId);
  };

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
                  <div className="flex space-x-2">
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
                    <button
                      onClick={() => handleEditClick(plan)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit Plan"
                    >
                      <Pencil size={22} />
                    </button>
                  </div>
                </div>

                {expandedPlanId === plan.id && (
                  <div className="mt-5 border-t pt-4 text-gray-700 space-y-3 relative">
                    <button
                      onClick={() => {
                        setPlanToDelete(plan.id);
                        setShowConfirmDelete(true);
                      }}
                      className="absolute top-0 right-0 text-red-600 hover:text-red-800"
                      title="Delete Plan"
                    >
                      <Trash2 size={22} />
                    </button>

                    {editPlanId === plan.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          name="title"
                          value={editedPlanData.title}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded"
                          placeholder="Title"
                        />
                        <textarea
                          name="description"
                          value={editedPlanData.description}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded"
                          placeholder="Description"
                        />
                        <input
                          type="text"
                          name="duration"
                          value={editedPlanData.duration}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded"
                          placeholder="Duration"
                        />
                        <input
                          type="date"
                          name="deadline"
                          value={editedPlanData.deadline}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded"
                        />
                        <input
                          type="text"
                          name="status"
                          value={editedPlanData.status}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded"
                          placeholder="Status"
                        />

                        <div className="flex space-x-4 mt-3">
                          <button
                            onClick={() => handleSaveEdit(plan.id)}
                            className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600"
                          >
                            💾 Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-gray-400 text-white px-4 py-2 rounded-full hover:bg-gray-500"
                          >
                            ❌ Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}
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

      {/* Confirm Delete Popup */}
      {showConfirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this learning plan?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowConfirmDelete(false);
                  setPlanToDelete(null);
                }}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePlan(planToDelete)}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPlanPage;
