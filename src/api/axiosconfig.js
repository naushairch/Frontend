import axios from 'axios';

// This creates a custom Axios instance
const apiClient = axios.create({
    // Set your backend base URL here ONCE
    baseURL: 'http://192.168.1.13:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiClient;