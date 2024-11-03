
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { fetchFollowing } from './followerSlice';


export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken'); // Get refresh token from local storage

  if (!refreshToken) {
      throw new Error("No refresh token available");
  }

  try {
      const response = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh: refreshToken,
      });

      return response.data; // This will return { access, refresh }
  } catch (error) {
      console.error("Failed to refresh token", error);
      throw error; // Re-throw to handle logout if needed
  }
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ userData, isAdmin }, { rejectWithValue }) => {
    const url = isAdmin ? 'http://localhost:8000/api/admin/token/' : 'http://localhost:8000/api/token/';
    
    try {
      const response = await axios.post(url, userData);

      // Check if both access and refresh tokens are returned
      const { access, refresh, userId, username, email } = response.data;

      // Optionally store tokens in local storage (or cookies) for persistence
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);

      return { 
        access, 
        refresh, // Include refresh token for further use
        userId, 
        username, 
        email, 
        isAdmin 
      };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'An unknown error occurred.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:8000/api/register/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { 
        ...response.data, 
        isAdmin: false 
      };
    } catch (err) {
      const errorMessage = err.response?.data || { detail: 'An unknown error occurred.' };
      return rejectWithValue(errorMessage);
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:8000/api/reset-password-request/', { email });
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data || { detail: 'An unknown error occurred.' };
      return rejectWithValue(errorMessage);
    }
  }
);

export const confirmPasswordReset = createAsyncThunk(
  'auth/confirmPasswordReset',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:8000/api/reset-password/', {
        token,
        password
      });
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data || { detail: 'An unknown error occurred.' };
      return rejectWithValue(errorMessage);
    }
  }
);



export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async ({ idToken }, { rejectWithValue }) => {
    if (!idToken) {
      return rejectWithValue('ID token is missing');
    }
    console.log('googleLogin action dispatched with idToken:', idToken);

    try {
      const response = await axios.post('http://localhost:8000/api/auth/google/', { idToken });
      
      // Update the token in local storage
      localStorage.setItem('token', response.data.token);

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'An unknown error occurred.';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for Google login
// export const googleLogin = createAsyncThunk(
//   'auth/googleLogin',
//   async (tokenId, { rejectWithValue }) => {
//       try {
//           const response = await axios.post('http://localhost:8000/api/auth/google/', {
//               access_token: tokenId,
//           });
//           return response.data;
//       } catch (error) {
//           return rejectWithValue(error.response.data);
//       }
//   }
// );






export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (formData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put('http://localhost:8000/api/profile/', formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error.response);
      return Promise.reject(error.response.data);
    }
  }
);






export const updatePictures = createAsyncThunk(
  'user/updatePictures',
  async (formData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('http://localhost:8000/api/update-pictures/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error.response);
      return Promise.reject(error.response.data);
    }
  }
);




export const searchUsers = createAsyncThunk(
  'user/searchUsers',
  async (query, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return rejectWithValue('No token found');
    }

    try {
      const response = await axios.get('http://localhost:8000/api/search/', {
        params: { query }, // Ensure that the backend expects a 'query' parameter
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to search users';
      return rejectWithValue(errorMessage);
    }
  }
);


export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return rejectWithValue('No token found');
    }

    try {
      const response = await axios.post(
        'http://localhost:8000/api/change-password/',
        {
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: newPassword,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue('Invalid or expired token');
      } else {
        return rejectWithValue(error.response?.data || 'Failed to update password');
      }
    }
  }
);



export const fetchUserDetails = createAsyncThunk(
  'user/fetchUserDetails',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('accessToken'); // Use accessToken here
    if (!token) {
      return rejectWithValue('No token found');
    }

    try {
      const response = await axios.get('http://localhost:8000/api/profile/', {
        headers: {
          Authorization: `Bearer ${token}`, // Correct Bearer token format
        },
      });
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'An unknown error occurred.';
      return rejectWithValue(errorMessage);
    }
  }
);









export const fetchAllUsers = createAsyncThunk('user/fetchAllUsers', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }
  const response = await axios.get('http://localhost:8000/api/user-view-follow/', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
});




