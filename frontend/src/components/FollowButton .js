


import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { followUser, unfollowUser, fetchFollowing, setIsFollowing, fetchFollowingandfollowers } from '../features/followerSlice';
import { FaUser, FaUserCheck } from 'react-icons/fa';

const FollowButton = ({ userId }) => {
  const dispatch = useDispatch();
  const isFollowing = useSelector((state) => state.followers.isFollowing[userId]);
  const [loading, setLoading] = useState(true);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const storedIsFollowing = localStorage.getItem(`isFollowing_${userId}`);
    if (storedIsFollowing !== null) {
      dispatch(setIsFollowing({ userId, isFollowing: storedIsFollowing === 'true' }));
      setLoading(false);
    } else {
      const loadFollowingStatus = async () => {
        const resultAction = await dispatch(fetchFollowing(userId));
        if (fetchFollowing.fulfilled.match(resultAction)) {
          const followingStatus = resultAction.payload.isFollowing;
          dispatch(setIsFollowing({ userId, isFollowing: followingStatus }));
          localStorage.setItem(`isFollowing_${userId}`, followingStatus);
        }
        setLoading(false);
      };
      loadFollowingStatus();
    }
  }, [dispatch, userId]);

  const handleClick = async () => {
    try {
      if (isFollowing) {
        dispatch(setIsFollowing({ userId, isFollowing: false }));
        localStorage.setItem(`isFollowing_${userId}`, 'false');
        await dispatch(unfollowUser(userId));
      } else {
        dispatch(setIsFollowing({ userId, isFollowing: true }));
        localStorage.setItem(`isFollowing_${userId}`, 'true');
        await dispatch(followUser(userId));
      }
      // Fetch updated following and followers after the action
      dispatch(fetchFollowingandfollowers());
    } catch (error) {
      // Handle error: revert state and notify user
      dispatch(setIsFollowing({ userId, isFollowing: !isFollowing }));
      localStorage.setItem(`isFollowing_${userId}`, String(!isFollowing));
      alert('An error occurred while updating follow status.'); // Show an error message to the user
    }
  };

  if (loading) {
    return <button className="py-2 px-4 bg-gray-200 rounded-full">Loading...</button>;
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`py-1.5 px-4 flex items-center space-x-2 rounded-full transition-colors duration-200 shadow-md text-sm font-medium
      ${isFollowing ? 'bg-gray-200 text-gray-700 hover:bg-red-500 hover:text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
    >
      {isFollowing ? (
        <>
          <FaUserCheck className="text-lg" />
          <span>{hover ? 'Unfollow' : 'Following'}</span>
        </>
      ) : (
        <>
          <FaUser className="text-lg" />
          <span>{hover ? 'Follow' : 'Follow'}</span>
        </>
      )}
    </button>
  );
};

export default FollowButton;
