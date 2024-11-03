













import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faSmile, faImage, faVideo, faTimes, faPaperPlane,faEllipsisV ,faCheckDouble,faCheck} from '@fortawesome/free-solid-svg-icons';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import axios from 'axios';
import VideoCall from './VideoCall';
import NotificationsList from './NotificationsList';
import MessageIcon from './MessageIcon';
const ChatConversation = () => {
  const { userId } = useParams();
  const loggedInUser = useSelector((state) => state.auth.user);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [imageInput, setImageInput] = useState(null); // State for the selected image
  const [imagePreview, setImagePreview] = useState(null); // State for the image preview
  const [videoInput, setVideoInput] = useState(null); // State for the selected video
  const [videoPreview, setVideoPreview] = useState(null); // State for the video preview
  const [userDetails, setUserDetails] = useState({ profilePicture: '', firstName: '' });
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false); // State to indicate message sending
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false); // State for upload options dropdown
  const [isVideoSending, setIsVideoSending] = useState(false); // State to indicate video sending
  const [editMessageId, setEditMessageId] = useState(null); // State for editing message
  const [editMessageContent, setEditMessageContent] = useState(''); // Content for the edit modal
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState(false);
  const [deleteMessageId, setDeleteMessageId] = useState(null); // State for the message to be deleted
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [visibleOptionsMessageId, setVisibleOptionsMessageId] = useState(null); // Track which message has options open
  // Refs for hidden file inputs
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [editImage, setEditImage] = useState(null);
const [editVideo, setEditVideo] = useState(null);
const [imagePreviewEdit, setImagePreviewEdit] = useState(null);
const [videoPreviewEdit, setVideoPreviewEdit] = useState(null);
const [editMode, setEditMode] = useState(''); 
const [isCallStarted, setIsCallStarted] = useState(false);

const [isInCall, setIsInCall] = useState(false);
const [recipientId, setRecipientId] = useState(''); // Set recipient ID for video call

const messageIds = useRef(new Set());
const [connectionError, setConnectionError] = useState(null);
const [errorMessage, setErrorMessage] = useState('');
const [isCallActive, setIsCallActive] = useState(false);
const [isCallReceived, setIsCallReceived] = useState(false);

const username = loggedInUser ? loggedInUser.first_name : null;
const handleCallAccepted = () => {
  console.log("Call accepted.");
  setIsCallActive(true);
  // More state updates...
};

