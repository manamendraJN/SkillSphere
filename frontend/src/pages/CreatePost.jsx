import React, { useState } from "react";
import axios from "axios";

const CreatePost = () => {
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const postData = { description, userId, imageUrls, videoUrl };

    try {
      await axios.post("http://localhost:8080/api/posts", postData);
      alert("Post created successfully");
      setDescription("");
      setUserId("");
      setImageUrls([]);
      setVideoUrl("");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post");
    }
  };

  const handleImageUrlsChange = (e) => {
    setImageUrls(e.target.value.split(",").map((url) => url.trim()));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto mt-10 p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Create a Post</h2>
      
      <input
        type="text"
        placeholder="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        className="w-full p-2 border mb-3 rounded"
        required
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border mb-3 rounded"
        rows={3}
      />

      <input
        type="text"
        placeholder="Image URLs (comma separated)"
        onChange={handleImageUrlsChange}
        className="w-full p-2 border mb-3 rounded"
      />

      <input
        type="text"
        placeholder="Video URL"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        className="w-full p-2 border mb-3 rounded"
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Post
      </button>
    </form>
  );
};

export default CreatePost;
