import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000', // Django backend URL
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const registerUser = (formData) => async (dispatch) => {
  try {
    const response = await axios.post('/api/register/', formData);
    dispatch({ type: 'REGISTER_SUCCESS', payload: response.data });
  } catch (error) {
    // Forward the error response to the component
    throw error;
  }
};

export default axiosInstance;