export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (userId) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://localhost:8000/api/profile/${userId}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
);


export const fetchUserPostProfile = createAsyncThunk(
  'user/fetchUserPostProfile',
  async (userId) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://localhost:8000/api/profile/${userId}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
);





const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAdmin: false,
    loading: false,
    error: null,
    message: null, 
    users: [],
    searchResults: [],
    allUsers: [],
    userProfile: null, 
    profile:null,
    details: {},
    
  },
  reducers: {
    updateSearchResults: (state, action) => {
      state.searchResults = action.payload || []; // Update searchResults or set to an empty array
    },
    
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAdmin = false;
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
    },
    clearMessages: (state) => {
      state.message = '';
      state.error = '';
    },
  },
  extraReducers: (builder) => {
    
    builder
      // Registration cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload.username;
      })
      .addCase(registerUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload.detail || '';
      })
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
   
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        console.log('Response data:', payload);
        state.loading = false;
        state.user = payload; // Ensure payload includes username and email
        state.token = payload.access;
        state.isAdmin = payload.isAdmin;
        state.email = payload.email || ''; // Set email to an empty string if it's undefined
        state.username = payload.username; // Store username in Redux state
        localStorage.setItem('token', payload.access);
        localStorage.setItem('isAdmin', payload.isAdmin);
        localStorage.setItem('email', payload.email || ''); // Store email in local storage
        localStorage.setItem('username', payload.username); // Store username in local storage

        
      })
      .addCase(loginUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || '';
      })
      // Google login cases
      // .addCase(googleLogin.pending, (state) => {
      //   state.loading = true;
      // })
      // .addCase(googleLogin.fulfilled, (state, { payload }) => {
      //   state.loading = false;
      //   state.user = payload.username;
      //   state.token = payload.access;
      //   state.isAdmin = payload.isAdmin;
      //   localStorage.setItem('token', payload.access);
      //   localStorage.setItem('isAdmin', payload.isAdmin);
      // })
      // .addCase(googleLogin.rejected, (state, { payload }) => {
      //   state.loading = false;
      //   state.error = payload || '';
      // })
      .addCase(googleLogin.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = {
          username: action.payload.username,
          userId: action.payload.userId,
          isAdmin: action.payload.isAdmin,
        };
        state.token = action.payload.access;
        localStorage.setItem('token', action.payload.access);
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Password reset request cases
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = true;
      })
      .addCase(requestPasswordReset.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.message = payload.message || 'Password reset link sent to your email.';
      })
      .addCase(requestPasswordReset.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload.detail || '';
      })
      // Password reset confirmation cases
      .addCase(confirmPasswordReset.pending, (state) => {
        state.loading = true;
      })
      .addCase(confirmPasswordReset.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.message = payload.message || 'Password has been reset successfully.';
      })
      .addCase(confirmPasswordReset.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload.detail || '';
      })
      // Fetch profile cases
      .addCase(fetchUserDetails .pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserDetails .fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
      })
      .addCase(fetchUserDetails .rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || '';
      })
      // Update profile cases
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
      })
      .addCase(updateProfile.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || '';
      })

      .addCase(updatePictures.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updatePictures.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload; // Update user with new pictures
      })
      .addCase(updatePictures.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || 'Failed to update pictures';
      })
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.message = 'Password updated successfully!';
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
     
      .addCase(fetchAllUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.allUsers = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchResults = action.payload;
        state.filteredUsers = state.users.filter((user) =>
          user.username.toLowerCase().includes(action.payload.username.toLowerCase()) ||
        user.first_name.toLowerCase().includes(action.payload.first_name.toLowerCase()) ||
        user.email.toLowerCase().includes(action.payload.email.toLowerCase())
        );
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })



      .addCase(fetchUserPostProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserPostProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.details = action.payload; // Store the user details in the state
      })
      .addCase(fetchUserPostProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { logout, clearMessages ,updateSearchResults} = authSlice.actions;
export default authSlice.reducer;
