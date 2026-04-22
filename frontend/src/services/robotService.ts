// src/services/robotService.ts
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

// Fonction pour récupérer le token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error("❌ Token manquant");
    return {};
  }
  return { Authorization: `Bearer ${token}` };
};

// Récupérer tous les robots
export const getRobots = async () => {
  try {
    const response = await axios.get(`${API_URL}/robots`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error: any) {
    console.error("Erreur récupération robots:", error);
    if (error.response?.status === 401) {
      toast.error("Session expirée, veuillez vous reconnecter");
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return [];
  }
};

// Récupérer un robot par ID
export const getRobotById = async (id: number) => {
  try {
    const response = await axios.get(`${API_URL}/robots/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error: any) {
    console.error("Erreur récupération robot:", error);
    throw error;
  }
};

// Créer un robot
export const createRobot = async (robot: any) => {
  try {
    const response = await axios.post(`${API_URL}/robots`, robot, {
      headers: getAuthHeader()
    });
    toast.success("✅ Robot créé avec succès !");
    return response.data;
  } catch (error: any) {
    console.error('Erreur création robot:', error);
    toast.error(error.response?.data?.message || "❌ Erreur lors de la création");
    throw error;
  }
};

// Mettre à jour un robot
export const updateRobot = async (id: number, robot: any) => {
  try {
    const response = await axios.put(`${API_URL}/robots/${id}`, robot, {
      headers: getAuthHeader()
    });
    toast.success("✅ Robot modifié avec succès !");
    return response.data;
  } catch (error: any) {
    console.error('Erreur modification robot:', error);
    toast.error(error.response?.data?.message || "❌ Erreur lors de la modification");
    throw error;
  }
};

// Supprimer un robot
export const deleteRobot = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/robots/${id}`, {
      headers: getAuthHeader()
    });
    toast.success("🗑️ Robot supprimé avec succès !");
    return response.data;
  } catch (error: any) {
    console.error('Erreur suppression robot:', error);
    toast.error(error.response?.data?.message || "❌ Erreur lors de la suppression");
    throw error;
  }
};

// Assigner un robot à une commande
export const assignRobot = async (commandeId: number, robotId: number) => {
  try {
    const response = await axios.post(`${API_URL}/robots/assign`, 
      { commandeId, robotId },
      { headers: getAuthHeader() }
    );
    toast.success(`✅ Robot ${robotId} assigné à la commande ${commandeId}`);
    return response.data;
  } catch (error: any) {
    console.error('Erreur assignation robot:', error);
    toast.error(error.response?.data?.message || "❌ Erreur lors de l'assignation");
    throw error;
  }
};