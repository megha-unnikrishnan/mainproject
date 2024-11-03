


import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import SideBar from './SideBar';
import { FaRegThumbsUp, FaRegComment } from 'react-icons/fa'; // Importing icons for like and comment
import { likePost, unlikePost } from '../features/postSlice';
import { fetchPosts } from '../features/postSlice';
import { useDispatch } from 'react-redux';
import CommentList from './CommentList';
import BookmarkButton from './BookmarkButton';
import MessageIcon from './MessageIcon';
import NotificationsList from './NotificationsList';
import { useSelector } from 'react-redux';
const HashtagPage = () => {
  const { hashtag } = useParams(); // Get hashtag from URL
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState([]);
  const BASE_URL = 'http://localhost:8000';
  const dispatch = useDispatch();

  const loggedInUser = useSelector((state) => state.auth.user); 
  const username = loggedInUser ? loggedInUser.first_name : null;

  useEffect(() => {
    const fetchPostsByHashtag = async () => {
      try {
        const token = localStorage.getItem('token'); // Get the token from localStorage
        const response = await axios.get(`${BASE_URL}/posts/hashtag/${hashtag}/`, {
          headers: {
            'Authorization': `Bearer ${token}`, // Set the authorization header
          },
        });
        console.log('Fetched posts:', response.data);
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts by hashtag:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostsByHashtag();
  }, [hashtag]);

  
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


  
  if (loading) return <p>Loading...</p>;

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
    <div className="flex">
      <div className="w-1/4">
        <SideBar />
      </div>
      <div className="w-3/4 p-4">
        <h1 className="text-2xl font-bold mb-4" style={{paddingLeft:'22%',color:'blue'}}>Posts for #{hashtag}</h1>
        {posts.length > 0 ? (
          posts.map((post) => (
            <div 
              key={post.id} 
              className="bg-white border border-gray-300 rounded-lg shadow-lg mb-6 p-4" 
              style={{ maxWidth: '600px', margin: '0 auto' }} // Centering and setting max width
            > 
              <div className="flex items-center mb-4">
                <img
                  src={post.user.profile_picture}
                  alt={post.user.first_name}
                  className="h-10 w-10 rounded-full border border-gray-200 shadow-md"
                />
                <div className="ml-2">
                  <span className="font-bold text-gray-800 text-lg capitalize">{post.user.first_name}</span>
                  <span className="text-gray-500 text-sm block">
                    Posted on {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Post Content */}
              <div className="relative mb-4">
                {/* <p className="text-sm">{post.content}</p> */}
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full h-auto object-cover rounded-md mb-4 shadow-sm transition-transform duration-300 hover:scale-105"
                  />
                )}
                {post.video && (
                  <video controls src={post.video} className="w-full h-auto object-cover rounded-md mb-4 shadow-sm" />
                )}
              </div>

              {/* Like, Comment, and Bookmark Section */}
              <div className="flex justify-between items-center mt-4 border-t border-gray-200 pt-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <button type="button" onClick={() => handleLikeToggle(post)} className="flex items-center">
                      {likedPosts.includes(post.id) ? (
                        <FaRegThumbsUp className="h-5 w-5 text-blue-500 hover:text-blue-700 transition duration-200" />
                      ) : (
                        <FaRegThumbsUp className="h-5 w-5 text-gray-500 hover:text-gray-700 transition duration-200" />
                      )}
                    </button>
                    <span className="text-gray-600">{post.total_likes}</span>
                  </div>

                  {/* <div className="flex items-center">
                    <FaRegComment className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-600">{post.total_comments}</span>
                  </div> */}

                  <BookmarkButton postId={post.id} />
                </div>
              </div>

              {/* Comments Section - Always displayed */}
              <CommentList postId={post.id} />
            </div>
          ))
        ) : (
          <p>No posts found for this hashtag.</p>
        )}
      </div>
    </div>
    </div>
  );
};

export default HashtagPage;
