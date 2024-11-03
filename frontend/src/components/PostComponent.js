









import axios from 'axios';
import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost, fetchPosts, editPost, deletePost,likePost,unlikePost, fetchComments,listLikes, toggleLikePost  } from '../features/postSlice';
import { HiOutlineChatAlt2 } from 'react-icons/hi';
import { FaPaperPlane, FaRegSmile, FaImage, FaVideo, FaTimes, FaEdit, FaTrash ,FaEllipsisV } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import data from '@emoji-mart/data'; 
import Picker from '@emoji-mart/react';
import BookmarkButton from './BookmarkButton';
import Cropper from 'react-easy-crop';
import {   FaRegThumbsUp, FaRegComment } from 'react-icons/fa';
import { fetchBookmarks } from '../features/postSlice';
import CommentList from './CommentList';
import { useRef } from 'react';
import TagInput from './TagInput';
import { Link } from 'react-router-dom';
import Like from './Like';
import FlagPost from './FlagPost';

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const getCroppedImg = async (imageSrc, croppedAreaPixels) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg');
  });
};


const PostComponent = ({ onSuccess },{ postId }) => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts.posts);
  console.log('posts',posts.comment_count);
  

  const [newPost, setNewPost] = useState('');
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [mediaCaption, setMediaCaption] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State for showing delete modal
  const [postToDelete, setPostToDelete] = useState(null); // State for the post to delete
  const isSubmitting = useRef(false);
  const [videoPreview, setVideoPreview] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const userspost = useSelector((state) => state.auth.user);
  const [likedPosts, setLikedPosts] = useState([]);
  const [hashtags, setHashtags] = useState([]); // State for hashtags
  const [tagInput, setTagInput] = useState(''); // Temporary input for tag creation
  const statuspost= useSelector((state) => state.posts.status);
  // const likedPosts = useSelector((state) => state.posts.likedPosts); 
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const comments = useSelector((state) => state.posts.comments[postId] || []);
  const totalComments = comments.length;
  useEffect(() => {
   
      dispatch(fetchPosts());
    
  }, [ dispatch]);



  const bookmarks = useSelector((state) => state.posts.bookmarks); // Fetch bookmarks from the state

    useEffect(() => {
        // Fetch bookmarks when the component mounts
        const fetchData = async () => {
            await dispatch(fetchBookmarks());
            // After fetching bookmarks, log them for debugging
            console.log("Updated Bookmarks:", bookmarks);
        };

        fetchData();
    }, [dispatch]);
 // Access the posts from the Redux state
    const loading = useSelector((state) => state.posts.loading); // Access loading state from Redux
    
    const [likeStatus, setLikeStatus] = useState(false);

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


  const { profile, status, error } = useSelector((state) => state.auth);
  console.log(profile);
  const BASE_URL = 'http://localhost:8000';
  

  const firstName = userspost?.first_name; // Optional chaining to safely access first_name
  const profilePicture = userspost?.profile_picture; 
  console.log(firstName,profilePicture);
  
  



  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  const onEmojiClick = (emojiObject) => {
    console.log(emojiObject); // Check what the emojiObject looks like
    setNewPost((prev) => prev + emojiObject.native); // Append the emoji
    setShowEmojiPicker(false); // Close the picker after selecting
  };

  const toggleDropdown = (postId) => {
    setDropdownVisible((prev) => ({
      ...prev,
      [postId]: !prev[postId], // Toggle visibility for the clicked post
    }));
  };


  // const handleImageUpload = (e) => {
  //   const file = e.target.files[0];
  //   setImage(URL.createObjectURL(file));
  //   setShowCropper(true);
  // };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Define valid image MIME types
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
      // Check if the selected file is a valid image type
      if (!validImageTypes.includes(file.type)) {
        setErrorMessage('Invalid image type. Please upload JPEG, PNG, GIF, or WEBP images.');
        e.target.value = ''; // Reset the input
        return;
      }
  
      // Optional: Define maximum image size (e.g., 5MB)
      const maxSize = 8 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setErrorMessage('Image size exceeds 8MB. Please upload a smaller image.');
        e.target.value = ''; // Reset the input
        return;
      }
  
      // If validation passes, clear any existing error messages and proceed
      setErrorMessage('');
      setImage(URL.createObjectURL(file));
      setShowCropper(true);
      // If you need to upload the file to the server, store it in state
      // setImageFile(file);
    }
  };
  





