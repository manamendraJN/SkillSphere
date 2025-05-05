import React, { useState, useContext } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Image, Video, Send, X, AlertCircle, PlusCircle } from "lucide-react";
import { AuthContext } from '../context/AuthContext';
import { toast } from "react-hot-toast"; // Importing react-hot-toast


const CreatePost = () => {
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [video, setVideo] = useState(null);
  const [videoName, setVideoName] = useState("");
  const [error, setError] = useState("");
  const { user } = useContext(AuthContext);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleImageChange = (e) => {
    if (video) {
      setError("You can't upload both images and video. Remove the video first.");
      return;
    }
    const selectedImages = Array.from(e.target.files).slice(0, 3);
    setImages(selectedImages);
    const previews = selectedImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
    setError("");
  };

  const handleVideoChange = (e) => {
    if (images.length > 0) {
      setError("You can't upload both images and video. Remove the images first.");
      return;
    }
    const selectedVideo = e.target.files[0];
    if (selectedVideo) {
      setVideo(selectedVideo);
      setVideoName(selectedVideo.name);
      setError("");
    }
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...images];
    const updatedPreviews = [...imagePreviews];
    updatedImages.splice(index, 1);
    updatedPreviews.splice(index, 1);
    setImages(updatedImages);
    setImagePreviews(updatedPreviews);
  };

  const handleRemoveVideo = () => {
    setVideo(null);
    setVideoName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    console.log("Token being sent:", token);
    if (!token) {
      setError("Please log in to create a post.");
      toast.error("Please log in to create a post."); 
      return;
    }

    if (!description.trim()) {
      setError("Post content can't be empty.");
      toast.error("Post content can't be empty."); 
      return;
    }

    if (images.length > 3) {
      setError("You can upload up to 3 images only.");
      toast.error("You can upload up to 3 images only."); 
      return;
    }

    if (images.length > 0 && video) {
      setError("Choose either images or a video, not both.");
      toast.error("Choose either images or a video, not both."); // Error toast
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    images.forEach((img) => formData.append("images", img));
    if (video) formData.append("video", video);

    console.log("Submitting FormData:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await axios.post("http://localhost:8080/api/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Post created successfully:", response.data);

      // Clear form after successful post creation
      setDescription("");
      setImages([]);
      setImagePreviews([]);
      setVideo(null);
      setVideoName("");
      setError("");
      setIsFormOpen(false);

      
      toast.success("Post created successfully!"); 
    } catch (error) {
      console.error("Error creating post:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      setError(
        error.response?.data?.message ||
        (error.response?.status === 403
          ? "You don't have permission to create a post. Please check your login status or token validity."
          : "Failed to create post. Try again.")
      );

      // Display error toast
      toast.error(error.response?.data?.message || "Failed to create post.");
    }
  };

  return (
    <div className="min-h-screen bg-teal-50 py-12 px-4 sm:px-6 lg:px-8 ml-0">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-teal-800 mb-10 text-center flex items-center justify-center">
          <Image className="w-10 h-10 mr-3 text-teal-600" />
          Create a Post
        </h1>

        <div className="mb-10 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFormOpen(true)}
            className="px-6 py-3 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors flex items-center shadow-md"
          >
            <PlusCircle className="w-6 h-6 mr-2" />
            Create Post
          </motion.button>
        </div>

        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-md p-6 max-w-xl mx-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-teal-800">Create Post</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-teal-600 hover:text-teal-800">
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                placeholder="What's on your mind?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-24 p-3 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              />

              {imagePreviews.length > 0 && (
                <div className="flex gap-3 flex-wrap">
                  {imagePreviews.map((src, index) => (
                    <div key={index} className="relative">
                      <img
                        src={src}
                        alt={`preview-${index}`}
                        className="w-24 h-24 object-cover rounded-xl border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {videoName && (
                <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
                  <span className="text-sm text-gray-700 truncate w-5/6">
                    🎥 <strong>Video:</strong> {videoName}
                  </span>
                  <button onClick={handleRemoveVideo} type="button">
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between gap-4">
                <label className="cursor-pointer flex items-center gap-2 text-sm text-teal-600 font-medium">
                  <Image className="w-5 h-5" />
                  Upload Photos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleImageChange}
                    disabled={!!video}
                  />
                </label>

                <label className="cursor-pointer flex items-center gap-2 text-sm text-teal-600 font-medium">
                  <Video className="w-5 h-5" />
                  Upload Video
                  <input
                    type="file"
                    accept="video/*"
                    hidden
                    onChange={handleVideoChange}
                    disabled={images.length > 0}
                  />
                </label>

                <button
                  type="submit"
                  className="ml-auto flex items-center bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Post
                </button>
              </div>

              <div className="text-xs text-gray-500">
                Max 3 images or 1 video per post.
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CreatePost;
