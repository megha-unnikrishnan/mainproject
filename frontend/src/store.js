import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import userReducer from './features/userSlice';
import followerSlice from './features/followerSlice';
import notificationSlice from './features/notificationSlice';
import postSlice from './features/postSlice';
const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    followers:followerSlice,
    notifications:notificationSlice,
    posts:postSlice
    
  },
});

export default store;
