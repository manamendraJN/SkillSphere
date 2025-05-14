import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown, ChevronUp, Trash2, Pencil, BookOpen, Heart, Link, Send 
} from 'lucide-react';

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
  const [commentsByPlan, setCommentsByPlan] = useState({});
  const [newCommentText, setNewCommentText] = useState({});
  const [newResourceLink, setNewResourceLink] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState('');
  const [likesByComment, setLikesByComment] = useState({}); // Track likes for comments

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

  // Fetch comments and likes for each plan
  useEffect(() => {
    if (learningPlans.length > 0 && token) {
      learningPlans.forEach(async (plan) => {
        try {
          const commentsResponse = await axios.get(
            `http://localhost:8080/api/comments/plan/${plan.id}`, // Matches CommentController
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setCommentsByPlan((prev) => ({
            ...prev,
            [plan.id]: commentsResponse.data || [],
          }));

          // Fetch likes for each comment
          const likesPromises = commentsResponse.data.map(async (comment) => {
            const likesResponse = await axios.get(
              `http://localhost:8080/api/comments/${comment.id}/likes`, // Matches CommentController
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            return { commentId: comment.id, ...likesResponse.data };
          });
          const likesData = await Promise.all(likesPromises);
          setLikesByComment((prev) => ({
            ...prev,
            ...likesData.reduce((acc, { commentId, count, likedByUser }) => ({
              ...acc,
              [commentId]: { count, likedByUser },
            }), {}),
          }));
        } catch (error) {
          console.error('Error fetching comments or likes:', error);
        }
      });
    }
  }, [learningPlans, token]);

  const toggleExpand = async (planId) => {
    if (expandedPlanId === planId) {
      setExpandedPlanId(null);
    } else {
      setExpandedPlanId(planId);
      try {
        const commentsResponse = await axios.get(
          `http://localhost:8080/api/comments/plan/${planId}`, // Matches CommentController
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCommentsByPlan((prev) => ({
          ...prev,
          [planId]: commentsResponse.data || [],
        }));

        // Fetch likes for the comments
        const likesPromises = commentsResponse.data.map(async (comment) => {
          const likesResponse = await axios.get(
            `http://localhost:8080/api/comments/${comment.id}/likes`, // Matches CommentController
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          return { commentId: comment.id, ...likesResponse.data };
        });
        const likesData = await Promise.all(likesPromises);
        setLikesByComment((prev) => ({
          ...prev,
          ...likesData.reduce((acc, { commentId, count, likedByUser }) => ({
            ...acc,
            [commentId]: { count, likedByUser },
          }), {}),
        }));
      } catch (error) {
        console.error('Error fetching comments or likes:', error);
      }
    }
  };

  const handleDeletePlan = async () => {
    if (planToDelete) {
      try {
        await axios.delete(`http://localhost:8080/api/learning-plans/${planToDelete}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLearningPlans(learningPlans.filter((plan) => plan.id !== planToDelete));
        setShowConfirmDelete(false);
        setPlanToDelete(null);
        setSuccessMessage('✅ Plan deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
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
      modules: plan.modules || [],
      progress: plan.progress || '',
      completed: plan.completed || false,
    });
  };

  const handleCancelEdit = () => {
    setEditPlanId(null);
    setEditedPlanData({});
  };

  const handleSaveEdit = async (planId) => {
    try {
      await axios.put(
        `http://localhost:8080/api/learning-plans/${planId}`,
        editedPlanData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchLearningPlans();
      setEditPlanId(null);
      setEditedPlanData({});
      setSuccessMessage('✅ Plan updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating learning plan:', error);
      if (error.response?.status === 403) {
        alert('You are not authorized to update this plan.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedPlanData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddComment = async (planId) => {
    const message = newCommentText[planId];
    const resourceLink = newResourceLink[planId];

    if (!message) return alert('Please enter a comment');
    if (!token) return alert('You are not authenticated. Please log in.');

    try {
      const response = await axios.post(
        `http://localhost:8080/api/comments/plan/${planId}`, // Matches CommentController
        { message, resourceLink },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCommentsByPlan((prev) => ({
        ...prev,
        [planId]: [...(prev[planId] || []), response.data],
      }));
      setLikesByComment((prev) => ({
        ...prev,
        [response.data.id]: { count: 0, likedByUser: false },
      }));
      setNewCommentText((prev) => ({ ...prev, [planId]: '' }));
      setNewResourceLink((prev) => ({ ...prev, [planId]: '' }));
      setSuccessMessage('✅ Comment added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding comment:', error.response?.data || error.message);
      if (error.response?.status === 403) {
        alert('You are not authorized. Please log in again.');
      } else {
        alert('Failed to add comment. Please try again.');
      }
    }
  };

  const handleUpdateComment = async (planId, commentId) => {
    try {
      await axios.put(
        `http://localhost:8080/api/comments/${commentId}`, // Matches CommentController
        { message: editedCommentText, resourceLink: newResourceLink[planId] || '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingCommentId(null);
      setEditedCommentText('');
      const response = await axios.get(
        `http://localhost:8080/api/comments/plan/${planId}`, // Matches CommentController
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCommentsByPlan((prev) => ({ ...prev, [planId]: response.data }));
      setSuccessMessage('✅ Comment updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating comment:', error.response?.data || error.message);
      if (error.response?.status === 403) {
        alert('You are not authorized to update this comment.');
      } else {
        alert('Failed to update comment. Please try again.');
      }
    }
  };

  const handleDeleteComment = async (planId, commentId) => {
    try {
      await axios.delete(`http://localhost:8080/api/comments/${commentId}`, { // Matches CommentController
        headers: { Authorization: `Bearer ${token}` },
      });
      setCommentsByPlan((prev) => ({
        ...prev,
        [planId]: prev[planId].filter((comment) => comment.id !== commentId),
      }));
      setLikesByComment((prev) => {
        const newLikes = { ...prev };
        delete newLikes[commentId];
        return newLikes;
      });
      setSuccessMessage('✅ Comment deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting comment:', error.response?.data || error.message);
      if (error.response?.status === 403) {
        alert('You are not authorized to delete this comment.');
      } else {
        alert('Failed to delete comment. Please try again.');
      }
    }
  };

  const handleLikeComment = async (planId, commentId) => {
    try {
      const isLiked = likesByComment[commentId]?.likedByUser || false;
      await axios.post(
        `http://localhost:8080/api/comments/${commentId}/like`, // Matches CommentController
        { like: !isLiked },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLikesByComment((prev) => ({
        ...prev,
        [commentId]: {
          count: isLiked ? (prev[commentId]?.count || 0) - 1 : (prev[commentId]?.count || 0) + 1,
          likedByUser: !isLiked,
        },
      }));
    } catch (error) {
      console.error('Error liking comment:', error.response?.data || error.message);
      if (error.response?.status === 403) {
        alert('You are not authorized to like this comment.');
      } else {
        alert('Failed to like comment. Please try again.');
      }
    }
  };

  const handleMarkComplete = async (planId) => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/learning-plans/complete/${planId}`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setLearningPlans((prevPlans) =>
        prevPlans.map((plan) => (plan.id === planId ? response.data : plan))
      );

      setSuccessMessage('✅ Plan marked as completed!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error marking plan as completed:', error);
      if (error.response?.status === 403) {
        alert('You are not authorized to mark this plan as completed.');
      }
    }
  };

  const filteredPlans = learningPlans.filter((plan) => {
    const matchesSearch =
      searchTerm === '' || plan.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser =
      !showMyPlansOnly || (user?.username && plan.username === user.username);
    return matchesSearch && matchesUser;
  });

  return (
    <div className="p-8 min-h-screen font-sans bg-teal-50">
      <div className="max-w-5xl mx-auto mt-4">
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
                    <div className="bg-[#00796b] text-white rounded-full w-10 h-10 flex justify-center items-center mr-4">
                      {getInitial(plan.username)}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-xl font-semibold flex items-center">
                        {plan.title}
                        {plan.completed && (
                          <span className="ml-3 px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                            Completed
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {plan.description || 'No description available.'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => toggleExpand(plan.id)}
                      className="px-4 py-2 bg-[#00796b] text-white rounded-full hover:bg-[#004d40]"
                    >
                      {expandedPlanId === plan.id ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {expandedPlanId === plan.id && (
                  <div className="mt-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMarkComplete(plan.id)}
                        disabled={plan.completed}
                        className={`px-6 py-2 rounded-full shadow transition ${
                          plan.completed
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-[#00796b] text-white hover:bg-[#004d40]'
                        }`}
                      >
                        {plan.completed ? 'Completed' : 'Mark Complete'}
                      </button>
                      {plan.username === user?.username && (
                        <>
                          <button
                            onClick={() => handleEditClick(plan)}
                            className="bg-[#66bb6a] text-white px-2 py-2 rounded-full shadow hover:opacity-90 transition mr-0"
                          >
                            <Pencil size={18} />
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

                    {editPlanId === plan.id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block">Title</label>
                          <input
                            type="text"
                            name="title"
                            value={editedPlanData.title || ''}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded-md shadow"
                          />
                        </div>
                        <div>
                          <label className="block">Description</label>
                          <textarea
                            name="description"
                            value={editedPlanData.description || ''}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded-md shadow"
                          />
                        </div>
                        <div>
                          <label className="block">Duration</label>
                          <input
                            type="text"
                            name="duration"
                            value={editedPlanData.duration || ''}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded-md shadow"
                          />
                        </div>
                        <div>
                          <label className="block">Deadline</label>
                          <input
                            type="date"
                            name="deadline"
                            value={editedPlanData.deadline || ''}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded-md shadow"
                          />
                        </div>
                        <div>
                          <label className="block">Status</label>
                          <input
                            type="text"
                            name="status"
                            value={editedPlanData.status || ''
                            }
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded-md shadow"
                          />
                        </div>
                        <button
                          onClick={() => handleSaveEdit(plan.id)}
                          className="bg-teal-500 text-white px-6 py-2 rounded-full shadow hover:bg-teal-600"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-500 text-white px-6 py-2 rounded-full shadow hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold">Learning Plan Details:</h4>
                          <p>Duration: {plan.duration}</p>
                          <p>Deadline: {plan.deadline}</p>
                          <p>Status: {plan.status}</p>
                          <p>
                            <strong>Modules:</strong>{' '}
                            {plan.modules?.join(', ') || 'No modules assigned'}
                          </p>
                        </div>
                        <div className="mt-6 space-y-4">
                          <h4 className="text-lg font-semibold text-gray-700 flex items-center">
                            <span className="mr-2">💬</span> Comments
                          </h4>
                          {(commentsByPlan[plan.id] || []).length > 0 ? (
                            (commentsByPlan[plan.id] || []).map((comment) => (
                              <div
                                key={comment.id}
                                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="bg-[#00796b] text-white rounded-full w-8 h-8 flex justify-center items-center">
                                      {getInitial(comment.username)}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-800">
                                        {comment.username}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  {comment.username === user?.username && (
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => {
                                          setEditingCommentId(comment.id);
                                          setEditedCommentText(comment.message);
                                          setNewResourceLink((prev) => ({
                                            ...prev,
                                            [plan.id]: comment.resourceLink || '',
                                          }));
                                        }}
                                        className="text-gray-600 hover:text-blue-600 transition"
                                        title="Edit Comment"
                                      >
                                        <Pencil size={16} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteComment(plan.id, comment.id)}
                                        className="text-gray-600 hover:text-red-600 transition"
                                        title="Delete Comment"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                                {editingCommentId === comment.id ? (
                                  <div className="mt-3 space-y-3">
                                    <textarea
                                      value={editedCommentText}
                                      onChange={(e) => setEditedCommentText(e.target.value)}
                                      className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-teal-300"
                                      rows={3}
                                    />
                                    <input
                                      type="text"
                                      placeholder="Optional: Resource link"
                                      value={newResourceLink[plan.id] || ''}
                                      onChange={(e) =>
                                        setNewResourceLink((prev) => ({
                                          ...prev,
                                          [plan.id]: e.target.value,
                                        }))
                                      }
                                      className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-teal-300"
                                    />
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handleUpdateComment(plan.id, comment.id)}
                                        className="bg-[#00796b] text-white px-4 py-1 rounded-full shadow hover:bg-[#004d40] transition"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingCommentId(null);
                                          setEditedCommentText('');
                                        }}
                                        className="bg-gray-300 text-gray-700 px-4 py-1 rounded-full shadow hover:bg-gray-400 transition"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="mt-3">
                                    <p className="text-sm text-gray-700">{comment.message}</p>
                                    {comment.resourceLink && (
                                      <a
                                        href={comment.resourceLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-blue-600 hover:underline text-sm mt-2"
                                      >
                                        <Link size={14} className="mr-1" />
                                        {comment.resourceLink}
                                      </a>
                                    )}
                                    <div className="flex items-center mt-3 space-x-4">
                                      <button
                                        onClick={() => handleLikeComment(plan.id, comment.id)}
                                        className={`flex items-center space-x-1 text-gray-600 hover:text-red-600 transition ${
                                          likesByComment[comment.id]?.likedByUser
                                            ? 'text-red-600'
                                            : ''
                                        }`}
                                      >
                                        <Heart
                                          size={16}
                                          fill={
                                            likesByComment[comment.id]?.likedByUser
                                              ? 'currentColor'
                                              : 'none'
                                          }
                                        />
                                        <span>{likesByComment[comment.id]?.count || 0}</span>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No comments yet.</p>
                          )}
                          <div className="mt-4">
                            <div className="flex items-start space-x-3">
                              <div className="bg-[#00796b] text-white rounded-full w-8 h-8 flex justify-center items-center">
                                {getInitial(user?.username)}
                              </div>
                              <div className="flex-1 space-y-2">
                                <textarea
                                  placeholder="Add your comment..."
                                  value={newCommentText[plan.id] || ''}
                                  onChange={(e) =>
                                    setNewCommentText((prev) => ({
                                      ...prev,
                                      [plan.id]: e.target.value,
                                    }))
                                  }
                                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-teal-300"
                                  rows={3}
                                />
                                <input
                                  type="text"
                                  placeholder="Optional: Resource link"
                                  value={newResourceLink[plan.id] || ''}
                                  onChange={(e) =>
                                    setNewResourceLink((prev) => ({
                                      ...prev,
                                      [plan.id]: e.target.value,
                                    }))
                                  }
                                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-teal-300"
                                />
                                <button
                                  onClick={() => handleAddComment(plan.id)}
                                  className="bg-[#00796b] text-white px-4 py-2 rounded-full shadow hover:bg-[#004d40] flex items-center transition"
                                >
                                  <Send size={16} className="mr-2" />
                                  Post Comment
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-lg text-gray-600">No learning plans found.</div>
          )}
        </div>
      </div>

      {showConfirmDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4">
              Are you sure you want to delete this plan?
            </h3>
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