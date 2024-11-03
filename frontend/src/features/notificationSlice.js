import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('token'); 
    if (!token) {
      return rejectWithValue('No token found');  // Return error if token is not found
    }

    try {
      const response = await axios.get('http://localhost:8000/api/notifications/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data; 
    } catch (error) {
      return rejectWithValue(error.response.data);  // Handle error
    }
  }
);



export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {  // Accept notificationId as a parameter
    const token = localStorage.getItem('token'); 
    if (!token) {
      return rejectWithValue('No token found');  // Return error if token is not found
    }

    try {
      const response = await axios.patch(`http://localhost:8000/api/notifications/${notificationId}/`, { 
        is_read: true  // Set is_read to true in the request body
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;  // Return the updated notification data
    } catch (error) {
      return rejectWithValue(error.response.data);  // Handle error
    }
  }
);



const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Add any fetched notifications to the array
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const updatedNotification = action.payload; // This should be the entire updated notification
        const existingNotification = state.notifications.find(notification => notification.id === updatedNotification.id);
        
        if (existingNotification) {
          existingNotification.is_read = updatedNotification.is_read; // Update local state to mark as read
        }
      });
      
  },
});

export default notificationsSlice.reducer;
