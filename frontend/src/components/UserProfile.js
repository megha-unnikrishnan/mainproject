








import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import defaultCover from '../assets/cover-photo.png';
import defaultProfile from '../assets/profile-pic.jpeg';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { fetchUserDetails, updatePictures, fetchAllUsers } from '../features/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import FollowButton from './FollowButton ';
import { followUser,unfollowUser } from '../features/followerSlice';
import Sidebar from './SideBar';
import NotificationsList from './NotificationsList';
import NotificationSocket from './NotificationSocket';
import WebSocketContainer from './WebSocketContainer';
import { setUserId } from '../features/notificationSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { fetchFollowing } from '../features/followerSlice';
import FollowingPage from './FollowingPage';
import { fetchFollowingandfollowers,resetFollowers } from '../features/followerSlice';
import { setIsFollowing } from '../features/followerSlice';
import { FaTimes } from 'react-icons/fa'; // Close icon
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import PostComponent from './PostComponent';
import FollowersPage from './FollowersPage';
import MessageIcon from './MessageIcon';
const UserProfile = () => {
  const [coverPhoto, setCoverPhoto] = useState(defaultCover);
  const [profilePic, setProfilePic] = useState(defaultProfile);
  const [coverPreview, setCoverPreview] = useState(defaultCover);
  const [profilePreview, setProfilePreview] = useState(defaultProfile);
  const [cropCover, setCropCover] = useState(false);
  const [cropProfile, setCropProfile] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const dispatch = useDispatch();
  const coverCropperRef = useRef(null);
  const profileCropperRef = useRef(null);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const users = useSelector((state) => state.auth.user);
  // console.log(users);
  const loggedInUser = useSelector((state) => state.auth.user); // Define loggedInUser first
  // Now use it
  const userIds = useSelector((state) => state.auth.userId); // Adjust according to your state structure
  const navigate=useNavigate()
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 50, height: 50 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const canvasRef = useRef(null); // Reference for the canvas
  const [searchTerm, setSearchTerm] = useState('');
  
   
 
//   const following = useSelector((state) => state.followers.following);
// const followingCount = following.length;
  
// useEffect(() => {
//   const token = localStorage.getItem('token');
//   if (!token) {
//     navigate('/');
//   }
// }, [navigate]);



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

 
  // const selectFollowingCount = (state) => state.followers.following.length
  // const followingCount = useSelector(selectFollowingCount);
 
  useEffect(() => {
    const fetchDetails = async () => {
      const response = await dispatch(fetchUserDetails());
      if (response.payload) {
        setCoverPhoto(response.payload.cover_picture || defaultCover);
        setProfilePic(response.payload.profile_picture || defaultProfile);
      }
    };
    fetchDetails();
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const onEmojiClick = (event, emojiObject) => {
    const emojiCharacter = emojiObject.emoji; // Ensure you're accessing the correct property
    setNewPost((prev) => prev + emojiCharacter); // Append emoji to the text area
};
const onImageCropComplete = (crop) => {
  setCompletedCrop(crop);
};



  const allUsers = useSelector((state) => state.auth.allUsers) || [];  // List of all users fetched
  const otherUsers = Array.isArray(allUsers) ? allUsers.filter(user => user.id !== loggedInUser?.id) : [];
  const username = loggedInUser ? loggedInUser.first_name : null;
  console.log('username',username);
  

  const handleCoverPhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
      setCropCover(true);
    }
  };

  


  

  const isFollowing = (user) => {
    if (!loggedInUser || !loggedInUser.following) return false;
    return loggedInUser.following.some(followedUser => followedUser.id === user.id);
  };


  const isFollower = (user) => {
    if (!loggedInUser || !loggedInUser.followers) return false;
    return loggedInUser.followers.some(followerUser => followerUser.id === user.id);
  };
  


  // const handleProfilePicChange = (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     setProfilePreview(URL.createObjectURL(file));
  //     setCropProfile(true);
  //   }
  // };



  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePreview(URL.createObjectURL(file));
      setCropProfile(true);
    }
  };
  


  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear the search input
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Filter the users based on the search term (case-insensitive)
  const filteredUsers = otherUsers.filter(user => 
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase())
  );





  const cropCoverPhoto = async () => {
    if (coverCropperRef.current) {
      const cropper = coverCropperRef.current.cropper;
      if (cropper) {
        const desiredWidth = 800;
        const aspectRatio = cropper.getData().width / cropper.getData().height;
        const newHeight = desiredWidth / aspectRatio;
  
        const croppedCanvas = cropper.getCroppedCanvas({
          width: desiredWidth,
          height: newHeight,
        });
  
        if (croppedCanvas) {
          const croppedImage = croppedCanvas.toDataURL();
          setCoverPhoto(croppedImage);
          setCoverPreview(croppedImage);
          setCropCover(false);
  
          const formData = new FormData();
          formData.append('cover_picture', croppedImage);
          await dispatch(updatePictures(formData));  // Ensure update completes
          await dispatch(fetchUserDetails());        // Fetch updated user data
        }
      }
    }
  };
  
  
  // const cropCoverPhoto = () => {
  //   if (coverCropperRef.current) {
  //     const cropper = coverCropperRef.current?.cropper;
  //     if (cropper) {
  //       // Set the desired width for the cropped image
  //       const desiredWidth = 800; // Change this to your desired width
  //       const aspectRatio = cropper.getData().width / cropper.getData().height; // Maintain the aspect ratio
  
  //       // Calculate the new height based on the aspect ratio
  //       const newHeight = desiredWidth / aspectRatio;
  
  //       // Get the cropped canvas with the new dimensions
  //       const croppedCanvas = cropper.getCroppedCanvas({
  //         width: desiredWidth,
  //         height: newHeight,
  //       });
  
  //       if (croppedCanvas) {
  //         const croppedImage = croppedCanvas.toDataURL();
  //         setCoverPhoto(croppedImage);
  //         setCoverPreview(croppedImage);
  //         setCropCover(false);
  
  //         const formData = new FormData();
  //         formData.append('cover_picture', croppedImage);
  //         dispatch(updatePictures(formData));
  //       }
  //     }
  //   }
  // };
  
  // const cropProfilePic = () => {
  //   if (profileCropperRef.current) {
  //     const cropper = profileCropperRef.current?.cropper;
  //     if (cropper) {
  //       const croppedCanvas = cropper.getCroppedCanvas();
  //       if (croppedCanvas) {
  //         const croppedImage = croppedCanvas.toDataURL();
  //         setProfilePic(croppedImage);
  //         setProfilePreview(croppedImage);
  //         setCropProfile(false);

  //         const formData = new FormData();
  //         formData.append('profile_picture', croppedImage);
  //         dispatch(updatePictures(formData));
  //       }
  //     }
  //   }
  // };

  const cropProfilePic = async () => {
    if (profileCropperRef.current) {
      const cropper = profileCropperRef.current.cropper;
      if (cropper) {
        const croppedCanvas = cropper.getCroppedCanvas();
        if (croppedCanvas) {
          const croppedImage = croppedCanvas.toDataURL();
          setProfilePic(croppedImage);
          setProfilePreview(croppedImage);
          setCropProfile(false);
  
          const formData = new FormData();
          formData.append('profile_picture', croppedImage);
          await dispatch(updatePictures(formData));  // Ensure update completes
          await dispatch(fetchUserDetails());        // Fetch updated user data
        }
      }
    }
  };

  const { userId } = useParams(); // Get userId from the URL
  const [user, setUser] = useState(null);


  useEffect(() => {
    const fetchUser = async () => {
      const response =  dispatch(fetchUserDetails(userId)); // Fetch user details using userId
      if (response.payload) {
        setUser(response.payload);
      }
    };
    fetchUser();
  }, [dispatch, userId]);

  const handleFollowingClick = () => {
    setShowFollowingModal(true); // Open the modal
  };

  const handleFollowersClick = () => {
    setShowFollowersModal(true); // Open the modal
  };

  const handlePostSuccess = () => {
    setShowSuccessPopup(true); // Show the success popup
    setTimeout(() => {
      setShowSuccessPopup(false); // Hide the popup after 3 seconds
    }, 3000);
  };

  const handleNewPostSubmit = () => {
    if (newPost.trim()) {
      setPosts([{ id: Date.now(), content: newPost }, ...posts]);
      setNewPost('');
    }
  };

  const toggleEditProfile = () => {
    setEditingProfile(!editingProfile);
  };
  useEffect(() => {
    dispatch(fetchFollowingandfollowers());
  }, [dispatch]);
  

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


    <div className="flex h-screen bg-gray-100 pt-9 ">
     
      <Sidebar />
      
      <div className="flex-1 ml-64 p-6 flex" style={{paddingBottom:'0%'}}>
      
        {/* Profile Container */}
        <div className="flex-1 max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
          {/* Cover Photo */}
          <div className="relative w-full h-72 mb-6">
            <img
              src={coverPhoto}
              alt="Cover photo"
              className="w-full h-full object-cover rounded-t-lg"
            />
             <label
      htmlFor="cover-photo-upload"
      className="absolute bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full cursor-pointer"
    >
      <FontAwesomeIcon icon={faCamera} size="2x" />
      <input
        id="cover-photo-upload"
        type="file"
        accept="image/*"
        onChange={handleCoverPhotoChange}
        className="hidden"
      />
    </label>
          </div>

          {/* Profile Section */}
          <div className="flex items-center mb-6">
            <div className="relative">
              <img
                src={profilePic}
                alt="Profile picture"
                className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-lg"
              />
              <label
                htmlFor="profile-pic-upload"
                className="absolute bottom-0 right-0 bg-gray-800 text-white p-2 rounded-full cursor-pointer"
              >
               <FontAwesomeIcon icon={faCamera} size="1x" />
                <input
                  id="profile-pic-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="ml-4 flex-1">
  <h1 className="text-2xl font-semibold text-gray-800 mb-2 font-sans capitalize">{username}</h1>

  <Link to="#" onClick={handleFollowersClick} className="ml-4 text-gray-600 hover:underline">
        <FontAwesomeIcon icon={faUserPlus} className="mr-1" />
        {followersCount} Followers
      </Link>

  {/* Wrap Following in a Link to navigate to the FollowingPage */}
  {/* <Link to="#" onClick={handleFollowingClick} className="ml-4 text-gray-600 hover:underline">
  <FontAwesomeIcon icon={faUserPlus} className="mr-1" />
  {loggedInUser && loggedInUser.following ? loggedInUser.following.length : 0} Following
</Link> */}

