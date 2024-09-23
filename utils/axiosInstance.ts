import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost/frits_lib/app/backend/api', // Adjust according to your setup
  withCredentials: true, // Allow cookies
});

export default axiosInstance;
