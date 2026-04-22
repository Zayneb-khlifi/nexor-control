// src/pages/commandes/CommandesList.tsx
import { useEffect, useState } from "react";
import { getCommandes, updateCommande } from "../../services/commandeService";
import { assignRobot } from "../../services/robotService";
import MainLayout from "../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { PlusIcon, RefreshCwIcon, BotIcon, CheckCircleIcon, UserIcon, PackageIcon } from "lucide-react";
import socket from "../../realtime/socket";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { SkeletonTable } from "../../components/common/Skeleton";



function CommandesList() {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "validated" | "processing">("all");
  const navigate = useNavigate();
  const { user, isAdmin, isSuperAdmin, isUser } = useAuth();

  const fetchCommandes = async () => {
    setLoading(true);
    try {
      const data = await getCommandes();
      console.log("Commandes reçues:", data);
      setCommandes(data);
    } catch (error) {
      console.error("Erreur chargement commandes:", error);
      toast.error("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandes();

    socket.on("commandeUpdate", (data) => {
      toast.success(`📦 Commande #${data.id} mise à jour`);
      fetchCommandes();
    });

    return () => {
      socket.off("commandeUpdate");
    };
  }, []);

  const handleValidate = async (id: number) => {
    if (!isAdmin && !isSuperAdmin) {
      toast.error("Accès refusé. Seuls les administrateurs peuvent valider les commandes.");
      return;
    }
    try {
      await updateCommande(id, { statut: "VALIDEE" });
      toast.success("✅ Commande validée !");
      fetchCommandes();
    } catch (error) {
      toast.error("❌ Erreur lors de la validation");
    }
  };

  const handleAssign = async (commandeId: number) => {
    if (!isAdmin && !isSuperAdmin) {
      toast.error("Accès refusé. Seuls les administrateurs peuvent assigner des robots.");
      return;
    }
    const robotId = prompt("Entrer l'ID du robot à assigner");
    if (!robotId) return;
    try {
      await assignRobot(commandeId, Number(robotId));
      toast.success(`✅ Robot ${robotId} assigné à la commande ${commandeId} !`);
      fetchCommandes();
    } catch (error) {
      toast.error("❌ Erreur lors de l'assignation");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      EN_ATTENTE: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", label: "En attente" },
      VALIDEE: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", label: "Validée" },
      EN_COURS: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400", label: "En cours" },
      LIVREE: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400", label: "Livrée" },
      ANNULEE: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", label: "Annulée" }
    };
    const config = statusConfig[status] || { color: "bg-gray-100 text-gray-800", label: status };
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>{config.label}</span>;
  };

  const filteredCommandes = commandes.filter(c => {
    if (filter === "pending") return c.statut === "EN_ATTENTE";
    if (filter === "validated") return c.statut === "VALIDEE";
    if (filter === "processing") return c.statut === "EN_COURS";
    return true;
  });

  // Statistiques pour l'admin
  const stats = {
    total: commandes.length,
    enAttente: commandes.filter(c => c.statut === "EN_ATTENTE").length,
    validees: commandes.filter(c => c.statut === "VALIDEE").length,
    enCours: commandes.filter(c => c.statut === "EN_COURS").length
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Commandes</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isUser 
                ? "Consultez l'historique de vos commandes"
                : "Gérez toutes les commandes clients"
              }
            </p>
          </div>
          
          {/* Seuls les admins peuvent créer des commandes pour d'autres */}
          {(isAdmin || isSuperAdmin) && (
            <button
              onClick={() => navigate("/commandes/create")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
            >
              <PlusIcon className="w-5 h-5" />
              Nouvelle commande
            </button>
          )}
        </div>
      </div>

      {/* Stats pour les admins */}
      {(isAdmin || isSuperAdmin) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">Total commandes</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
            <p className="text-gray-500 text-sm">En attente</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.enAttente}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Validées</p>
            <p className="text-2xl font-bold text-green-600">{stats.validees}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
            <p className="text-gray-500 text-sm">En cours</p>
            <p className="text-2xl font-bold text-purple-600">{stats.enCours}</p>
          </div>
        </div>
      )}

      {/* Filtres pour les admins */}
      {(isAdmin || isSuperAdmin) && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Toutes ({stats.total})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "pending" ? "bg-yellow-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            En attente ({stats.enAttente})
          </button>
          <button
            onClick={() => setFilter("validated")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "validated" ? "bg-green-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Validées ({stats.validees})
          </button>
          <button
            onClick={() => setFilter("processing")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "processing" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            En cours ({stats.enCours})
          </button>
        </div>
      )}

      {/* Tableau des commandes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="font-semibold text-gray-700 dark:text-gray-300">
            {isUser ? "Mes commandes" : "Liste des commandes"}
          </h2>
          <button
            onClick={fetchCommandes}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition"
            disabled={loading}
          >
            <RefreshCwIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="text-sm">Rafraîchir</span>
          </button>
        </div>

        {loading ? (
           <SkeletonTable rows={5} columns={7} />
        ) : filteredCommandes.length === 0 ? (
          <div className="text-center py-12">
            <PackageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aucune commande</h3>
            <p className="text-gray-500 mt-1">
              {isUser 
                ? "Vous n'avez pas encore passé de commande"
                : "Aucune commande trouvée"
              }
            </p>
            {isUser && (
              <button
                onClick={() => navigate("/commandes/create")}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <PlusIcon className="w-4 h-4" />
                Passer une commande
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Robot</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredCommandes.map((c) => (
                  <tr key={c.id_commande || c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{c.id_commande || c.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{c.numero_commande || "N/A"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {c.client?.nom || `Client #${c.client_id}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(c.statut)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {c.robot_id ? (
                        <span className="inline-flex items-center gap-1">
                          <BotIcon className="w-4 h-4 text-blue-500" />
                          Robot #{c.robot_id}
                        </span>
                      ) : "Non assigné"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(c.date_creation).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {/* Validation pour admins */}
                        {(isAdmin || isSuperAdmin) && c.statut === "EN_ATTENTE" && (
                          <button
                            onClick={() => handleValidate(c.id_commande || c.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs"
                          >
                            <CheckCircleIcon className="w-3 h-3" />
                            Valider
                          </button>
                        )}
                        {/* Assignation pour admins */}
                        {(isAdmin || isSuperAdmin) && c.statut === "VALIDEE" && !c.robot_id && (
                          <button
                            onClick={() => handleAssign(c.id_commande || c.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs"
                          >
                            <BotIcon className="w-3 h-3" />
                            Assigner
                          </button>
                        )}
                        {/* Statut pour utilisateur normal */}
                        {isUser && c.statut === "EN_ATTENTE" && (
                          <span className="text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
                            En attente de validation
                          </span>
                        )}
                        {isUser && c.statut === "VALIDEE" && !c.robot_id && (
                          <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                            Validée - En attente d'assignation
                          </span>
                        )}
                        {isUser && c.statut === "EN_COURS" && (
                          <span className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                            En cours de livraison
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default CommandesList;