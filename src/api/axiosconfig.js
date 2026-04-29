import axios from 'axios';

// This creates a custom Axios instance
const apiClient = axios.create({
    // Set your backend base URL here ONCE
    baseURL: 'https://534ba16d2690e9.lhr.life/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiClient;