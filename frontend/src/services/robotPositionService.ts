// src/services/robotPositionService.ts
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

export interface RobotPosition {
  id: number;
  nom: string;
  statut: string;
  batterie: number;
  latitude: number;
  longitude: number;
  localisation: string;
}

// Récupérer les positions des robots
export const getRobotPositions = async (): Promise<RobotPosition[]> => {
  try {
    const response = await axios.get(`${API_URL}/robots/positions`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error("Erreur récupération positions robots:", error);
    return [];
  }
};

// Mettre à jour la position d'un robot (simulé)
export const updateRobotPosition = async (robotId: number, latitude: number, longitude: number) => {
  try {
    const response = await axios.put(`${API_URL}/robots/${robotId}/position`, 
      { latitude, longitude },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error("Erreur mise à jour position robot:", error);
    throw error;
  }
};