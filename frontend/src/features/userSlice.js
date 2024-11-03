


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
// import Cookies from 'js-cookie';

// const csrfToken = Cookies.get('csrftoken');

// Initial state
const initialState = {
  users: [],
  filteredUsers: [],
  loading: false,
  error: null,
  filter: 'All Users',
};

// Thunks
export const fetchUserDetailsAdmin = createAsyncThunk(
  'user/fetchUserDetailsAdmin',
  async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found in localStorage');
    }
    const response = await axios.get('http://localhost:8000/api/user-view/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
);

export const blockUser = createAsyncThunk(
  'user/blockUser',
  async (userId, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return rejectWithValue('No token found in localStorage');
    }

    try {
      const response = await axios.post(`http://localhost:8000/api/users/${userId}/block/`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return userId;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login'; // Redirect to login page
        return rejectWithValue('Your account is blocked or suspended');
      }
      return rejectWithValue(error.message);
    }
  }
);

export const unblockUser = createAsyncThunk(
  'user/unblockUser',
  async (userId, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return rejectWithValue('No token found in localStorage');
    }

    try {
      const response = await axios.post(`http://localhost:8000/api/users/${userId}/unblock/`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return userId;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login'; // Redirect to login page
        return rejectWithValue('Your account is blocked or suspended');
      }
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setFilter(state, action) {
      state.filter = action.payload;
      state.filteredUsers = state.users.filter(user =>
        action.payload === 'All Users' ? true :
        action.payload === 'Active Users' ? user.is_active && !user.is_suspended :
        action.payload === 'Suspended Users' ? user.is_suspended : false
      );
    },
    updateUserList(state, action) {
      state.users = action.payload; // Update the user list
      state.filteredUsers = state.users.filter(user =>
        state.filter === 'All Users' ? true :
        state.filter === 'Active Users' ? user.is_active && !user.is_suspended :
        state.filter === 'Suspended Users' ? user.is_suspended : false
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDetailsAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDetailsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.filteredUsers = action.payload.filter(user =>
          state.filter === 'All Users' ? true :
          state.filter === 'Active Users' ? user.is_active && !user.is_suspended :
          state.filter === 'Suspended Users' ? user.is_suspended : false
        );
      })
      .addCase(fetchUserDetailsAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(blockUser.fulfilled, (state, action) => {
        const userId = action.payload;
        state.users = state.users.map(user =>
          user.id === userId ? { ...user, is_suspended: true, is_active: false } : user
        );
        state.filteredUsers = state.users.filter(user =>
          state.filter === 'All Users' ? true :
          state.filter === 'Active Users' ? user.is_active && !user.is_suspended :
          state.filter === 'Suspended Users' ? user.is_suspended : false
        );
      })
      .addCase(unblockUser.fulfilled, (state, action) => {
        const userId = action.payload;
        state.users = state.users.map(user =>
          user.id === userId ? { ...user, is_suspended: false, is_active: true } : user
        );
        state.filteredUsers = state.users.filter(user =>
          state.filter === 'All Users' ? true :
          state.filter === 'Active Users' ? user.is_active && !user.is_suspended :
          state.filter === 'Suspended Users' ? user.is_suspended : false
        );
      });
  },
});

export const { setFilter, updateUserList } = userSlice.actions;
export default userSlice.reducer;
