// src/services/notificationService.ts
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "commande" | "robot" | "fidelite";
  read: boolean;
  created_at: string;
  link?: string;
}

// Récupérer toutes les notifications
export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await axios.get(`${API_URL}/notifications`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error("Erreur récupération notifications:", error);
    return [];
  }
};

// Marquer une notification comme lue
export const markAsRead = async (id: number): Promise<void> => {
  try {
    await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
      headers: getAuthHeader()
    });
  } catch (error) {
    console.error("Erreur marquage notification:", error);
  }
};

// Marquer toutes les notifications comme lues
export const markAllAsRead = async (): Promise<void> => {
  try {
    await axios.put(`${API_URL}/notifications/read-all`, {}, {
      headers: getAuthHeader()
    });
  } catch (error) {
    console.error("Erreur marquage toutes notifications:", error);
  }
};

// Supprimer une notification
export const deleteNotification = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/notifications/${id}`, {
      headers: getAuthHeader()
    });
  } catch (error) {
    console.error("Erreur suppression notification:", error);
  }
};