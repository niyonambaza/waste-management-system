import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api', // Backend port yawe
    withCredentials: true // Kuri cookies/session
});

export default API;