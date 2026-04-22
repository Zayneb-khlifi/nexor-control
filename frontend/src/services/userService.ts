// src/services/userService.ts
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

// Récupérer tous les utilisateurs (ADMIN + SUPERADMIN)
export const getUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error: any) {
    console.error("Erreur récupération utilisateurs:", error);
    throw error;
  }
};

// Récupérer un utilisateur par ID
export const getUserById = async (id: number) => {
  try {
    const response = await axios.get(`${API_URL}/users/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error: any) {
    console.error("Erreur récupération utilisateur:", error);
    throw error;
  }
};

// Créer un utilisateur (ADMIN et SUPERADMIN)
export const createUser = async (userData: any) => {
  try {
    const response = await axios.post(`${API_URL}/users`, userData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error: any) {
    console.error("Erreur création utilisateur:", error);
    throw error;
  }
};

// Modifier un utilisateur (SUPERADMIN uniquement)
export const updateUser = async (id: number, userData: any) => {
  try {
    const response = await axios.put(`${API_URL}/users/${id}`, userData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error: any) {
    console.error("Erreur modification utilisateur:", error);
    throw error;
  }
};

// Supprimer un utilisateur (SUPERADMIN uniquement)
export const deleteUser = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/users/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error: any) {
    console.error("Erreur suppression utilisateur:", error);
    throw error;
  }
};