// PostDetails.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const PostDetails = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/posts/fetch-posts/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPost(response.data);
      setLoading(false);
    };

    fetchPost();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Post not found.</div>;

  return (
    <div>
      {/* <h2>{post.title}</h2> */}
      <p>{post.content}</p>
      {/* Other post details */}
    </div>
  );
};

export default PostDetails;