const handleCallRejected = () => {
  console.log("Call rejected.");
  setIsCallReceived(false);
  // More state updates...
};

  // Function to fetch user details (recipient's details)
  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/posts/users/${userId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserDetails({
        profilePicture: response.data.profile_picture,
        firstName: response.data.first_name,
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/posts/messages/${userId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched Messages:", response.data); // Debugging log
  
      const messagesWithSenderId = response.data.map((message) => ({
        ...message,
        isSender: message.sender_id === loggedInUser.id,
        isReceiver: message.recipient_id === loggedInUser.id,
        isDelivered: message.is_delivered,
      isRead: message.is_read,
      }));
  
      setMessages(messagesWithSenderId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };
  
  
  
  


  // const handleEditMessage = async (messageId, newContent, newImage, newVideo) => {
  //   try {
  //     const token = localStorage.getItem('token');
  //     const formData = new FormData();
  
  //     // Append content and new files to formData
  //     formData.append('content', newContent);
  //     if (newImage) {
  //       formData.append('image', newImage);
  //     }
  //     if (newVideo) {
  //       formData.append('video', newVideo);
  //     }
  
  //     const response = await axios.put(
  //       `http://localhost:8000/posts/messages/${messageId}/edit/`, 
  //       formData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           'Content-Type': 'multipart/form-data', // Set content type for file uploads
  //         },
  //       }
  //     );
  
  //     // Check if response data is in the expected structure
  //     if (response.data) {
  //       // Update the messages state with the edited message
  //       setMessages((prevMessages) => 
  //         prevMessages.map((msg) => (msg.id === messageId ? response.data : msg))
  //       );
  //     }
  
  //     // Clear the edit state
  //     setEditMessageId(null); // Close the modal after editing
  //     setEditMessageContent(''); // Clear the edit input
  //     setEditImage(null); // Clear the selected image
  //     setEditVideo(null); // Clear the selected video
  //     setImagePreviewEdit(null); // Clear the image preview
  //     setVideoPreviewEdit(null); // Clear the video preview
  
  //   } catch (error) {
  //     console.error('Error editing message:', error.response?.data || error.message);
  //     // Optionally, display an error message to the user
  //   }
  // };


  const handleEditMessage = async (messageId, newContent, newImage, newVideo) => {
    const messageData = {
      action: 'edit_message',
      message_id: messageId,
      new_content: newContent,
      image: newImage ? await getBase64(newImage) : null,
      video: newVideo ? await getBase64(newVideo) : null,
    };
  
    // Send the edited message data via WebSocket
    socket.send(JSON.stringify(messageData));
  
    // Update the messages state optimistically
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, content: newContent, image: newImage ? URL.createObjectURL(newImage) : msg.image, video: newVideo ? URL.createObjectURL(newVideo) : msg.video } : msg
      )
    );
  
    // Reset editing states
    setEditMessageId(null);
    setEditMessageContent('');
    setEditImage(null);
    setEditVideo(null);
    setImagePreviewEdit(null);
    setVideoPreviewEdit(null);
  };
  


  
  
  // const handleDeleteMessage = async (messageId) => {
  //   try {
  //     const token = localStorage.getItem('token');
  //     await axios.delete(
  //       `http://localhost:8000/posts/messages/${messageId}/delete/`, 
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  
  //     // Remove the deleted message from the state
  //     setMessages((prevMessages) => 
  //       prevMessages.filter((msg) => msg.id !== messageId)
  //     );
  //     setIsDeleteConfirmationVisible(false); // Close delete confirmation modal
  //   } catch (error) {
  //     console.error('Error deleting message:', error.response?.data || error.message);
  //   }
  // };




 


  const establishWebSocketConnection = () => {
    const token = localStorage.getItem('token');
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${wsProtocol}://localhost:8000/chat/${userId}/?token=${token}`);
    setSocket(ws);
  
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const isDelivered = data.is_delivered !== undefined ? data.is_delivered : false;
      const isRead = data.is_read !== undefined ? data.is_read : false;
      if (data.type === 'read_receipt' && data.message_id) {
        // Update the specific message in the state to mark it as read
        setMessages((prevMessages) =>
            prevMessages.map((msg) =>
                msg.id === data.message_id ? { ...msg, isRead: true } : msg
            )
        );
        return; // Exit to avoid further processing for this message
    }
    else if (data.action === 'message_delete') {
      handleMessageDelete(data.message_id);
  } else if (data.action === 'chat_message') {
      // Add the new message to the state
      setMessages((prevMessages) => [...prevMessages, data]);
  }
  else if (data.action === 'edit_message') {
    // Update the specific message in the state with the new content
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === data.id ? { ...msg, content: data.message, image: data.image, video: data.video } : msg
      )
    );
  }
 
    
      // console.log("Received message data:", data);
  
      // Ensure the sender_id is included in the incoming message
      setMessages((prevMessages) => [
        ...prevMessages,
        { 
          id: data.id, 
          content: data.message, 
          sender_id: data.user_id,  // Ensure sender_id is set correctly
          recipient_id: data.recipient_id,
          isSender: data.user_id === loggedInUser .id,  
          image: data.image, 
          video: data.video ,
          timestamp:data.timestamp,
          isDelivered: isDelivered,  // Ensure this is set
          isRead: data.is_read || false, // Ensure this is set
        },
      ]);
    };


  
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      
  setConnectionError('Failed to connect to the server. Please check your network connection.');
    };
  
    ws.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
      // Re-establish the WebSocket connection after 1 second
      setTimeout(establishWebSocketConnection, 1000);
    };
  };
  
  useEffect(() => {
    const fetchData = async () => {
      await fetchUserDetails();
      await fetchMessages();
      setLoading(false);
    };
  
    fetchData();
    establishWebSocketConnection();
  
    return () => {
      if (socket) {
        socket.close(); // Only close the socket if it exists
      }
    };
  }, [userId]);

  // Function to convert file to Base64
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]); // Remove the data URL prefix
      reader.onerror = (error) => reject(error);
    });
  };




  const handleMessageDelete = (messageId) => {
    // Update state to remove the deleted message
    setMessages((prevMessages) => 
        prevMessages.filter(message => message.id !== messageId)
    );
};

const handleDeleteMessage = async (messageId) => {
    // Send delete request to backend (if needed)
    socket.send(JSON.stringify({ action: 'delete_message', id: messageId }));
    setIsDeleteConfirmationVisible(false)
};



