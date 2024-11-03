



import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createComment } from '../features/postSlice';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const CommentForm = ({ postId, parentId = null, onSubmit }) => {
  const [content, setContent] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // State for error message
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate the comment content
    if (!content.trim()) {
      setErrorMessage('Please enter a comment.'); // Set error message
      return;
    }

    setIsSubmitting(true);
    dispatch(createComment({ content, postId, parent: parentId }))
      .unwrap()
      .then((newComment) => {
        setContent('');
        setErrorMessage(''); // Clear the error message on successful submission
        if (onSubmit) {
          onSubmit(newComment); // Trigger parent callback to refresh comments
        }
      })
      .catch((error) => {
        console.error('Error during createComment:', error);
        setErrorMessage('Failed to submit comment.'); // Set error message on error
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleEmojiSelect = (emoji) => {
    setContent((prev) => prev + emoji.native);
  };

  return (
    <div className="max-w-lg mx-auto mt-4">
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-white rounded-lg border border-gray-300 shadow-sm flex items-start relative"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setErrorMessage(''); // Clear error message on input change
          }}
          placeholder={parentId ? 'Reply to comment...' : 'Write a comment...'}
          
          className="w-full h-16 p-2 text-sm text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        />
        <button
          type="button"
          onClick={() => setShowPicker((prev) => !prev)}
          className="text-gray-600 hover:text-blue-500 transition duration-200 focus:outline-none"
        >
          {/* Emoji icon can be added here if desired */}
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white rounded-md px-4 py-1 ml-2 hover:bg-blue-600 transition duration-200 text-sm"
          disabled={isSubmitting}
        >
          {parentId ? 'Reply' : 'Comment'}
        </button>
      </form>

      {errorMessage && (
        <p className="text-red-500 text-center mt-2">{errorMessage}</p> // Error message display
      )}

      {showPicker && (
        <div className="absolute z-10 mt-2">
          <Picker data={data} onEmojiSelect={handleEmojiSelect} />
        </div>
      )}
    </div>
  );
};

export default CommentForm;
