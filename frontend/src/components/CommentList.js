

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchComments } from '../features/postSlice';
import Comment from './Comment';
import CommentForm from './CommentForm';

const CommentList = ({ postId }) => {
  const dispatch = useDispatch();
  const comments = useSelector((state) => state.posts.comments[postId] || []);
  const loading = useSelector((state) => state.posts.loading);
  const totalComments = comments.length;

  useEffect(() => {
    dispatch(fetchComments(postId));
  }, [dispatch, postId]);

  const getReplies = (commentId) => {
    return comments.filter((comment) => comment.parent === commentId);
  };

  const handleNewComment = () => {
    dispatch(fetchComments(postId)); // Refetch comments after adding a new comment
    // No need to dispatch updateTotalComments separately
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow-lg" style={{backgroundColor:'rgb(239 239 239)'}}>
      <h3 className="text-xl font-semibold mb-4" >Comments ({totalComments})</h3>
      {/* <div className="space-y-4">
        {comments.length === 0 ? (
          <p>No comments yet. Be the first to comment!</p>
        ) : (
          comments
            .filter((comment) => comment.parent === null)
            .map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                postId={postId}
                replies={getReplies(comment.id)}
                onReplySubmit={handleNewComment} // Callback to refetch comments after reply
              />
            ))
        )}
      </div> */}
      <div className="space-y-4 max-w-md mx-auto">
  {comments.length === 0 ? (
    <div className="bg-gray-100 p-2 rounded-md shadow-sm">
      <p className="text-center text-gray-600 text-sm">No comments yet. Be the first to comment!</p>
    </div>
  ) : (
    comments
      .filter((comment) => comment.parent === null)
      .map((comment) => (
        <div key={comment.id} className="bg-white border border-gray-300 rounded-md shadow-sm p-3 hover:shadow-md transition-shadow duration-150">
          <Comment
            comment={comment}
            postId={postId}
            replies={getReplies(comment.id)}
            onReplySubmit={handleNewComment} // Callback to refetch comments after reply
          />
        </div>
      ))
  )}
</div>

      <CommentForm postId={postId} onSubmit={handleNewComment} />
      {/* Handle new comment */}
    </div>
  );
};

export default CommentList;
