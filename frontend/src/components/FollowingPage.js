


import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFollowingandfollowers, resetFollowers } from '../features/followerSlice';
import { Link } from 'react-router-dom';

const FollowingPage = () => {
  const dispatch = useDispatch();
  const { following, loading, error } = useSelector((state) => state.followers);
  const BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    console.log('Fetching data...');
    dispatch(fetchFollowingandfollowers());

    return () => {
      // Reset followers state when the component unmounts
      dispatch(resetFollowers());
    };
  }, [dispatch]);

  if (loading) return <div className="text-center text-gray-500 py-4">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-4">Error: {error}</div>;

  return (
    <div className="space-y-6 p-4">
      {following.length === 0 ? (
        <p className="text-gray-600 text-center">No users followed</p>
      ) : (
        <ul className="divide-y divide-gray-300">
          {following.map((follow) => (
            <li key={follow.followed_user.id} className="flex items-center justify-between py-4 px-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 hover:bg-gray-50">
              <Link
                to={`/userprofile/${follow.followed_user.id}`}
                className="flex items-center space-x-4 w-full"
              >
                {follow.followed_user.profile_picture ? (
                  <img
                    src={`${BASE_URL}${follow.followed_user.profile_picture}`}
                    className="w-12 h-12 object-cover rounded-full border border-gray-200 shadow-sm"
                    alt={`${follow.followed_user.first_name || 'No Name'}'s Profile Picture`}
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold text-lg">N/A</div>
                )}
                <h3 className="text-lg font-semibold text-gray-800 truncate">
                  {follow.followed_user.first_name || 'No First Name'}
                </h3>
              </Link>
              <button
                className="text-white bg-blue-500 hover:bg-blue-600 font-medium py-1 px-3 rounded-full text-sm transition-colors duration-150"
                onClick={() => alert(`Messaging ${follow.followed_user.first_name}`)}
              >
                Message
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FollowingPage;

