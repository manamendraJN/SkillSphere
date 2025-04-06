import React, { useEffect, useState } from "react";
import axios from "axios";

const PostFeed = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/posts")
      .then((res) => {
        setPosts(res.data);
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6">
      {posts.map((post) => (
        <div key={post.id} className="border p-4 rounded shadow">
          <h3 className="font-semibold text-lg">User ID: {post.userId}</h3>
          <p className="mb-2">{post.description}</p>

          {post.imageUrls?.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`img-${idx}`}
              className="w-full mb-2 rounded"
            />
          ))}

          {post.videoUrl && (
            <video controls className="w-full mt-2 rounded">
              <source src={post.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      ))}
    </div>
  );
};

export default PostFeed;
