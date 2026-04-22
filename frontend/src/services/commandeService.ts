// src/services/commandeService.ts
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

// Récupérer toutes les commandes
export const getCommandes = async () => {
  try {
    const response = await axios.get(`${API_URL}/commandes`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error: any) {
    console.error('Erreur récupération commandes:', error);
    if (error.response?.status === 401) {
      toast.error("Session expirée, veuillez vous reconnecter");
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return [];
  }
};

// Créer une commande
export const createCommande = async (data: any) => {
  try {
    const response = await axios.post(`${API_URL}/commandes`, data, {
      headers: getAuthHeader()
    });
    toast.success("✅ Commande créée avec succès !");
    return response.data;
  } catch (error: any) {
    console.error('Erreur création commande:', error);
    toast.error(error.response?.data?.message || "❌ Erreur lors de la création");
    throw error;
  }
};

// Mettre à jour une commande
export const updateCommande = async (id: number, data: any) => {
  try {
    const response = await axios.put(`${API_URL}/commandes/${id}`, data, {
      headers: getAuthHeader()
    });
    toast.success("✅ Commande mise à jour !");
    return response.data;
  } catch (error: any) {
    console.error('Erreur mise à jour commande:', error);
    toast.error(error.response?.data?.message || "❌ Erreur lors de la mise à jour");
    throw error;
  }
};

// Supprimer une commande
export const deleteCommande = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/commandes/${id}`, {
      headers: getAuthHeader()
    });
    toast.success("🗑️ Commande supprimée !");
    return response.data;
  } catch (error: any) {
    console.error('Erreur suppression commande:', error);
    toast.error(error.response?.data?.message || "❌ Erreur lors de la suppression");
    throw error;
  }
};

// Récupérer les lignes d'une commande
export const getLignesCommande = async (commandeId: number) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_URL}/commandes/${commandeId}/lignes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Erreur récupération lignes commande:", error);
    return [];
  }
};