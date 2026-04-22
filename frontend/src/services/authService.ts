// src/services/authService.ts
import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // ou votre URL backend

export const login = async (credentials: { email: string; password: string }) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: credentials.email,
      password: credentials.password
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};