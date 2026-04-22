// src/pages/supervision/Supervision.tsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../../layouts/MainLayout";
import { getRobots } from "../../services/robotService";
import socket from "../../realtime/socket";
import toast from "react-hot-toast";
import { 
  Bot, 
  Battery, 
  Activity, 
  MapPin, 
  Wifi, 
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Play,
  Pause,
  RefreshCw
} from "lucide-react";

interface Robot {
  id_robot: number;
  nom: string;
  statut: string;
  batterie: number;
  localisation: string;
}

function Supervision() {
  const [robots, setRobots] = useState<Robot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("tous");

  const fetchData = async () => {
    try {
      const robotsData = await getRobots();
      setRobots(robotsData);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Erreur chargement supervision:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    socket.on("connect", () => {
      setConnectionStatus(true);
      toast.success("🔌 Connexion temps réel établie");
    });
    
    socket.on("disconnect", () => {
      setConnectionStatus(false);
      toast.error("⚠️ Connexion temps réel perdue");
    });
    
    socket.on("robotUpdate", (data) => {
      console.log("📡 Mise à jour robot:", data);
      setRobots(prev => 
        prev.map(robot => 
          robot.id_robot === data.id 
            ? { ...robot, ...data, batterie: data.batterie ?? robot.batterie }
            : robot
        )
      );
      setLastUpdate(new Date().toLocaleTimeString());
    });
    
    socket.on("batteryUpdate", (data) => {
      setRobots(prev => 
        prev.map(robot => 
          robot.id_robot === data.robotId 
            ? { ...robot, batterie: data.batterie }
            : robot
        )
      );
      
      if (data.batterie < 20) {
        toast.error(`🔋 Batterie faible pour robot #${data.robotId} (${data.batterie}%)`);
      }
    });
    
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("robotUpdate");
      socket.off("batteryUpdate");
    };
  }, []);

  const getStatusConfig = (statut: string) => {
    const configs: Record<string, { color: string; bg: string; icon: any; label: string }> = {
      DISPONIBLE: { color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/20", icon: CheckCircle, label: "Disponible" },
      EN_MISSION: { color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/20", icon: Play, label: "En mission" },
      MAINTENANCE: { color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/20", icon: Pause, label: "Maintenance" },
      OCCUPE: { color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/20", icon: Activity, label: "Occupé" }
    };
    return configs[statut] || configs["DISPONIBLE"];
  };

  const getBatteryColor = (batterie: number) => {
    if (batterie > 70) return "bg-green-500";
    if (batterie > 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  const filteredRobots = robots.filter(robot => {
    if (filter === "tous") return true;
    if (filter === "disponible") return robot.statut === "DISPONIBLE";
    if (filter === "mission") return robot.statut === "EN_MISSION";
    if (filter === "maintenance") return robot.statut === "MAINTENANCE";
    return true;
  });

  const stats = {
    total: robots.length,
    disponibles: robots.filter(r => r.statut === "DISPONIBLE").length,
    enMission: robots.filter(r => r.statut === "EN_MISSION").length,
    maintenance: robots.filter(r => r.statut === "MAINTENANCE").length,
    batterieMoyenne: robots.length > 0 
      ? Math.round(robots.reduce((sum, r) => sum + (r.batterie || 0), 0) / robots.length)
      : 0
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement de la supervision...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Supervision temps réel</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Surveillance en direct de votre flotte de robots</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${connectionStatus ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
              {connectionStatus ? <Wifi className="w-4 h-4 text-green-600" /> : <WifiOff className="w-4 h-4 text-red-600" />}
              <span className={`text-sm ${connectionStatus ? 'text-green-600' : 'text-red-600'}`}>
                {connectionStatus ? 'Connecté' : 'Déconnecté'}
              </span>
            </div>
            <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 transition">
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm">Rafraîchir</span>
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">Dernière mise à jour: {lastUpdate}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4"><p className="text-gray-500 text-sm">Total robots</p><p className="text-2xl font-bold">{stats.total}</p></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4"><p className="text-gray-500 text-sm">Disponibles</p><p className="text-2xl font-bold text-green-600">{stats.disponibles}</p></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4"><p className="text-gray-500 text-sm">En mission</p><p className="text-2xl font-bold text-blue-600">{stats.enMission}</p></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4"><p className="text-gray-500 text-sm">Maintenance</p><p className="text-2xl font-bold text-orange-600">{stats.maintenance}</p></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4"><p className="text-gray-500 text-sm">Batterie moyenne</p><p className="text-2xl font-bold text-purple-600">{stats.batterieMoyenne}%</p></div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[{ id: "tous", label: "Tous", count: stats.total }, { id: "disponible", label: "Disponibles", count: stats.disponibles }, { id: "mission", label: "En mission", count: stats.enMission }, { id: "maintenance", label: "Maintenance", count: stats.maintenance }].map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={`px-4 py-2 rounded-full transition ${filter === f.id ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200"}`}>
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Robots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRobots.map((robot, index) => {
          const StatusIcon = getStatusConfig(robot.statut).icon;
          const statusConfig = getStatusConfig(robot.statut);
          
          return (
            <motion.div
              key={robot.id_robot}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedRobot(robot)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className={`h-1 w-full ${robot.batterie > 70 ? 'bg-green-500' : robot.batterie > 30 ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${statusConfig.bg}`}><Bot className={`w-5 h-5 ${statusConfig.color}`} /></div>
                    <div><h3 className="font-semibold">{robot.nom}</h3><p className="text-xs text-gray-500">ID: {robot.id_robot}</p></div>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${statusConfig.bg}`}>
                    <StatusIcon className={`w-3 h-3 ${statusConfig.color}`} />
                    <span className={`text-xs font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="flex items-center gap-1"><Battery className="w-3 h-3" /> Batterie</span>
                    <span className={robot.batterie < 20 ? 'text-red-600 font-medium' : ''}>{robot.batterie}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className={`h-2 rounded-full ${getBatteryColor(robot.batterie)}`} style={{ width: `${robot.batterie}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-4">
                  <MapPin className="w-3 h-3" />
                  <span>{robot.localisation || "Inconnue"}</span>
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  <button className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs py-2 rounded-lg hover:bg-gray-200 transition">Détails</button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredRobots.length === 0 && (
        <div className="text-center py-12"><Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium">Aucun robot trouvé</h3></div>
      )}

      {/* Modal Robot Details */}
      <AnimatePresence>
        {selectedRobot && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedRobot(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${getStatusConfig(selectedRobot.statut).bg}`}><Bot className={`w-6 h-6 ${getStatusConfig(selectedRobot.statut).color}`} /></div>
                  <div><h2 className="text-xl font-bold">{selectedRobot.nom}</h2><p className="text-sm text-gray-500">ID: {selectedRobot.id_robot}</p></div>
                </div>
                <button onClick={() => setSelectedRobot(null)} className="p-1 hover:bg-gray-100 rounded-lg transition">✕</button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-gray-500">Statut</p><p className={`font-medium ${getStatusConfig(selectedRobot.statut).color}`}>{getStatusConfig(selectedRobot.statut).label}</p></div>
                  <div><p className="text-xs text-gray-500">Batterie</p><p className="font-medium">{selectedRobot.batterie}%</p></div>
                  <div><p className="text-xs text-gray-500">Localisation</p><p className="font-medium">{selectedRobot.localisation || "Inconnue"}</p></div>
                </div>
                {selectedRobot.batterie < 30 && (<div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-600" /><p className="text-xs text-yellow-600">Batterie faible, veuillez recharger le robot</p></div>)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}

export default Supervision;