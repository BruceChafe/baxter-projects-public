import axios, { AxiosInstance } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:3001/api' : 'https://baxterdms.vercel.app/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000
});

export default axiosInstance;
