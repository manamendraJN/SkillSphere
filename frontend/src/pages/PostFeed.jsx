import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import {
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  Trash2,
  Pencil,
} from "lucide-react";

const Feed = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [commentBoxOpen, setCommentBoxOpen] = useState({});
  const [commentTexts, setCommentTexts] = useState({});

  const token = localStorage.getItem("token");

  const fetchPosts = async () => {
    if (!token) {
      setError("Please log in to view your feed.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("http://localhost:8080/api/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const modifiedPosts = res.data.map((p) => ({
        ...p,
        showFull: false,
      }));

      setPosts(modifiedPosts);
      setError("");
    } catch (err) {
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`http://localhost:8080/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (err) {
      alert("Failed to delete post.");
    }
  };

  const handleEdit = async (postId) => {
    try {
      await axios.put(
        `http://localhost:8080/api/posts/${postId}`,
        { description: editDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingPostId(null);
      setEditDescription("");
      fetchPosts();
    } catch (err) {
      alert("Failed to update post.");
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(
        `http://localhost:8080/api/posts/${postId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: res.data.likes,
                likedUsers: res.data.likedUsers,
              }
            : post
        )
      );
    } catch (err) {
      alert("Failed to like/unlike post.");
    }
  };

  const handlePostComment = async (postId) => {
    const comment = commentTexts[postId];
    if (!comment?.trim()) return;

    try {
      await axios.post(
        `http://localhost:8080/api/posts/${postId}/comment`,
        { text: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
      setCommentBoxOpen((prev) => ({ ...prev, [postId]: false }));
      fetchPosts();
    } catch (err) {
      alert("Failed to post comment.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10 space-y-6 px-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500">Loading posts...</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-400">No posts to show.</p>
      ) : (
        posts.map((post) => {
          const isOwner = user && post.userId === user.id;
          const isEditing = editingPostId === post.id;
          const isLiked = post.likedUsers?.includes(user?.id);

          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold text-lg">
                    {post.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {post.username || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {post.createdAt
                        ? new Date(post.createdAt).toLocaleString()
                        : "Date not available"}
                    </p>
                  </div>
                </div>

                {isOwner && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingPostId(post.id);
                        setEditDescription(post.description);
                      }}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="mb-4">
                  <textarea
                    className="w-full p-2 border rounded-md mb-2"
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(post.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-md"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingPostId(null)}
                      className="bg-gray-300 text-gray-800 px-3 py-1 rounded-md"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-700 mb-4">
                  {post.description.length > 150 ? (
                    <>
                      {post.showFull
                        ? post.description
                        : post.description.slice(0, 150) + "... "}
                      <button
                        onClick={() =>
                          setPosts((prevPosts) =>
                            prevPosts.map((p) =>
                              p.id === post.id
                                ? { ...p, showFull: !p.showFull }
                                : p
                            )
                          )
                        }
                        className="text-blue-600 font-medium hover:underline"
                      >
                        {post.showFull ? "See less" : "See more"}
                      </button>
                    </>
                  ) : (
                    post.description
                  )}
                </div>
              )}

              {post.imageUrls?.length > 0 ? (
                <div className="mb-4">
                  {post.imageUrls.map((imgUrl, idx) => (
                    <img
                      key={idx}
                      src={imgUrl}
                      alt={`post-img-${idx}`}
                      className="w-full h-auto object-cover rounded-xl mb-4"
                      onError={(e) => {
                        e.target.src = "/dummy-image.png";
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No images available</p>
              )}

              {post.videoUrl && (
                <video
                  src={post.videoUrl}
                  controls
                  className="w-full rounded-xl mb-3"
                  onError={() =>
                    console.error(`Failed to load video: ${post.videoUrl}`)
                  }
                />
              )}

              <div className="flex justify-around border-t border-gray-200 pt-3 text-sm text-gray-600">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1 transition ${
                    isLiked
                      ? "text-green-600 font-semibold"
                      : "hover:text-green-600"
                  }`}
                >
                  <ThumbsUp size={16} />
                  {post.likes} Like
                </button>
                <button
                  onClick={() =>
                    setCommentBoxOpen((prev) => ({
                      ...prev,
                      [post.id]: !prev[post.id],
                    }))
                  }
                  className="flex items-center gap-1 hover:text-green-600 transition"
                >
                  <MessageCircle size={16} />
                  Comment
                </button>
                <button className="flex items-center gap-1 hover:text-green-600 transition">
                  <Share2 size={16} />
                  Share
                </button>
              </div>

              {commentBoxOpen[post.id] && (
                <div className="mt-3 flex flex-col gap-2">
                  <textarea
                    rows={2}
                    className="w-full p-2 border rounded-md"
                    placeholder="Write a comment..."
                    value={commentTexts[post.id] || ""}
                    onChange={(e) =>
                      setCommentTexts((prev) => ({
                        ...prev,
                        [post.id]: e.target.value,
                      }))
                    }
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => handlePostComment(post.id)}
                      className="bg-green-500 text-white px-4 py-1 rounded-md hover:bg-green-600 transition"
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}

              {commentBoxOpen[post.id] && (
                <div className="mt-4 space-y-4">
                  {post.comments?.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-green-50 border border-green-300 rounded-xl px-4 py-3"
                    >
                      <div className="flex gap-3 items-start">
                        <div className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs mt-1">
                          {comment.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 text-sm mb-1 text-left">
                            {comment.text}
                          </p>
                          <div className="text-xs text-gray-600 flex items-center gap-4">
                            <span> {comment.username}</span>
                            <div className="flex items-center gap-4 mt-1">
                              <button className="flex items-center gap-1 text-teal-700 hover:text-green-600 transition">
                                <ThumbsUp size={16} strokeWidth={1.5} />
                                <span>8</span>
                              </button>
                              <button className="flex items-center gap-1 text-teal-700 hover:text-red-600 transition">
                                <ThumbsDown size={16} strokeWidth={1.5} />
                                <span>1</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })
      )}
    </div>
  );
};

export default Feed;
