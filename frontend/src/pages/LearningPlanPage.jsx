import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Trash2, Pencil, BookOpen } from 'lucide-react';

const LearningPlanPage = () => {
  const { token, loading, user } = useContext(AuthContext);
  const [learningPlans, setLearningPlans] = useState([]);
  const [expandedPlanId, setExpandedPlanId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [editPlanId, setEditPlanId] = useState(null);
  const [editedPlanData, setEditedPlanData] = useState({});
  const [showMyPlansOnly, setShowMyPlansOnly] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
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
        console.error('Error fetching learning plans:', error);
      }
    }
  };

  useEffect(() => {
    fetchLearningPlans();
  }, [loading, token]);

  const toggleExpand = (planId) => {
    setExpandedPlanId(expandedPlanId === planId ? null : planId);
  };

  const handleDeletePlan = async () => {
    if (planToDelete) {
      try {
        await axios.delete(`http://localhost:8080/api/learning-plans/${planToDelete}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setLearningPlans(learningPlans.filter(plan => plan.id !== planToDelete));
        setShowConfirmDelete(false);
        setPlanToDelete(null);
      } catch (error) {
        console.error('Error deleting learning plan:', error);
      }
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
    setPlanToDelete(null);
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
      setSuccessMessage('✅ Plan updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000); // Message disappears after 3 seconds
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

  const filteredPlans = learningPlans.filter((plan) => {
    const matchesSearch = plan.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = !showMyPlansOnly || (user?.username && plan.username === user.username);
    return matchesSearch && matchesUser;
  });

  return (
    <div className="p-8 min-h-screen font-sans bg-gray-50">
      <div className="max-w-5xl mx-auto mt-4">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 text-green-800 bg-green-100 rounded-lg text-center font-semibold shadow">
            {successMessage}
          </div>
        )}

        <h2 className="text-3xl font-bold text-center text-[#00796b] mb-8 drop-shadow-md flex items-center justify-center">
          <BookOpen className="mr-2 text-[#00796b]" size={30} />
          Explore Learning Plans
        </h2>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
          <input
            type="text"
            placeholder="🔍 Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-1/2 p-2 rounded-full border border-gray-300 focus:ring focus:ring-teal-300 shadow"
          />
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/add-learning-plan')}
              className="bg-[#00796b] text-white px-6 py-2 rounded-full shadow hover:bg-[#004d40] transition"
            >
              ➕ Create New Plan
            </button>
            <button
              onClick={() => setShowMyPlansOnly(!showMyPlansOnly)}
              className={`px-4 py-2 rounded-full ${
                showMyPlansOnly ? 'bg-[#004d40]' : 'bg-[#00796b]'
              } text-white shadow hover:opacity-90`}
            >
              {showMyPlansOnly ? 'Show All' : 'Show My Plans'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {filteredPlans.length > 0 ? (
            filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className="border-2 border-[#66bb6a] rounded-2xl p-6 bg-white shadow-lg hover:shadow-xl transition-all"
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
                        🗓 Deadline: {plan.deadline || 'No deadline'}
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
                          <ChevronUp className="w-4 h-4 mr-1" /> Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-1" /> Show More
                        </>
                      )}
                    </button>

                    {/* Show Edit/Delete ONLY if the user is the owner */}
                    {user?.username === plan.username && (
                      <>
                        <button
                          onClick={() => handleEditClick(plan)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit Plan"
                        >
                          <Pencil size={22} />
                        </button>
                        <button
                          onClick={() => {
                            setPlanToDelete(plan.id);
                            setShowConfirmDelete(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Plan"
                        >
                          <Trash2 size={22} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {expandedPlanId === plan.id && (
                  <div className="mt-5 border-t pt-4 text-gray-700 space-y-3 relative">
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
                        <p><strong>Description:</strong> {plan.description || 'No description'}</p>
                        <p><strong>Duration:</strong> {plan.duration || 'Not specified'} hrs</p>
                        <p><strong>Status:</strong> {plan.status || 'Unknown'}</p>
                        <p><strong>Modules:</strong> {plan.modules?.join(', ') || 'No modules assigned'}</p>
                        <p>
                          <strong>Progress:</strong>{' '}
                          {plan.completed ? (
                            <span className="text-green-600 font-semibold">Completed ✅</span>
                          ) : (
                            <button
                              onClick={() => handleMarkComplete(plan.id)}
                              className="bg-green-500 text-white px-3 py-1 rounded-full text-xs hover:bg-green-600"
                            >
                              Mark Complete
                            </button>
                          )}
                        </p>
                        <div className="mt-4">
                          <button
                            onClick={() => handleAddComment(plan.id, 'Add a comment...', 'http://example.com')}
                            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
                          >
                            💬 Add Comment
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-xl text-gray-500">No learning plans found</div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4">Are you sure you want to delete this plan?</h3>
            <div className="flex space-x-4">
              <button
                onClick={handleDeletePlan}
                className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700"
              >
                Yes, Delete
              </button>
              <button
                onClick={handleCancelDelete}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPlanPage;