<Link to="#" onClick={handleFollowingClick} className="ml-4 text-gray-600 hover:underline">
        <FontAwesomeIcon icon={faUserPlus} className="mr-1" />
        {followingCount} Following
      </Link>

  

       {/* Modal for Following */}
       {showFollowingModal && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
    <div className="bg-white w-full max-w-md h-3/4 rounded-lg shadow-2xl p-6 overflow-y-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Following</h2>
        <button
          onClick={() => setShowFollowingModal(false)}
          className="text-gray-500 hover:text-gray-700 transition duration-150"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Scrollable content area */}
      <div className="mt-4">
        <FollowingPage closeModal={() => setShowFollowingModal(false)} />
      </div>

      {/* Close Button */}
      <div className="flex justify-center mt-4">
       
      </div>
    </div>
  </div>
)}


 {/* Modal for Following */}
 {showFollowersModal && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
    <div className="bg-white w-full max-w-md h-3/4 rounded-lg shadow-2xl p-6 overflow-y-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Followers</h2>
        <button
          onClick={() => setShowFollowersModal(false)}
          className="text-gray-500 hover:text-gray-700 transition duration-150"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Scrollable content area */}
      <div className="mt-4">
        <FollowersPage closeModal={() => setShowFollowersModal(false)} />
      </div>

      {/* Close Button */}
      <div className="flex justify-center mt-4">
       
      </div>
    </div>
  </div>
)}


  <div className="mt-2">
    <Link to="/edit-profile" className="text-blue-600 hover:underline">
      Edit Profile
    </Link>
  </div>