//   const handleVideoUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//         setVideo(file); // Save the actual file object
//         const videoUrl = URL.createObjectURL(file); // Create a URL for the video
//         setVideoPreview(videoUrl); // Set the video preview URL
//     }
// };


const handleVideoUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    // Define valid video MIME types
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];

    // Check if the selected file is a valid video type
    if (!validVideoTypes.includes(file.type)) {
      setErrorMessage('Invalid video type. Please upload MP4, WEBM, or OGG videos.');
      e.target.value = ''; // Reset the input
      return;
    }

    // Optional: Define maximum video size (e.g., 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setErrorMessage('Video size exceeds 50MB. Please upload a smaller video.');
      e.target.value = ''; // Reset the input
      return;
    }

    setVideo(file); // Save the actual file object
            const videoUrl = URL.createObjectURL(file); // Create a URL for the video
            setVideoPreview(videoUrl); // Set the video preview URL
  }
};



  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = useCallback(async () => {
    try {
      const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
      setCroppedImage(croppedBlob);
      setShowCropper(false);
    } catch (e) {
      console.error(e);
    }
  }, [croppedAreaPixels, image]);






const handleEdit = (post) => {
  setNewPost(post.content || ''); // Set the current post's content
  setMediaCaption(post.mediaCaption || '');

  if (post.image) {
    setOriginalImage(post.image);
  } else {
    setOriginalImage(null);
  }

  // Handle video fetching for editing
  if (post.video) {
    console.log('Fetching video from URL:', post.video);
    setVideo(post.video);
    setVideoPreview(post.video);
  } else {
    setVideo(null);
    setVideoPreview(null);
  }

  // Handle hashtag fetching for editing
  if (post.hashtags) {
    setHashtags(post.hashtags); // Assuming hashtags are stored as an array in post.hashtags
  } else {
    setHashtags([]); // Reset to an empty array if no hashtags are present
  }

  setEditingPostId(post.id);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};







const uploadPost = async () => {
  if (!newPost.trim()) {
    setErrorMessage('Please enter some content before posting.');
    setShowSuccessPopup(false); // Hide success message if present
    return;
  }

  setErrorMessage('');

  console.log('Post content:', newPost);

    // Move formData initialization to the top
    const formData = new FormData(); 
    formData.append('content', newPost);

    // Append hashtags from the TagInput after formData is initialized
    hashtags.forEach((hashtag) => {
        formData.append('hashtags', hashtag);
        console.log('hash', hashtag);
    });

 
 

  // Handle media uploads
  if (croppedImage) {
    formData.append('image', new File([croppedImage], 'croppedImage.jpg', { type: 'image/jpeg' }));
  } else if (originalImage) {
    const response = await fetch(originalImage);
    const blob = await response.blob();
    formData.append('image', blob, 'originalImage.jpg');
  }

  // Handle video upload
  if (video) {
    const videoFile = video; // Use the actual file if needed
    formData.append('video', videoFile);
  }

  try {
    let response;
    if (editingPostId) {
      response = await dispatch(editPost({ postId: editingPostId, updatedData: formData }));
      if (response.meta.requestStatus === 'fulfilled') {
        setShowSuccessPopup(true);
        setSuccessMessage('Post edited successfully!'); // Show success message for editing
      }
    } else {
      response = await dispatch(createPost(formData));
    }
    if (response.meta.requestStatus === 'fulfilled') {
      setShowSuccessPopup(true);
      setSuccessMessage('Post created successfully!'); // Show success message for creating
    }

    if (response.meta.requestStatus === 'fulfilled') {
      setShowSuccessPopup(true); // Show success message
      resetForm();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
    }
  } catch (error) {
    console.error('Error uploading post:', error);
    setErrorMessage('Failed to upload the post. Please try again.');
    setTimeout(() => {
      setErrorMessage('');
    }, 2000);
  }
  
};



