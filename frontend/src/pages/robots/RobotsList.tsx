// src/pages/robots/RobotsList.tsx
import { useEffect, useState } from "react";
import { getRobots, createRobot, updateRobot, deleteRobot } from "../../services/robotService";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../hooks/useAuth";
import { PlusIcon, PencilIcon, TrashIcon, BotIcon, BatteryIcon, RefreshCwIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { SkeletonCard } from "../../components/common/Skeleton";

function RobotsList() {
  const [robots, setRobots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRobot, setEditingRobot] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { isAdmin, isSuperAdmin, user } = useAuth();

  const fetchRobots = async () => {
    setLoading(true);
    try {
      const data = await getRobots();
      setRobots(data);
    } catch (error) {
      console.error("Erreur chargement robots:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRobots();
  }, []);

  const handleCreate = async (robotData: any) => {
    if (!isAdmin && !isSuperAdmin) {
      toast.error("Accès refusé. Seuls les administrateurs peuvent créer des robots.");
      return;
    }
    try {
      await createRobot(robotData);
      toast.success("Robot créé avec succès !");
      fetchRobots();
      setShowModal(false);
    } catch (error) {
      toast.error("Erreur lors de la création");
    }
  };

  const handleUpdate = async (id: number, robotData: any) => {
    if (!isAdmin && !isSuperAdmin) {
      toast.error("Accès refusé. Seuls les administrateurs peuvent modifier des robots.");
      return;
    }
    try {
      await updateRobot(id, robotData);
      toast.success("Robot modifié avec succès !");
      fetchRobots();
      setEditingRobot(null);
    } catch (error) {
      toast.error("Erreur lors de la modification");
    }
  };

  const handleDelete = async (id: number, nom: string) => {
    if (!isAdmin && !isSuperAdmin) {
      toast.error("Accès refusé. Seuls les administrateurs peuvent supprimer des robots.");
      return;
    }
    if (confirm(`Êtes-vous sûr de vouloir supprimer le robot "${nom}" ?`)) {
      try {
        await deleteRobot(id);
        toast.success("Robot supprimé avec succès !");
        fetchRobots();
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const getStatusColor = (statut: string) => {
    const colors: Record<string, string> = {
      DISPONIBLE: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      EN_MISSION: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      OCCUPE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      MAINTENANCE: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
    };
    return colors[statut] || "bg-gray-100 text-gray-800";
  };

  const getBatteryColor = (batterie: number) => {
    if (batterie > 70) return "bg-green-500";
    if (batterie > 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Robots</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez votre flotte de robots
              {!isAdmin && !isSuperAdmin && <span className="ml-2 text-xs text-blue-500">(Mode consultation)</span>}
            </p>
          </div>
          
          {(isAdmin || isSuperAdmin) && (
            <button
              onClick={() => {
                setEditingRobot(null);
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
            >
              <PlusIcon className="w-5 h-5" />
              Nouveau robot
            </button>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <p className="text-gray-500 text-sm">Total robots</p>
          <p className="text-2xl font-bold">{robots.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <p className="text-gray-500 text-sm">Disponibles</p>
          <p className="text-2xl font-bold text-green-600">{robots.filter(r => r.statut === "DISPONIBLE").length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <p className="text-gray-500 text-sm">En mission</p>
          <p className="text-2xl font-bold text-blue-600">{robots.filter(r => r.statut === "EN_MISSION").length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <p className="text-gray-500 text-sm">Batterie moyenne</p>
          <p className="text-2xl font-bold">
            {Math.round(robots.reduce((sum, r) => sum + (r.batterie || 0), 0) / (robots.length || 1))}%
          </p>
        </div>
      </div>

      {/* Liste des robots avec Skeleton Loading */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {robots.map((robot) => (
            <div key={robot.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <BotIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{robot.nom}</h3>
                      <p className="text-xs text-gray-500">ID: {robot.id}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(robot.statut)}`}>
                    {robot.statut}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span className="flex items-center gap-1"><BatteryIcon className="w-3 h-3" /> Batterie</span>
                    <span>{robot.batterie || 100}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className={`h-2 rounded-full ${getBatteryColor(robot.batterie || 100)}`} style={{ width: `${robot.batterie || 100}%` }} />
                  </div>
                </div>

                {robot.localisation && (
                  <p className="text-sm text-gray-500 mb-4">📍 {robot.localisation}</p>
                )}

                {(isAdmin || isSuperAdmin) && (
                  <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setEditingRobot(robot);
                        setShowModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                      <PencilIcon className="w-3 h-3" /> Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(robot.id, robot.nom)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-200 transition text-sm"
                    >
                      <TrashIcon className="w-3 h-3" /> Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de création/modification */}
      {showModal && (
        <RobotModal
          robot={editingRobot}
          onClose={() => setShowModal(false)}
          onSave={editingRobot ? (data: any) => handleUpdate(editingRobot.id, data) : handleCreate}
        />
      )}
    </MainLayout>
  );
}

// Modal pour créer/modifier un robot
function RobotModal({ robot, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    nom: robot?.nom || "",
    statut: robot?.statut || "DISPONIBLE",
    batterie: robot?.batterie || 100,
    localisation: robot?.localisation || ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">{robot ? "Modifier le robot" : "Nouveau robot"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom du robot *</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Statut</label>
            <select
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="DISPONIBLE">Disponible</option>
              <option value="EN_MISSION">En mission</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="OCCUPE">Occupé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Batterie (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.batterie}
              onChange={(e) => setFormData({ ...formData, batterie: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Localisation</label>
            <input
              type="text"
              value={formData.localisation}
              onChange={(e) => setFormData({ ...formData, localisation: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entrepôt A1"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
              {robot ? "Modifier" : "Créer"}
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RobotsList;