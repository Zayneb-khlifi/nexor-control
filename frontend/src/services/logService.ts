// src/services/logService.ts
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

export interface Log {
  id: number;
  type: "info" | "success" | "warning" | "error" | "robot" | "commande" | "system";
  message: string;
  details?: string;
  timestamp: string;
  user?: string;
  ip?: string;
  robotId?: number;
  commandeId?: number;
}

// Récupérer tous les logs
export const getLogs = async (): Promise<Log[]> => {
  try {
    const response = await axios.get(`${API_URL}/logs`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error: any) {
    console.error("Erreur récupération logs:", error.response?.data || error.message);
    return [];
  }
};