const handleKeyDown = async (e) => {
  if (e.key === 'Enter' && tagInput) {
      e.preventDefault(); // Prevent default behavior of the Enter key

      // Check if the tag already exists in the tagSuggestions state
      const tagExists = tagSuggestions.some(tag => tag.name === tagInput.trim().slice(tagInput.lastIndexOf('#') + 1));

      // If the tag already exists, add it to the post and update hashtags
      if (tagExists) {
          setNewPost((prev) => prev + `#${tagInput.trim().slice(tagInput.lastIndexOf('#') + 1)} `);
          setHashtags((prevTags) => [...prevTags, tagInput.trim().slice(tagInput.lastIndexOf('#') + 1)]); // Update hashtags
      } else {
          // If the tag does not exist, create a new hashtag
          try {
              await createHashtag(tagInput.trim().slice(tagInput.lastIndexOf('#') + 1));
              setNewPost((prev) => prev + `#${tagInput.trim().slice(tagInput.lastIndexOf('#') + 1)} `);
          } catch (error) {
              console.error("Error creating hashtag:", error);
              // Optionally, display an error message to the user
          }
      }

      setTagInput(''); // Clear the input field after adding the tag
      setTagSuggestions([]); // Clear suggestions after adding
  }
};



const API_URL = 'http://localhost:8000/posts/hashtags/'; // Adjust to your backend API URL

const fetchTags = async (query) => {
    try {
        // Get the token from local storage (or any other state management)
        const token = localStorage.getItem('token'); // Assuming you're storing the token in local storage

        // Log the token to see if it's being retrieved correctly
        console.log("Token:", token);

        // Set up headers
        const headers = {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        };

        // Log the query and headers
        console.log("Fetching tags with input:", query);
        console.log("Headers being sent:", headers);

        // Make a GET request to fetch hashtags
        const response = await axios.get(API_URL, {
            headers, // Set headers for authorization
            params: { q: query }, // Pass query parameter if provided
        });

        // Log the response data
        console.log("Response received:", response.data);

        return response.data; // Return the fetched data
    } catch (error) {
        console.error("Error fetching hashtags:", error);
        throw error; // Rethrow error to handle it in the component
    }
};


