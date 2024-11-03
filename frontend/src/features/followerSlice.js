// features/followers/followerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';



// Async thunk for following a user
export const followUser = createAsyncThunk(
  'followers/followUser',
  async (followedId, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:8000/api/follow/${followedId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.detail || 'Failed to follow user');
      }
      const followedUser = await response.json(); // Get the followedUser data from the response
      return followedUser; // Return the followedUser data
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
// Async thunk for unfollowing a user

export const unfollowUser = createAsyncThunk(
  'followers/unfollowUser',
  async (followedId, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:8000/api/unfollow/${followedId}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.detail || 'Failed to unfollow user');
      }
      return { followedId, unfollowed: true }; // Return the followedId and a flag indicating that the user was unfollowed
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const fetchFollowingandfollowers = createAsyncThunk(
  'follows/fetchFollowingandfollowers',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get('http://localhost:8000/api/userdetail/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { following, followers } = response.data; // Extract the relevant data

      console.log(following,followers);
      

      return { following, followers }; // Return an object with following and followers properties

    } catch (error) {
      console.error('Full error object:', error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.statusText ||
        'Error fetching data';

      // Check if the response is HTML
      if (error.response?.headers['content-type']?.includes('text/html')) {
        return rejectWithValue('Received an unexpected HTML response from the server.');
      }

      return rejectWithValue(errorMessage);
    }
  }
);



export const fetchFollowing = createAsyncThunk(
  'followers/fetchFollowing',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:8000/api/following/${userId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const isFollowing = await response.json();
      return { [userId]: isFollowing }; // Return an object with the user ID as the key and the isFollowing status as the value
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);




export const fetchFollowers = createAsyncThunk(
  'followers/fetchFollowing',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:8000/api/followers/${userId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const followers = await response.json(); // The response should return the list of followers
      return followers; // Return an object with the user ID as the key and the isFollowing status as the value
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


const followerSlice = createSlice({
  name: 'followers',
  initialState: {
        following: [], // Array of followed user objects
        followers: [], // Array of follower user objects
        status: 'idle',
        error: null,
        isFollowing:{},
        followingCount: 0, // Initialize followingCount to 0
        followersCount:0
      
      },
  reducers: {
    setIsFollowing(state, action) {
      const { userId, isFollowing } = action.payload;
      state.isFollowing[userId] = isFollowing;
    },
    resetFollowers(state) {
      state.following = []; // Reset following array
      state.loading = false; // Optionally reset loading state
      state.error = null; // Optionally reset error state
      state.followers = [];
      state.followingCount = 0; 
      state.followersCount = 0; 
   
    },
    
  },
  extraReducers: (builder) => {
    // Handle async actions
    builder
      .addCase(fetchFollowingandfollowers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFollowingandfollowers.fulfilled, (state, action) => {
        console.log('Fetched Data:', action.payload);
        state.loading = false;
        state.following = action.payload.following || []; // Ensure it's an array
        state.followers = action.payload.followers || []; // Ensure it's an array
        state.followingCount = action.payload.following.length;
        state.followingCount=action.payload.followers.length;
        
  // Update followingCount based on isFollowing object
 
      
      })
      .addCase(fetchFollowingandfollowers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.followers = [];
        state.following = [];
      });
  },
});
// Export actions and reducer
export const { setIsFollowing, resetFollowers } = followerSlice.actions;
export default followerSlice.reducer;
