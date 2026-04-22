// src/realtime/socket.ts
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"; // Votre backend

// Créer la connexion socket
const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Gestionnaire de connexion
socket.on("connect", () => {
  console.log("✅ Socket connecté, ID:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Socket déconnecté");
});

socket.on("connect_error", (error) => {
  console.error("❌ Erreur de connexion socket:", error);
});

export default socket;