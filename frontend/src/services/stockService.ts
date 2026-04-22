// src/services/stockService.ts
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

// Récupérer tous les stocks
export const getStocks = async () => {
  try {
    const response = await axios.get(`${API_URL}/stock`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error: any) {
    console.error("Erreur récupération stocks:", error);
    return [];
  }
};

// Récupérer le stock d'un produit spécifique
export const getStockByProduitId = async (produitId: number) => {
  try {
    const response = await axios.get(`${API_URL}/stock/produit/${produitId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error: any) {
    console.error("Erreur récupération stock:", error);
    throw error;
  }
};

// Mettre à jour le stock (ajouter, retirer, définir)
export const updateStock = async (produitId: number, quantite: number, operation: 'add' | 'remove' | 'set') => {
  try {
    const response = await axios.put(`${API_URL}/stock/${produitId}`, 
      { quantite, operation },
      { headers: getAuthHeader() }
    );
    
    let message = "";
    if (operation === 'add') message = `📦 +${quantite} unités ajoutées au stock`;
    else if (operation === 'remove') message = `📦 -${quantite} unités retirées du stock`;
    else message = `📦 Stock défini à ${quantite} unités`;
    
    toast.success(message);
    return response.data;
  } catch (error: any) {
    console.error('Erreur mise à jour stock:', error);
    toast.error(error.response?.data?.message || "❌ Erreur lors de la mise à jour");
    throw error;
  }
};

// Configurer le seuil d'alerte
export const setStockAlerte = async (produitId: number, seuil: number) => {
  try {
    const response = await axios.post(`${API_URL}/stock/alerte`, 
      { produitId, seuil },
      { headers: getAuthHeader() }
    );
    toast.success(`🔔 Alerte stock configurée à ${seuil} unités`);
    return response.data;
  } catch (error: any) {
    console.error('Erreur configuration alerte:', error);
    toast.error(error.response?.data?.message || "❌ Erreur lors de la configuration");
    throw error;
  }
};