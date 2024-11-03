

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SideBar from './SideBar';
import { FaRegThumbsUp, FaComment, FaBookmark } from 'react-icons/fa';
import { fetchBookmarks as marked } from '../features/postSlice';
import { useDispatch } from 'react-redux';
import CommentList from './CommentList';
import { likePost,unlikePost,fetchPosts } from '../features/postSlice';
import NotificationsList from './NotificationsList';
import MessageIcon from './MessageIcon';
import { useSelector } from 'react-redux';
const BookmarkedPosts = () => {
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const BASE_URL = 'http://localhost:8000';
  const dispatch = useDispatch();
  const [likedPosts, setLikedPosts] = useState([]);
  const loggedInUser = useSelector((state) => state.auth.user); 
  const username = loggedInUser ? loggedInUser.first_name : null;
  useEffect(() => {
    dispatch(marked());
  }, [dispatch]);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const response = await axios.get('http://localhost:8000/posts/bookmarks/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setBookmarkedPosts(response.data);
      } catch (error) {
        console.error('Error fetching bookmarked posts:', error);
      }
    };

    fetchBookmarks();
  }, []);


  useEffect(() => {
    const storedLikedPosts = localStorage.getItem('likedPosts');
    if (storedLikedPosts) {
      setLikedPosts(JSON.parse(storedLikedPosts));
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
  }, [likedPosts]);


  const handleLikeToggle = (post) => {
    const isLiked = likedPosts.includes(post.id);

    // Define the new state based on the current action
    const newLikedPosts = isLiked 
      ? likedPosts.filter(id => id !== post.id) // Unlike
      : [...likedPosts, post.id]; // Like

    // Dispatch the appropriate action
    const action = isLiked ? unlikePost(post.id) : likePost(post.id);
    
    dispatch(action).then(() => {
      // Update likedPosts only after the action completes successfully
      setLikedPosts(newLikedPosts);
      dispatch(fetchPosts()); // Optional: Refresh posts after liking/unliking
    });
  };


  // Function to remove bookmark
  const removeBookmark = async (postId) => {
    try {
      await axios.delete(`http://localhost:8000/posts/bookmarks/${postId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setBookmarkedPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  return (
    <div>
           <nav 
  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-lg p-4 flex items-center justify-between fixed top-0 z-10 w-full" 
  style={{ height: '70px', marginLeft: '-3px' }}>
  
  <div className="flex items-center space-x-4 ml-auto">
    <h1 className="text-white text-xl font-bold">Welcome, {username}</h1>
    <NotificationsList />
    <MessageIcon />
  </div>
  
</nav>
    <div className="flex bg-blue-50 min-h-screen"> {/* Changed background color outside of post area */}
      <SideBar />
      <div className="flex-1 p-6 max-w-2xl mx-auto"> {/* Adjust max width to make post smaller */}
        <h1 className="text-3xl font-bold text-center mb-4"> Bookmarked Posts</h1>
        {bookmarkedPosts.length > 0 ? (
          bookmarkedPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-gray-300 rounded-lg shadow-lg mb-6 transition-transform transform hover:scale-105 duration-300 p-4"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <img
                    src={`${BASE_URL}${post.user.profile_picture}`}
                    alt={post.user.username}
                    className="w-10 h-10 rounded-full mr-3 border-2 border-blue-400"
                  />
                  <div>
                    <h2 className="text-lg font-semibold">{post.user.username}</h2>
                    <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {/* Bookmark Remove Button */}
                <button
                  onClick={() => removeBookmark(post.id)}
                  className="text-blue-500 hover:text-blue-700"
                  title="Remove Bookmark"
                >
                  <FaBookmark className="w-6 h-6" />
                </button>
              </div>

              <p className="mb-3 text-sm">{post.content}</p> {/* Reduced text size */}
              {post.image && (
  <img
    src={`${BASE_URL}${post.image}`}
    alt="Post"
    className="w-full h-64 object-cover rounded-md mb-4 shadow-sm transition-transform duration-300 hover:scale-105" // Adjusted width and height
  />
)}

              {post.video && <video controls src={`${BASE_URL}${post.video}`} className="w-full rounded-lg mb-2" />}
              
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div className="flex items-center">
                <button type="button" onClick={() => handleLikeToggle(post)}>
            {likedPosts.includes(post.id) ? (
              <FaRegThumbsUp className="h-5 w-5 text-blue-500 hover:text-blue-700 transition duration-200" />
            ) : (
              <FaRegThumbsUp className="h-5 w-5 text-gray-500 hover:text-gray-700 transition duration-200" />
            )}
          </button>
          <span className="text-gray-600">{post.total_likes}</span>
                  
                </div>
                <p>{post.total_bookmarks} bookmarks</p> {/* Displaying total bookmarks */}
              </div>
              <CommentList postId={post.id} />
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">No bookmarked posts available.</p>
        )}
      </div>
    </div>
    </div>
  );
};

export default BookmarkedPosts;




