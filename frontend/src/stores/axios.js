import axios from 'axios'
import { API_BASE_URL } from '../api';

export const axiosInstance = axios.create({
    baseURL : API_BASE_URL || "http://localhost:5000/api",
    withCredentials: true,
});