</div>



          </div>

         
          {/* <div className="max-w-2xl mx-auto p-6"> */}
      {/* Add a New Post Section */}

      <div>
      <PostComponent onSuccess={handlePostSuccess} />

      {showSuccessPopup && (
        <div className="fixed top-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg transition duration-500 ease-in-out">
          Post created successfully!
        </div>
      )}
    </div>







          {/* User's Posts */}
           {/* User's Posts */}
           <div className="bg-gray-50 p-6 rounded-lg shadow-md mt-4">
                {/* <h2 className="text-lg font-semibold text-gray-800 mb-4">Posts</h2> */}
                {posts.length === 0 ? (
                    <p className="text-gray-600"></p>
                ) : (
                    <ul>
                        {posts.map((post) => (
                            <li key={post.id} className="mb-4 p-4 bg-white rounded-md shadow-md border border-gray-200">
                                <p>{post.content}</p>
                                {post.image && <img src={post.image} alt="Post" className="w-full mt-2 rounded-md" />}
                                {post.video && <video controls className="w-full mt-2 rounded-md" src={post.video} />}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
  

        <style>
        {`
          .scrollbar-hidden::-webkit-scrollbar {
            display: none; /* Hides scrollbar in WebKit browsers like Chrome, Safari */
          }
          .scrollbar-hidden {
            -ms-overflow-style: none;  /* Hides scrollbar in IE and Edge */
            scrollbar-width: none;     /* Hides scrollbar in Firefox */
          }
        `}
      </style>

        <div className="w-full max-w-xs sticky top-0 max-h-screen overflow-hidden p-4 bg-white shadow-lg rounded-lg border border-gray-200">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">People you may know</h2>

  {/* Redesigned Search Bar (Instagram-like) */}
  <div className="relative mb-4">
    <input
      type="text"
      placeholder="Search"
      value={searchTerm} // Controlled input
      onChange={handleSearchChange} // Update search term on input change
      className="w-full py-1.5 px-3 text-sm bg-gray-100 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-300 ease-in-out"
    />

    {searchTerm && (
      <button 
        onClick={handleClearSearch} 
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500 transition-colors duration-200 focus:outline-none"
      >
        &#10005; {/* Unicode character for the close (X) icon */}
      </button>
    )}
  </div>

  {/* Scrollable User List Inside the Container */}
  <div className="overflow-y-auto max-h-[calc(100vh-200px)] space-y-3 scrollbar-hidden">
    {filteredUsers.length === 0 ? (
      <p className="text-gray-600 text-sm">No users found.</p>
    ) : (
      filteredUsers.map((user) => (
        <div
          key={user.id}
          className="bg-white rounded-lg shadow-md border border-gray-200 flex items-center p-3 hover:shadow-lg transition-shadow duration-300 ease-in-out"
        >
          {/* Profile Picture */}
          <img
            src={user.profile_picture || defaultProfile}
            alt={`${user.first_name}'s profile`}
            className="w-12 h-12 object-cover rounded-full border-2 border-gray-300 mr-3 transition-transform duration-300 hover:scale-105"
          />

          {/* User Info */}
          <div className="flex-1 flex flex-col">
            <Link to={`/userprofile/${user.id}`} className="w-full">
              <h3 className="text-base font-medium text-gray-800 capitalize hover:text-blue-500 transition-colors duration-300">
                {user.first_name}
              </h3>
            </Link>
            <div className="mt-1">
              <FollowButton userId={user.id} />
            </div>
          </div>
        </div>
      ))
    )}
  </div>
</div>


            
           {/* <NotificationsList/> */}
     



      </div>

      {/* Cropper Modals */}
      {cropCover && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <Cropper
            src={coverPreview}
            style={{ height: 400, width: '100%' }}
            aspectRatio={16 / 9}
            guides={false}
            ref={coverCropperRef}
          />
          <button
            onClick={cropCoverPhoto}
            className="absolute bottom-4 right-4 bg-blue-600 text-white p-2 rounded-md"
          >
            Crop
          </button>
        </div>
      )}
      {cropProfile && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <Cropper
            src={profilePreview}
            style={{ height: 400, width: '100%' }}
            aspectRatio={1}
            guides={false}
            ref={profileCropperRef}
          />
          <button
            onClick={cropProfilePic}
            className="absolute bottom-4 right-4 bg-blue-600 text-white p-2 rounded-md"
          >
            Crop
          </button>
        </div>
      )}

      

    </div>
    </div>
  );
};

export default UserProfile;




