const createHashtag = async (newTag) => {
  
  try {
    const token = localStorage.getItem('token'); // Get the token from localStorage
    const response = await fetch('http://localhost:8000/posts/tags/create/', {
      
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`, // Set the authorization header
      },
      body: JSON.stringify({ name: newTag }),
    });

    if (!response.ok) {
      throw new Error('Failed to create hashtag');
    }

    fetchTags(newTag);
  } catch (error) {
    console.error("Error creating hashtag:", error);
  }
};


// Call fetchTags when input changes to show suggestions
useEffect(() => {
  fetchTags(tagInput);
}, [tagInput]);

const handleTagInputChange = async (e) => {
  const value = e.target.value;
  setTagInput(value); // Update tag input

  // Only fetch tags if the input contains a '#' character
  const hashIndex = value.lastIndexOf('#');
  if (hashIndex !== -1 && hashIndex + 1 < value.length) {
      const query = value.slice(hashIndex + 1); // Get the text after '#'
      if (query.length > 0) {
          try {
              const tags = await fetchTags(query);
              setTagSuggestions(tags); // Update tag suggestions
          } catch (error) {
              console.error("Error fetching tag suggestions:", error);
          }
      } else {
          setTagSuggestions([]); // Clear suggestions if no text after '#'
      }
  } else {
      setTagSuggestions([]); // Clear suggestions if no '#' present
  }
};

const handleTagSelect = (tag) => {
  // Find the position of the last '#' in the input
  const hashIndex = tagInput.lastIndexOf('#');
  // Create the new input value by replacing the current tag input with the selected tag
  const newInputValue = `${tagInput.slice(0, hashIndex + 1)}${tag.name} `;

  setTagInput(newInputValue); // Set the input to the new value
  setNewPost((prev) => prev + `#${tag.name} `); // Add the selected tag to the post
  setHashtags((prevTags) => [...prevTags, tag.name]); // Update hashtags
  setTagSuggestions([]); // Clear suggestions
   // Clear the tag input after selecting
   setTagInput(''); // Clear the tag input
};
  // Reset form and state
  const resetForm = () => {
    setNewPost('');
    setMediaCaption('');
    setOriginalImage(null);
    setVideo(null); // Reset video
    setEditingPostId(null);
    setCroppedImage(null);
    setImage(null); // Reset image
    setShowCropper(false); // Hide cropper if it was open
    setVideoPreview(null);
    setHashtags([]); 
  };
  
  

  // const handleDelete = (postId) => {
  //   if (window.confirm('Are you sure you want to delete this post?')) {
  //     dispatch(deletePost(postId));
  //   }
  // };

  const handleDelete = (postId) => {
    setPostToDelete(postId); // Set the post ID to delete
    setShowDeleteModal(true); // Show the delete confirmation modal
  };

  const confirmDelete = () => {
    dispatch(deletePost(postToDelete)); // Dispatch the delete action
    setShowDeleteModal(false); // Close the modal
  };



 


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
    <div className="max-w-2xl mx-auto p-6 space-y-6">
        {showSuccessPopup && (
  <div className="mt-4 p-2 bg-green-600 text-white border border-green-700 rounded-md shadow-sm transition-all duration-200">
    {successMessage} {/* Display the dynamic success message */}
  </div>
)}
{errorMessage && (
  <div className="mt-2 p-1 bg-red-500 text-white border border-red-600 rounded-md shadow-sm transition-all duration-200 text-sm">
    {errorMessage} {/* Display the dynamic error message */}
  </div>
)}



      <div className="bg-white p-6 rounded-lg shadow-md mb-6 max-w-2xl mx-auto"> 
    

      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <HiOutlineChatAlt2 className="w-6 h-6 text-blue-600 mr-2" />
        {editingPostId ? 'Edit Post' : 'Add a New Post'}
      </h2>

      <textarea
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
        className="form-control w-full h-24 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mb-4"
        placeholder="What's on your mind?"
      />
    <div className="relative mb-4">
  <input
    type="text"
    value={tagInput}
    onChange={handleTagInputChange}
    onKeyDown={handleKeyDown}
    placeholder="Add a tag (press Enter)"
    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
  />
  {tagSuggestions.length > 0 && (
    <ul className="absolute bg-white border border-gray-300 rounded-lg shadow-md mt-1 z-10 w-full max-h-60 overflow-auto">
      {tagSuggestions.map((tag) => (
        <li
          key={tag.id}
          className="flex items-center px-4 py-2 hover:bg-gray-100 transition duration-150 ease-in-out cursor-pointer"
          onClick={() => handleTagSelect(tag)}
        >
          <span className="text-gray-800">{tag.name}</span>
        </li>
      ))}
    </ul>
  )}
</div>


      {errorMessage && (
        <p className="text-red-600 text-sm mb-2">{errorMessage.message}</p>
      )}

      <div className="flex space-x-4 mb-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="imageUpload"
        />
        <label
          htmlFor="imageUpload"
          className="flex items-center text-gray-500 hover:text-blue-600 transition duration-200 cursor-pointer"
        >
          <FaImage className="w-6 h-6" />
        </label>

        <input
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
          className="hidden"
          id="videoUpload"
        />
        <label
          htmlFor="videoUpload"
          className="flex items-center text-gray-500 hover:text-blue-600 transition duration-200 cursor-pointer"
        >
          <FaVideo className="w-6 h-6" />
        </label>

        <button
          className="flex items-center text-gray-500 hover:text-blue-600 transition duration-200"
          onClick={toggleEmojiPicker}
        >
          <FaRegSmile className="w-6 h-6" />
        </button>
        
        {showEmojiPicker && (
          <div className="absolute z-10 bg-white shadow-md rounded-lg p-4 mt-12">
            <Picker
              data={data}
              onEmojiSelect={onEmojiClick}
            />
          </div>
        )}
      </div>

      {showCropper && (
        <div className="relative w-full h-64 mb-4">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
          <button
            onClick={handleCropSave}
            className="absolute bottom-0 right-0 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Crop & Save
          </button>
        </div>
      )}

      {croppedImage && (
        <div className="mb-4">
          <img
            src={URL.createObjectURL(croppedImage)}
            alt="Cropped"
            className="h-80 w-full object-cover rounded-md"
          />
        </div>
      )}

      {originalImage && !croppedImage && (
        <div className="mb-4">
          <img
            src={originalImage}
            alt="Original"
            className="h-80 w-full object-cover rounded-md"
          />
        </div>
      )}

      {videoPreview && (
        <div className="mb-4">
          <video controls src={videoPreview} className="w-full h-64 object-cover rounded-md" />
        </div>
      )}

      <div className="flex space-x-2">
        <button
          onClick={uploadPost}
          className="bg-blue-600 text-white py-2 px-4 text-sm rounded-md hover:bg-blue-700 transition duration-200"
        >
          {editingPostId ? 'Update Post' : 'Post'}
          {/* <button
            onClick={resetForm}
            className="bg-gray-600 text-white py-2 px-4 text-sm rounded-md hover:bg-gray-700 transition duration-200"
          >
            Discard
          </button> */}
        </button>

        {editingPostId && (
          <button
            onClick={resetForm}
            className="bg-gray-600 text-white py-2 px-4 text-sm rounded-md hover:bg-gray-700 transition duration-200"
          >
            Discard
          </button>
        )}
      </div>
    </div>
      
      <ul className="space-y-6"> {/* Space between posts */}
  {posts.map((post) => (
    <li key={post.id} className="bg-white border border-gray-300 rounded-lg shadow-lg transition-transform duration-300 hover:shadow-xl mb-6 p-4"> {/* Enhanced shadow */}
      <div className="flex items-center mb-4"> {/* User Info: Profile Picture and Name */}
        <img
          src={profilePicture}
         
          className="h-14 w-14 rounded-full border border-gray-200 shadow-md" // Added border to profile picture
        />
        <div className="ml-4">
          <span className="font-bold text-gray-800 text-lg capitalize">{firstName}</span>
          <span className="text-gray-500 text-sm block">
            Posted on {new Date(post.created_at).toLocaleDateString()}
            {console.log('date', post.created_at)}
          </span>
        </div>
      </div>

      {/* Post Content */}
      <div className="relative mb-4"> {/* Relative positioning for dropdown */}
   
         <p>{renderContentWithHashtags(post.content)}</p>
        {post.image && (
          <img
            src={post.image}
            alt="Post"
            className="w-full h-64 object-cover rounded-md mb-4 shadow-sm transition-transform duration-300 hover:scale-105"
          />
        )}
        {post.video && (
          <video controls src={post.video} className="w-full h-64 object-cover rounded-md mb-4 shadow-sm" />
        )}
       

        {/* Dropdown Menu for Edit and Delete */}
        <button
          onClick={() => toggleDropdown(post.id)}
          className="absolute top-2 right-2 p-1 text-gray-600 hover:text-gray-800" style={{marginTop:'-3%'}}
        >
          <FaEllipsisV className="h-5 w-5" />
        </button>

        {dropdownVisible[post.id] && (
          <div className="absolute top-8 right-2 bg-white border border-gray-300 rounded-lg shadow-md p-3 z-50">
            <button
              onClick={() => {
                handleEdit(post);
                setDropdownVisible((prev) => ({ ...prev, [post.id]: false })); // Close dropdown after edit
              }}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <FaEdit className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => {
                handleDelete(post.id);
                setDropdownVisible((prev) => ({ ...prev, [post.id]: false })); // Close dropdown after delete
              }}
              className="flex items-center space-x-2 text-red-600 hover:text-red-800 mt-2"
            >
              <FaTrash className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Like and Comment Section */}
      <div className="flex justify-between items-center mt-4 border-t border-gray-200 pt-4">
        <div className="flex items-center space-x-4">
          {/* <button type="button" onClick={() => handleLikeToggle(post)}>
            {likedPosts.includes(post.id) ? (
              <FaRegThumbsUp className="h-5 w-5 text-blue-500 hover:text-blue-700 transition duration-200" />
            ) : (
              <FaRegThumbsUp className="h-5 w-5 text-gray-500 hover:text-gray-700 transition duration-200" />
            )}
          </button>
          <span className="text-gray-600">{post.total_likes}</span> */}
         
           {/* <Like postId={post.id} />  */}
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

{/*        

          <button className="flex items-center text-gray-500 hover:text-gray-700 transition duration-200">
            <FaRegComment className="h-5 w-5" />
           
          </button> */}

          <BookmarkButton postId={post.id} />
          <FlagPost postId={post.id} />
        </div>
      </div>

      {/* Comments Section */}
      <CommentList postId={post.id} />
      {/* Bordered line separator for comments */}
      <div className="border-t border-gray-300 mt-4 mb-2"></div>
    </li>
  ))}
</ul>




      {/* Delete Confirmation Modal */}
{showDeleteModal && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-70">
    <div className="bg-white p-6 rounded-lg shadow-lg transition-transform transform scale-100 hover:scale-105">
      <h2 className="text-xl font-bold text-red-600 mb-2 text-center">Confirm Deletion</h2>
      <p className="mt-2 text-gray-700 text-center">
        Are you absolutely sure you want to delete this post?
      </p>
      <div className="mt-4 flex justify-center space-x-4">
        <button
          onClick={() => setShowDeleteModal(false)}
          className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
        >
          Cancel
        </button>
        <button
          onClick={confirmDelete}
          className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-200"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}



      
    </div>
  );
};

export default PostComponent;