const handleMessageEdit = (messageId, newContent) => {
  // Update state to reflect the edited message
  setMessages((prevMessages) =>
      prevMessages.map(message =>
          message.id === messageId ? { ...message, message: newContent } : message
      )
  );
};







  const handleSendMessage = async () => {
    const trimmedMessage = messageInput.trim();

    // Prevent sending if the message is empty (only spaces) and both imageInput and videoInput are null
    if (!trimmedMessage && !imageInput && !videoInput) {
      setErrorMessage('Please enter a message or attach an image/video.'); // Optional: Set error message to inform user
      return;
    }
   // Prevent sending if all are empty
    if (!loggedInUser) {
      console.error('User is not logged in. Cannot send message.');
      return;
    }

    setSending(true); // Start sending

    let base64Image = null;
    let base64Video = null;

   

    if (imageInput) {
      try {
        base64Image = await getBase64(imageInput);
      } catch (error) {
        console.error('Error converting image to Base64:', error);
        setSending(false);
        return;
      }
    }

    if (videoInput) {
      try {
        setIsVideoSending(true); // Start video sending indicator
        base64Video = await getBase64(videoInput);
      } catch (error) {
        console.error('Error converting video to Base64:', error);
        setIsVideoSending(false);
        setSending(false);
        return;
      }
    }
    const recipientId = userId;
    const messageData = {
      message: messageInput,
      sender_id: loggedInUser.id,
      recipient_id: recipientId,
      image: base64Image,
      video: base64Video, // Include video
      is_delivered: true, // Set delivery status to true
        is_read: false // Initially set read status to false
    };

    try {
      socket.send(JSON.stringify(messageData));
      
      setMessageInput('');
      setImageInput(null); // Reset image input after sending
      setImagePreview(null); // Reset image preview
      setVideoInput(null); // Reset video input after sending
      setVideoPreview(null); // Reset video preview
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false); // End sending
      setIsVideoSending(false); // End video sending indicator
    }
  };



  const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 5MB (or adjust as necessary)
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif']; // Allowed image formats

const handleImageChange = (event) => {
  if (event.target.files && event.target.files[0]) {
    const file = event.target.files[0];

    // Validation: Check if the input is empty
    if (!file) {
      setErrorMessage('Please upload an image file.');
      setSending(false);
      return;
    }

    const trimmedFileName = file.name.trim();
    if (trimmedFileName.length === 0) {
      setErrorMessage('The filename cannot be empty or just spaces.');
      setSending(false);
      return;
    }

    // Validation: Check file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrorMessage('Invalid file type. Only JPEG, PNG, and GIF formats are allowed for images.');
      setSending(false);
      return;
    }

    // Validation: Check image size
    if (file.size > MAX_IMAGE_SIZE) {
      setErrorMessage('Image size exceeds 5MB. Please choose a smaller file.');
      setSending(false);
      return;
    }

    // If all validations pass, set the image input and preview URL
    setImageInput(file); // Get the selected image file
    setImagePreview(URL.createObjectURL(file)); // Set preview URL for image
  } else {
    setErrorMessage('No file selected.'); // Handle case where no file is selected
    setSending(false);
  }
};



  const MAX_VIDEO_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg']; // Allowed video formats

