




import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchUserPostsDetails, likePost, unlikePost } from '../features/postSlice';
import { fetchUserProfile } from '../features/authSlice';
import { FaEllipsisV, FaEdit, FaTrash, FaRegThumbsUp, FaRegComment, FaThumbsUp } from 'react-icons/fa';
import SideBar from './SideBar';
import BookmarkButton from './BookmarkButton';
import CommentList from './CommentList';
import { motion } from 'framer-motion';
import FollowButton from './FollowButton ';
import { fetchPosts } from '../features/postSlice';
import { fetchFollowingandfollowers } from '../features/followerSlice';
import MessageIcon from './MessageIcon';
import NotificationsList from './NotificationsList';
import { Link } from 'react-router-dom';
const defaultProfile = 'path/to/defaultProfile.png';
const defaultCover = 'path/to/defaultCover.jpg';

const FriendUserProfile = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('posts');
  const [dropdownVisible, setDropdownVisible] = useState({});
  const [likedPosts, setLikedPosts] = useState([]);
  // const { followers, following, followingCount, followersCount, loading, error } = useSelector((state) => state.followers);
  const loggedInUser = useSelector((state) => state.auth.user); 
  const username = loggedInUser ? loggedInUser.first_name : null;
  useEffect(() => {
    if (userId) {
      dispatch(fetchUserPostsDetails(userId));
      dispatch(fetchUserProfile(userId));
    }
  }, [likedPosts, dispatch, userId]);

  const BASE_URL = 'http://localhost:8000';
  const postdetails = useSelector((state) => state.posts.postdetails);
  const profile = useSelector((state) => state.posts.profile);

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
    const newLikedPosts = isLiked 
      ? likedPosts.filter(id => id !== post.id) 
      : [...likedPosts, post.id];

    const action = isLiked ? unlikePost(post.id) : likePost(post.id);
    
    dispatch(action).then(() => {
      setLikedPosts(newLikedPosts);
      dispatch(fetchPosts());
    });
  };

  const toggleDropdown = (postId) => {
    setDropdownVisible((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleEdit = (post) => {
    console.log('Edit post', post);
  };

  const handleDelete = (postId) => {
    console.log('Delete post with ID:', postId);
  };

  const following = useSelector((state) => state.followers.following);
const [followingCount, setFollowingCount] = useState(following.length);

const followers = useSelector((state) => state.followers.followers);
const [followersCount, setFollowersCount] = useState(followers.length);

useEffect(() => {
  setFollowingCount(following.length);
}, [following]);



useEffect(() => {
  setFollowersCount(followers.length);
}, [followers]);


const renderContentWithHashtags = (content) => {
  const hashtagRegex = /#(\w+)/g; // Regex to find hashtags
  const parts = content.split(hashtagRegex); // Split content by hashtags

  return parts.map((part, index) => {
    // If part matches a hashtag (i.e., it's at an odd index)
    if (index % 2 === 1) {
      return (
        <Link key={index} to={`/hashtag/${part}`} className="text-blue-500 hover:underline">
          #{part}
        </Link>
      );
    }
    return <span key={index}>{part}</span>; // Return normal text wrapped in a <span> for proper key management
  });
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
    <div className="bg-gray-100 min-h-screen" style={{marginTop:'4%'}}>
      <div className="flex">
        {/* Sidebar */}
        <div className="w-1/4 hidden lg:block">
          <SideBar />
        </div>
  
        {/* Main Content */}
        <div className="flex-grow flex flex-col items-center">
          {/* Cover Photo with Profile Picture Overlay */}
          <div className="relative w-full h-60">
            <motion.img
              src={`${BASE_URL}${profile?.cover_picture || defaultCover}`}
              className="w-full h-full object-cover rounded-lg shadow-lg"
              alt={`Cover of ${profile?.username || 'User'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            <div className="absolute left-4 bottom-[-10px] ">
              <motion.img
                src={`${BASE_URL}${profile?.profile_picture || defaultProfile}`}
                className="w-24 h-24 mt-4 rounded-full overflow-hidden border-4 border-white shadow-xl"
                alt={`Profile of ${profile?.username || 'User'}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
  
          {/* User Info Section */}
          <div className="flex justify-between items-start w-full px-4 mb-4 bg-white rounded-lg shadow-lg p-4">
            <div className="flex flex-col items-start">
              <h2 className="text-3xl font-bold text-gray-800">{profile?.first_name}</h2>
              <p className="text-sm text-gray-600">@{profile?.username || 'No bio available.'}</p>
              {/* <p>Status: {profile?.is_online ? 'Online' : 'Offline'}</p>  */}
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center space-x-4 mb-2">
                {/* <div className="flex flex-col items-center">
                  <span className="font-bold text-2xl text-gray-700">150</span>
                  <span className="text-gray-600 text-sm">Followers</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-bold text-2xl text-gray-700">50</span>
                  <span className="text-gray-600 text-sm">Following</span>
                </div> */} <div className="flex flex-col items-center">
                  <span className="font-bold text-2xl">{followersCount}</span>
                  <span className="text-gray-600 text-sm">Followers</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-bold text-2xl">{followingCount}</span>
                  <span className="text-gray-600 text-sm">Following</span>
                </div>
              </div>
              {/* Follow Button */}
              <FollowButton userId={userId} className="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 transition duration-200" />
            </div>
          </div>
  
          {/* User's Posts Section */}
          <div className="mt-0 w-full lg:max-w-3xl" style={{marginTop:'-1%'}}>
            <div className="flex flex-col space-y-4" >
              {postdetails.map((post) => (
                <motion.div
                  key={post.id}
                  className="border border-gray-300 rounded-lg shadow-lg p-4 transition-transform duration-300 hover:scale-105"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Post Header */}
                  <div className="flex items-center mb-2">
                    <img
                      src={`${BASE_URL}${profile?.profile_picture || defaultProfile}`}
                      className="w-8 h-8 rounded-full object-cover"
                      alt="Profile"
                    />
                    <div className="ml-2">
                      <p className="font-semibold text-sm">{profile?.username}</p>
                      <p className="text-xs text-gray-500">Posted on {new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
  
                  {/* Post Content */}
                  <div className="mt-2">
                    {/* <p className="text-gray-700">{post.content}</p> */}
                    <p>{renderContentWithHashtags(post.content)}</p>
                    {post.image && (
                      <img
                        src={`${BASE_URL}${post.image}`}
                        alt="Post"
                        className="w-full max-h-[300px] object-cover rounded-md mt-2 shadow-sm transition-transform duration-300 hover:scale-105"
                      />
                    )}
                    {post.video && (
                      <video
                        src={`${BASE_URL}${post.video}`}
                        controls
                        className="w-full max-h-[300px] mt-2 rounded-lg shadow-sm"
                      />
                    )}
                  </div>
  
                  {/* Post Actions */}
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center space-x-2">
                      {/* Like Button */}
                      <div className="flex items-center space-x-1">
                        <button type="button" onClick={() => handleLikeToggle(post)} className="flex items-center">
                          {likedPosts.includes(post.id) ? (
                            <FaThumbsUp className="h-5 w-5 text-blue-500 hover:text-blue-700 transition duration-200" />
                          ) : (
                            <FaRegThumbsUp className="h-5 w-5 text-gray-500 hover:text-gray-700 transition duration-200" />
                          )}
                        </button>
                        <span className="text-gray-600">{post.total_likes}</span>
                      </div>
  
                      {/* Comment Button */}
                      {/* <div className="flex items-center space-x-1">
                        <FaRegComment className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                        <span className="text-sm">{post.total_comments ?? 0}</span>
                      </div> */}
                      <BookmarkButton postId={post.id} />
                    </div>
                  </div>
  
                  {/* Comment List */}
                  <div className="mt-4 border-t border-gray-300 pt-2">
                    <CommentList postId={post.id} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default FriendUserProfile;

