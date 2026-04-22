// src/services/preferenceService.ts
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

export interface UserPreferences {
  categorie_aimee: string | null;
  categorie_detestee: string | null;
  prix_max: number;
}

export const getPreferences = async (): Promise<{ preferences: UserPreferences; allergies: string[] }> => {
  try {
    const response = await axios.get(`${API_URL}/preferences`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error("Erreur récupération préférences:", error);
    return { preferences: { categorie_aimee: null, categorie_detestee: null, prix_max: 100 }, allergies: [] };
  }
};

export const updatePreferences = async (preferences: UserPreferences): Promise<void> => {
  try {
    await axios.put(`${API_URL}/preferences`, preferences, {
      headers: getAuthHeader()
    });
  } catch (error) {
    console.error("Erreur mise à jour préférences:", error);
    throw error;
  }
};

export const addAllergie = async (ingredient: string): Promise<void> => {
  try {
    await axios.post(`${API_URL}/preferences/allergies`, { ingredient }, {
      headers: getAuthHeader()
    });
  } catch (error) {
    console.error("Erreur ajout allergie:", error);
    throw error;
  }
};

export const removeAllergie = async (ingredient: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/preferences/allergies/${ingredient}`, {
      headers: getAuthHeader()
    });
  } catch (error) {
    console.error("Erreur suppression allergie:", error);
    throw error;
  }
};