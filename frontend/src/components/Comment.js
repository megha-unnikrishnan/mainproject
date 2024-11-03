






// Comment.js
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchComments, updateTotalComments } from '../features/postSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faEllipsisV, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import CommentForm from './CommentForm';
import axios from 'axios';


const BASE_URL = 'http://localhost:8000/posts';

const Comment = ({ comment, postId, replies, onReplySubmit }) => {
  const dispatch = useDispatch();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedContent, setUpdatedContent] = useState(comment.content);
  const [showOptions, setShowOptions] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [likes, setLikes] = useState(comment.likes || 0); // Assuming likes count is part of comment

  // Check if user is logged in
  const isLoggedIn = () => !!localStorage.getItem('token');

  const handleAddReply = () => {
    dispatch(fetchComments(postId));
    dispatch(updateTotalComments({ postId }));
    setShowReplyForm(false);
    setShowReplies(true);
  };

  const handleDeleteComment = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${BASE_URL}/comments/${comment.id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      dispatch(fetchComments(postId));
      dispatch(updateTotalComments({ postId, decrement: true }));
      setSuccessMessage('Comment deleted successfully!');
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || 'An unexpected error occurred.');
    }
  };

  const handleEditComment = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${BASE_URL}/comments/${comment.id}/`, { content: updatedContent }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setIsEditing(false);
      dispatch(fetchComments(postId));
      setSuccessMessage('Comment updated successfully!');
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || 'An unexpected error occurred.');
    }
  };

  const handleLike = () => {
    // Implement like functionality (e.g., send request to backend)
    setLikes(likes + 1);
  };

  // Hide success and error messages after 3 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  return (
    <div className="mb-4 bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-lg transition duration-300">
      {/* Success Popup Message */}
      {successMessage && (
        <div className="fixed top-16 right-4 bg-green-100 text-green-700 p-3 rounded shadow-lg z-50">
          {successMessage}
        </div>
      )}

      {/* Error Popup Message */}
      {errorMessage && (
        <div className="fixed top-16 right-4 bg-red-100 text-red-700 p-3 rounded shadow-lg z-50">
          {errorMessage}
        </div>
      )}

      <div className="flex items-start space-x-3">
        {/* Profile Picture */}
        {/* <img
          src={comment.user.profile_picture || 'https://via.placeholder.com/40'}
          alt={`${comment.user.username}'s profile`}
          className="w-10 h-10 rounded-full object-cover"
        /> */}
        <div className="flex-1">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-800">{comment.user || 'Anonymous'}</span>
            {/* <span className="text-sm text-gray-500">{moment(comment.created_at).fromNow()}</span> */}
          </div>

          {isEditing ? (
            <div className="mt-2">
              <textarea
                className="border border-gray-300 rounded-lg w-full p-2 mt-2 focus:ring focus:ring-blue-300"
                value={updatedContent}
                onChange={(e) => setUpdatedContent(e.target.value)}
              />
              <div className="flex mt-2">
                <button onClick={handleEditComment} className="text-blue-500 hover:underline">Save</button>
                <button onClick={() => setIsEditing(false)} className="text-red-500 hover:underline ml-4">Cancel</button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 mt-2">{comment.content}</p>
          )}

          <div className="flex items-center mt-2 space-x-4">
            {/* Like Button */}
           
            {/* Reply Button */}
            <button
              className="text-blue-500 text-sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              Reply
            </button>
            {/* Show Replies */}
            {replies.length > 0 && (
              <button
                className="text-gray-500 text-sm"
                onClick={() => setShowReplies(!showReplies)}
              >
                {showReplies ? 'Hide Replies' : `Show ${replies.length} Replies`}
              </button>
            )}
          </div>

          {/* Replies Section */}
          {showReplies && (
            <div className="mt-2 pl-4 border-l-2 border-gray-300">
              {replies.map((reply) => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  replies={reply.replies || []}
                  onReplySubmit={onReplySubmit}
                />
              ))}
            </div>
          )}

          {/* Reply Form */}
          {showReplyForm && (
            <CommentForm postId={postId} parentId={comment.id} onSubmit={onReplySubmit} />
          )}
        </div>

        {/* Options for Editing/Deleting */}
        {isLoggedIn() && (
          <div className="relative ml-auto">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            {showOptions && (
              <div className="absolute right-0 mt-1 bg-white border rounded shadow-md z-10">
                <div
                  className="flex items-center px-4 py-2 hover:bg-blue-100 cursor-pointer"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-2" />
                  <span className="text-blue-600">Edit</span>
                </div>
                <div
                  className="flex items-center px-4 py-2 hover:bg-red-100 cursor-pointer"
                  onClick={handleDeleteComment}
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-2" />
                  <span className="text-red-600">Delete</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;

