




import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBookmark, deleteBookmark, fetchBookmarks } from '../features/postSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark as solidBookmark } from '@fortawesome/free-solid-svg-icons';
import { faBookmark as regularBookmark } from '@fortawesome/free-regular-svg-icons';

const BookmarkButton = ({ postId }) => {
  const dispatch = useDispatch();
  const { bookmarks = [], loading, error } = useSelector((state) => state.posts);

  // Fetch bookmarks when the component mounts
  useEffect(() => {
    dispatch(fetchBookmarks());
  }, [dispatch]);

  // Check if the current postId is bookmarked
  const isBookmarked = bookmarks.includes(postId);

  const handleBookmark = async () => {
    if (isBookmarked) {
      await dispatch(deleteBookmark(postId));
    } else {
      await dispatch(createBookmark(postId));
    }
  };

  return (
    <div>

      <button
        onClick={handleBookmark}
       
        className="flex items-center p-2 bg-white rounded-md shadow hover:bg-gray-100 transition-colors transform duration-200"
      >
        <FontAwesomeIcon
          icon={isBookmarked ? solidBookmark : regularBookmark}
          className={`h-5 w-5 transition-transform duration-300 ${isBookmarked ? 'text-blue-500 scale-110' : 'text-gray-500 scale-100'}`}
          style={{ animation: isBookmarked ? 'scale-up 0.3s forwards' : 'scale-down 0.3s forwards' }}
        />
      </button>

      <style jsx>{`
        @keyframes scale-up {
          from {
            transform: scale(1);
          }
          to {
            transform: scale(1.2);
          }
        }

        @keyframes scale-down {
          from {
            transform: scale(1.2);
          }
          to {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default BookmarkButton;