const handleVideoChange = (event) => {
  if (event.target.files && event.target.files[0]) {
    const file = event.target.files[0];

    // Validation: Check if the input is empty
    if (!file) {
      setErrorMessage('Please upload a video file.');
      setSending(false);
      return;
    }

    // Validation: Check file type
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      setErrorMessage('Invalid file type. Only MP4, WebM, and OGG formats are allowed for videos.');
      setSending(false);
      return;
    }

    // Validation: Check video size
    if (file.size > MAX_VIDEO_SIZE) {
      setErrorMessage('Video size exceeds 8MB. Please choose a smaller file.');
      setSending(false);
      return;
    }

    // If all validations pass, set the video input and preview URLs
    setVideoInput(file); // Get the selected video file
    setVideoPreview(URL.createObjectURL(file)); // Set preview URL for video
    setVideoPreviewEdit(URL.createObjectURL(file)); // Create a preview URL for the video
  } else {
    setErrorMessage('No file selected.'); // Handle case where no file is selected
    setSending(false);
  }
};

  const handleRemoveImage = () => {
    setImageInput(null); // Clear image input
    setImagePreview(null); // Clear image preview
  };

  const handleRemoveVideo = () => {
    setVideoInput(null); // Clear video input
    setVideoPreview(null); // Clear video preview
  };

  // Function to add emoji to the message input
  const handleEmojiSelect = (emoji) => {
    setMessageInput((prev) => prev + emoji.native); // Append emoji to message input
  };

  // Function to toggle upload options dropdown
  const toggleUploadOptions = () => {
    setShowUploadOptions((prev) => !prev);
  };

  // Close upload options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        uploadOptionsRef.current &&
        !uploadOptionsRef.current.contains(event.target) &&
        !paperclipRef.current.contains(event.target)
      ) {
        setShowUploadOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const uploadOptionsRef = useRef(null);
  const paperclipRef = useRef(null);
 


const handleEditImageChange = (event) => {
  if (event.target.files && event.target.files[0]) {
    const file = event.target.files[0];

    // Validation: Check file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrorMessage('Invalid file type. Only JPEG, PNG, and GIF formats are allowed for images.');
      return;
    }

    // Validation: Check image size
    if (file.size > MAX_IMAGE_SIZE) {
      setErrorMessage('Image size exceeds 5MB. Please choose a smaller file.');
      return;
    }

    // If all validations pass, set the edit image and preview URL
    setEditImage(file); // Get the selected image file
    setImagePreviewEdit(URL.createObjectURL(file)); // Set preview URL for image
    setErrorMessage(''); // Clear any previous error messages
  } else {
    setErrorMessage('No file selected.'); // Handle case where no file is selected
  }
};

