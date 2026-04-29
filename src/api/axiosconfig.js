import axios from 'axios';

// This creates a custom Axios instance
const apiClient = axios.create({
    // Set your backend base URL here ONCE
    baseURL: 'https://olive-bars-repeat.loca.lt/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiClient;