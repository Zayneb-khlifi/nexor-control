// src/pages/tracking/Tracking.tsx
import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import MainLayout from "../../layouts/MainLayout";
import { getRobots } from "../../services/robotService";
import type { RobotPosition } from "../../services/robotPositionService";
import socket from "../../realtime/socket";
import toast from "react-hot-toast";
import { Bot, Battery, MapPin, RefreshCw } from "lucide-react";

// Icône personnalisée pour les robots
const createRobotIcon = (statut: string) => {
  let color = "#22c55e"; // vert par défaut
  if (statut === "EN_MISSION") color = "#3b82f6"; // bleu
  else if (statut === "MAINTENANCE") color = "#f97316"; // orange
  else if (statut === "HORS_SERVICE") color = "#ef4444"; // rouge
  
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
              <circle cx="12" cy="12" r="2"></circle>
              <path d="M9 11v-1a3 3 0 0 1 6 0v1"></path>
            </svg>
           </div>`,
    className: "custom-robot-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// Composant pour centrer la carte
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

function Tracking() {
  const [robots, setRobots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRobot, setSelectedRobot] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([48.8566, 2.3522]);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const mapRef = useRef<any>(null);

  // Coordonnées simulées pour les robots
  const generateRandomPosition = (index: number) => {
    const baseLat = 48.8566;
    const baseLng = 2.3522;
    const offset = 0.01;
    return {
      latitude: baseLat + (Math.sin(index) * offset),
      longitude: baseLng + (Math.cos(index * 1.3) * offset)
    };
  };

  const fetchRobots = async () => {
    setLoading(true);
    try {
      const robotsData = await getRobots();
      
      const robotsWithPositions = robotsData.map((robot: any, index: number) => {
        const pos = generateRandomPosition(index);
        return {
          id: robot.id_robot,
          nom: robot.nom,
          statut: robot.statut,
          batterie: robot.batterie,
          latitude: pos.latitude,
          longitude: pos.longitude,
          localisation: robot.localisation || "Paris"
        };
      });
      
      setRobots(robotsWithPositions);
      setLastUpdate(new Date().toLocaleTimeString());
      
      if (robotsWithPositions.length > 0) {
        setMapCenter([robotsWithPositions[0].latitude, robotsWithPositions[0].longitude]);
      }
    } catch (error) {
      console.error("Erreur chargement robots:", error);
      toast.error("Erreur lors du chargement des robots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRobots();
    
    socket.on("robotUpdate", (data) => {
      setRobots(prev => 
        prev.map(robot => 
          robot.id === data.id 
            ? { ...robot, statut: data.statut, batterie: data.batterie }
            : robot
        )
      );
      setLastUpdate(new Date().toLocaleTimeString());
    });
    
    const interval = setInterval(() => {
      setRobots(prev => 
        prev.map(robot => {
          if (robot.statut === "EN_MISSION") {
            return {
              ...robot,
              latitude: robot.latitude + (Math.random() - 0.5) * 0.002,
              longitude: robot.longitude + (Math.random() - 0.5) * 0.002
            };
          }
          return robot;
        })
      );
      setLastUpdate(new Date().toLocaleTimeString());
    }, 5000);
    
    return () => {
      socket.off("robotUpdate");
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = (statut: string) => {
    switch(statut) {
      case "DISPONIBLE": return "bg-green-100 text-green-800";
      case "EN_MISSION": return "bg-blue-100 text-blue-800";
      case "MAINTENANCE": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (statut: string) => {
    switch(statut) {
      case "DISPONIBLE": return "Disponible";
      case "EN_MISSION": return "En mission";
      case "MAINTENANCE": return "Maintenance";
      default: return statut;
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement de la carte...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📍 Tracking des robots</h1>
            <p className="text-gray-500 text-sm mt-1">Visualisez la position en temps réel de votre flotte</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-400">Dernière mise à jour: {lastUpdate}</div>
            <button onClick={fetchRobots} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
              <RefreshCw className="w-4 h-4" /> Rafraîchir
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Liste des robots */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 h-[500px] overflow-y-auto">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Bot className="w-4 h-4" /> Robots ({robots.length})
          </h3>
          <div className="space-y-2">
            {robots.map((robot) => (
              <button
                key={robot.id}
                onClick={() => {
                  setMapCenter([robot.latitude, robot.longitude]);
                  setSelectedRobot(robot);
                }}
                className={`w-full text-left p-3 rounded-lg transition ${
                  selectedRobot?.id === robot.id ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500" : "hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{robot.nom}</p>
                    <p className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${getStatusColor(robot.statut)}`}>
                      {getStatusText(robot.statut)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className={robot.batterie < 20 ? "text-red-500" : ""}>{robot.batterie}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                  <MapPin className="w-3 h-3" /> {robot.localisation}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Carte Leaflet */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden h-[500px]">
          <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
            <MapController center={mapCenter} />
            {robots.map((robot) => (
              <Marker key={robot.id} position={[robot.latitude, robot.longitude]} icon={createRobotIcon(robot.statut)}>
                <Popup>
                  <div className="text-center min-w-[150px]">
                    <p className="font-bold text-gray-900">{robot.nom}</p>
                    <p className={`text-xs px-2 py-0.5 rounded-full inline-block my-1 ${getStatusColor(robot.statut)}`}>
                      {getStatusText(robot.statut)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Batterie: {robot.batterie}%</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Légende */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Légende</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500"></div><span className="text-sm">Disponible</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-blue-500"></div><span className="text-sm">En mission</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-orange-500"></div><span className="text-sm">Maintenance</span></div>
          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-500" /><span className="text-sm">Cliquez sur un robot</span></div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Tracking;