// src/services/produitService.ts
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

// Récupérer tous les produits (avec leur stock)
export const getProduits = async () => {
  const token = localStorage.getItem('token');
  
  console.log("🔑 Token présent:", !!token);
  
  if (!token) {
    console.error("❌ Pas de token");
    return [];
  }
  
  try {
    console.log("📡 Appel API: /api/produits");
    const response = await axios.get(`${API_URL}/produits`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("✅ Réponse reçue, status:", response.status);
    console.log("📦 Données brutes:", response.data);
    console.log(`📦 ${response.data?.length || 0} produits`);
    
    // Vérifier que chaque produit a un stock
    const produitsAvecStock = response.data.map((p: any) => ({
      ...p,
      stock: p.stock || 0
    }));
    
    return produitsAvecStock;
  } catch (error: any) {
    console.error("❌ Erreur:", error.response?.data || error.message);
    return [];
  }
};

// Récupérer un produit par ID (avec son stock)
export const getProduitById = async (id: number) => {
  try {
    const response = await axios.get(`${API_URL}/produits/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error: any) {
    console.error("Erreur récupération produit:", error);
    toast.error(error.response?.data?.message || "Erreur lors du chargement");
    throw error;
  }
};

// Créer un produit (avec stock initial)
export const createProduit = async (produit: any) => {
  try {
    const response = await axios.post(`${API_URL}/produits`, produit, {
      headers: getAuthHeader()
    });
    toast.success("✅ Produit créé avec succès !");
    return response.data;
  } catch (error: any) {
    console.error('Erreur création produit:', error);
    toast.error(error.response?.data?.message || "❌ Erreur lors de la création");
    throw error;
  }
};

// Mettre à jour un produit (et son stock)
export const updateProduit = async (id: number, produit: any) => {
  try {
    console.log("📡 Envoi modification produit:", { id, produit });
    const response = await axios.put(`${API_URL}/produits/${id}`, produit, {
      headers: getAuthHeader()
    });
    console.log("✅ Réponse modification:", response.data);
    toast.success("✅ Produit modifié avec succès !");
    return response.data;
  } catch (error: any) {
    console.error('Erreur modification produit:', error);
    console.error('Détails:', error.response?.data);
    toast.error(error.response?.data?.message || "❌ Erreur lors de la modification");
    throw error;
  }
};

// Supprimer un produit
export const deleteProduit = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/produits/${id}`, {
      headers: getAuthHeader()
    });
    toast.success("🗑️ Produit supprimé avec succès !");
    return response.data;
  } catch (error: any) {
    console.error('Erreur suppression produit:', error);
    toast.error(error.response?.data?.message || "❌ Erreur lors de la suppression");
    throw error;
  }
};