const handleEditVideoChange = (event) => {
  if (event.target.files && event.target.files[0]) {
    const file = event.target.files[0];

    // Validation: Check file type
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      setErrorMessage('Invalid file type. Only MP4, WebM, and OGG formats are allowed for videos.');
      return;
    }

    // Validation: Check video size
    if (file.size > MAX_VIDEO_SIZE) {
      setErrorMessage('Video size exceeds 8MB. Please choose a smaller file.');
      return;
    }

    // If all validations pass, set the edit video and preview URL
    setEditVideo(file); // Get the selected video file
    setVideoPreviewEdit(URL.createObjectURL(file)); // Set preview URL for video
    setErrorMessage(''); // Clear any previous error messages
  } else {
    setErrorMessage('No file selected.'); // Handle case where no file is selected
  }
};
 

  const renderMessageContainer = (message) => {
    const mediaStyles = "mt-2 w-full h-auto max-h-64 object-cover rounded-md";
  
    // Convert IDs to numbers for accurate comparison
    const receiverId = Number(userId); // Receiver's ID
    const senderId = Number(message.sender_id);
    const isSender = senderId === Number(loggedInUser.id);
    const isReceiver = message.recipient_id === loggedInUser.id;
  
    console.log("Message ID:", message.id, "Sender ID:", senderId, "Receiver ID:", receiverId, "Is Sender:", isSender, "Is Receiver:", isReceiver);
  
    // Handle cases where senderId is NaN or null
    if (isNaN(senderId) || senderId === null) {
      console.warn(`Message ID ${message.id} has invalid sender_id: ${message.sender_id}`);
      return null; // Skip rendering this message
    }
  
    // Log message delivery/read status for debugging
    console.log("Message Status:", {
      isDelivered: message.is_delivered,
      isRead: message.is_read
    });
  
    const showEditOptions = () => {
      setEditMessageContent(message.content);
      setEditMessageId(message.id);
      setVisibleOptionsMessageId(null); // Hide options after selecting
    };
  
    const showDeleteConfirmation = () => {
      setDeleteMessageId(message.id);
      setIsDeleteConfirmationVisible(true);
      setVisibleOptionsMessageId(null); // Hide options after selecting
    };
  
    const toggleOptions = (messageId) => {
      setVisibleOptionsMessageId((prevId) => (prevId === messageId ? null : messageId));
    };
  
    // Choose which icon to display based on message status (only for the sender)
    const renderTick = () => {
      if (isSender) {
        if (message.isRead) {
          return <FontAwesomeIcon icon={faCheckDouble} className="text-green-500" />; // Double tick (read)
        } else if (message.isDelivered) {
          return <FontAwesomeIcon icon={faCheck} className="text-gray-500" />; // Single tick (delivered)
        } else {
          console.log(`Message ID ${message.id}: Not delivered or read, no tick`);
          return null; // No tick if not delivered
        }
      }
      return null; // Don't display ticks for the receiver
    };

  
    return (
      
      <div key={message.id} className={`flex my-2 ${isSender ? 'justify-end' : 'justify-start'} relative`}>
        
        <div className={`max-w-xs p-3 rounded-lg ${isSender ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-black rounded-bl-none'}`}>
          <p>{message.content}</p>
          <span className="text-sm">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
          {message.image && <img src={message.image} alt="Message" className={mediaStyles} />}
          {message.video && (
            <video controls className={mediaStyles}>
              <source src={message.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
          <div className="flex items-center mt-1">
                          {renderTick()} {/* Render tick or double tick for the sender */}
                          <span onClick={() => toggleOptions(message.id)} className="cursor-pointer ml-2" style={{marginLeft:'73%'}}>
                              <FontAwesomeIcon icon={faEllipsisV} />
                          </span>
                      </div>
                      {visibleOptionsMessageId === message.id && (
  <div className="absolute right-0 bg-white shadow-lg rounded-md mt-2 z-20" style={{ top: '100%', minWidth: '120px' }}>
    {isSender && (
      <button 
        onClick={showEditOptions} 
        className="block w-full text-left px-4 py-2 text-blue-500 hover:bg-blue-100 rounded-t-md transition-all ease-out duration-300"
      >
        Edit
      </button>
    )}
    <button 
      onClick={showDeleteConfirmation} 
      className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-100 rounded-b-md transition-all ease-out duration-300"
    >
      Delete
    </button>
  </div>
)}

        </div>
      </div>



    );
  };
  
  

  

  if (loading || !loggedInUser) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen relative">
       
      {/* Header */}
     
      <div className="flex flex-col">
  <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-lg p-4 flex items-center justify-between sticky top-0 z-10">
    <div className="flex items-center">
      <img src={userDetails.profilePicture} alt="User" className="w-10 h-10 rounded-full" />
      <span className="ml-3 text-lg font-semibold text-white">{userDetails.firstName}</span>
    </div>
    
    
    <div className="flex items-center space-x-4">
     
      <VideoCall/>
    </div>
  </nav>
  
  <div className="p-4 border-b">
    {/* Other content can go here */}
  </div>
</div>

    

      {/* Messages */}
      <div
  className="flex-grow overflow-y-auto p-4"
  style={{
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none', // IE and Edge
  }}
>
  <style>
    {`
      .flex-grow::-webkit-scrollbar {
        display: none; /* Chrome, Safari, and Opera */
      }
      @media (max-width: 768px) {
        /* Hide scrollbar on smaller screens as well */
        .flex-grow::-webkit-scrollbar {
          display: none;
        }
      }
    `}
  </style>
  {messages.map((message) => renderMessageContainer(message))}
</div>


      {/* Input Area */}
      <div className="flex items-center p-4 border-t relative">
        {/* Paperclip Icon with Upload Options */}
        <div className="relative">
          <button
            type="button"
            className="mr-3 text-xl text-gray-500 focus:outline-none"
            onClick={toggleUploadOptions}
            ref={paperclipRef}
          >
            <FontAwesomeIcon icon={faPaperclip} />
          </button>
          {showUploadOptions && (
            <div
              ref={uploadOptionsRef}
              className="absolute bottom-12 left-0 bg-white border rounded-md shadow-lg z-20"
            >
              <button
                type="button"
                className="flex items-center p-2 hover:bg-gray-100 w-full"
                onClick={() => {
                  imageInputRef.current.click();
                  setShowUploadOptions(false);
                }}
              >
                <FontAwesomeIcon icon={faImage} className="mr-2 text-gray-600" />
                Upload Image
              </button>
              <button
                type="button"
                className="flex items-center p-2 hover:bg-gray-100 w-full"
                onClick={() => {
                  videoInputRef.current.click();
                  setShowUploadOptions(false);
                }}
              >
                <FontAwesomeIcon icon={faVideo} className="mr-2 text-gray-600" />
                Upload Video
              </button>
            </div>
          )}
        </div>

        {/* Hidden Image Input */}
        <input
          type="file"
          accept="image/*"
          ref={imageInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        {/* Hidden Video Input */}
        <input
          type="file"
          accept="video/*"
          ref={videoInputRef}
          onChange={handleVideoChange}
          className="hidden"
        />

        {/* Image Preview */}
        {imagePreview && (
          <div className="relative mr-3">
            <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-md object-cover" />
            <button
              type="button"
              className="absolute top-0 right-0 text-red-500 bg-white rounded-full p-1"
              onClick={handleRemoveImage}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        )}

        {/* Video Preview */}
        {videoPreview && (
          <div className="relative mr-3">
            <video src={videoPreview} className="w-16 h-16 rounded-md object-cover" controls />
            <button
              type="button"
              className="absolute top-0 right-0 text-red-500 bg-white rounded-full p-1"
              onClick={handleRemoveVideo}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        )}

        {/* Emoji Picker Toggle */}
        <button
          type="button"
          className="mr-3 text-xl text-gray-500 focus:outline-none"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <FontAwesomeIcon icon={faSmile} />
        </button>

        {/* Message Input */}
        <input
          type="text"
          value={messageInput}
          onChange={(event) => setMessageInput(event.target.value)}
          placeholder="Type a message..."
          className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
        />

        {/* Send Button */}
        <button
          type="button"
          className={`ml-3 text-xl text-blue-500 focus:outline-none ${sending ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleSendMessage}
          disabled={sending} // Disable button while sending
        >
          {sending ? (
            <span className="animate-spin">
              <FontAwesomeIcon icon={faPaperPlane} />
            </span>
          ) : (
            <FontAwesomeIcon icon={faPaperPlane} />
          )}
        </button>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-0 z-10">
            <Picker data={data} onEmojiSelect={handleEmojiSelect} />
          </div>
        )}
         

  
{editMessageId && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
      {/* Close Button */}
      <span
        onClick={() => setEditMessageId(null)}
        className="absolute top-2 right-2 cursor-pointer text-red-500"
      >
        <FontAwesomeIcon icon={faTimes} />
      </span>
      
      {/* Modal Title */}
      <h2 className="text-xl font-semibold mb-4">Edit Message</h2>
      
      {/* Message Content Textarea */}
      <textarea
        value={editMessageContent}
        onChange={(e) => setEditMessageContent(e.target.value)}
        className="border rounded-lg p-2 w-full resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-600"
        placeholder="Edit your message..."
      ></textarea>
      
      {/* Media Uploads */}
      <div className="mt-4 space-y-4">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Edit Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleEditImageChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                   file:rounded-md file:border-0 file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {editImage && (
            <div className="relative mt-2">
              <img
                src={URL.createObjectURL(editImage)}
                alt="Preview"
                className="w-24 h-24 rounded-md object-cover"
              />
              <button
                type="button"
                className="absolute top-0 right-0 text-red-500 bg-white rounded-full p-1"
                onClick={() => setEditImage(null)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          )}
        </div>
        
        {/* Video Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Edit Video</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleEditVideoChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                   file:rounded-md file:border-0 file:text-sm file:font-semibold
                   file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
          {editVideo && (
            <div className="relative mt-2">
              <video
                src={URL.createObjectURL(editVideo)}
                className="w-24 h-24 rounded-md object-cover"
                controls
              />
              <button
                type="button"
                className="absolute top-0 right-0 text-red-500 bg-white rounded-full p-1"
                onClick={() => setEditVideo(null)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={() => handleEditMessage(editMessageId, editMessageContent, editImage, editVideo)}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          Save
        </button>
        <button
          onClick={() => setEditMessageId(null)}
          className="bg-gray-300 text-black py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


      {/* Delete Confirmation Modal */}
      {isDeleteConfirmationVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <span onClick={() => setIsDeleteConfirmationVisible(false)} className="absolute top-2 right-2 cursor-pointer text-red-500">
              <FontAwesomeIcon icon={faTimes} />
            </span>
            <h2 className="text-xl font-semibold mb-4">Are you sure you want to delete this message?</h2>
            <div className="flex justify-between">
              <button onClick={() => handleDeleteMessage(deleteMessageId)} className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600">
                Yes
              </button>
              <button onClick={() => setIsDeleteConfirmationVisible(false)} className="bg-gray-300 text-black py-2 px-4 rounded-lg hover:bg-gray-400">
                No
              </button>
            </div>
          </div>
        </div>
      )}
    
      {connectionError && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">
          {connectionError}
        </div>
      )}
        {errorMessage && (
        <div className="bg-red-200 text-red-700 p-2 rounded-md mb-4">
          {errorMessage}
          <button onClick={() => setErrorMessage('')} className="ml-2 text-red-600">X</button>
        </div>
      )}
      </div>
    </div>
  );
};

export default ChatConversation;






