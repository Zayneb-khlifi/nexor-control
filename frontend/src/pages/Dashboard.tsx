// src/pages/Dashboard.tsx (version responsive avec Skeleton)
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MainLayout from "../layouts/MainLayout";
import { getRobots } from "../services/robotService";
import { getCommandes } from "../services/commandeService";
import { getProduits } from "../services/produitService";
import { getStocks } from "../services/stockService";
import socket from "../realtime/socket";
import toast, { Toaster } from "react-hot-toast";
import KpiCard from "../components/dashboard/KpiCard";
import { 
  Bot, ShoppingCart, Package, TrendingUp, TrendingDown, 
  AlertTriangle, CheckCircle, Activity, RefreshCw, 
  Battery, Clock, Truck, Percent
} from "lucide-react";
import { SkeletonDashboard } from "../components/common/Skeleton";

function Dashboard() {
  const [data, setData] = useState({
    robots: [],
    commandes: [],
    produits: [],
    stocks: [],
    stats: {
      totalRobots: 0,
      robotsDisponibles: 0,
      robotsEnMission: 0,
      robotsMaintenance: 0,
      batterieMoyenne: 0,
      totalCommandes: 0,
      commandesValidees: 0,
      commandesEnCours: 0,
      commandesEnAttente: 0,
      tauxValidation: 0,
      totalProduits: 0,
      produitsFaibleStock: 0,
      produitsRupture: 0
    },
    lastUpdate: ""
  });
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [robots, commandes, produits, stocks] = await Promise.all([
        getRobots(),
        getCommandes(),
        getProduits(),
        getStocks()
      ]);

      const robotsDisponibles = robots.filter((r: any) => r.statut === "DISPONIBLE").length;
      const robotsEnMission = robots.filter((r: any) => r.statut === "EN_MISSION").length;
      const robotsMaintenance = robots.filter((r: any) => r.statut === "MAINTENANCE").length;
      const batterieMoyenne = robots.length > 0 
        ? robots.reduce((sum: number, r: any) => sum + (r.batterie || 0), 0) / robots.length 
        : 0;

      const commandesValidees = commandes.filter((c: any) => c.statut === "VALIDEE").length;
      const commandesEnCours = commandes.filter((c: any) => c.statut === "EN_COURS").length;
      const commandesEnAttente = commandes.filter((c: any) => c.statut === "EN_ATTENTE").length;
      const tauxValidation = commandes.length > 0 ? (commandesValidees / commandes.length) * 100 : 0;

      const produitsFaibleStock = stocks.filter((s: any) => s.quantite > 0 && s.quantite <= (s.seuil_minimum || 10)).length;
      const produitsRupture = stocks.filter((s: any) => s.quantite === 0).length;

      setData({
        robots,
        commandes,
        produits,
        stocks,
        stats: {
          totalRobots: robots.length,
          robotsDisponibles,
          robotsEnMission,
          robotsMaintenance,
          batterieMoyenne,
          totalCommandes: commandes.length,
          commandesValidees,
          commandesEnCours,
          commandesEnAttente,
          tauxValidation,
          totalProduits: produits.length,
          produitsFaibleStock,
          produitsRupture
        },
        lastUpdate: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    socket.on("robotUpdate", () => {
      toast.success("🔄 Mise à jour des robots");
      loadData();
    });

    socket.on("commandeUpdate", () => {
      toast.success("📦 Mise à jour des commandes");
      loadData();
    });

    return () => {
      socket.off("robotUpdate");
      socket.off("commandeUpdate");
    };
  }, []);

  // Configuration responsive des colonnes
  const kpiGridClass = "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8";

  // Affichage du skeleton pendant le chargement
  if (loading) {
    return (
      <MainLayout>
        <SkeletonDashboard />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Toaster position={isMobile ? "bottom-center" : "top-right"} toastOptions={{ duration: 4000 }} />

      {/* Header responsive */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              Vue d'ensemble de votre flotte • Dernière mise à jour: {data.lastUpdate}
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition w-full sm:w-auto justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* KPI Cards - Responsive grid */}
      <div className={kpiGridClass}>
        <KpiCard
          title="Robots"
          value={data.stats.totalRobots}
          icon={<Bot className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="from-blue-500 to-blue-600"
          loading={loading}
        />
        <KpiCard
          title="Disponibles"
          value={data.stats.robotsDisponibles}
          icon={<CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="from-green-500 to-green-600"
          loading={loading}
          trend={{ value: data.stats.robotsDisponibles ? 15 : 0, isPositive: true }}
        />
        <KpiCard
          title="Batterie moyenne"
          value={`${Math.round(data.stats.batterieMoyenne)}%`}
          icon={<Battery className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="from-yellow-500 to-yellow-600"
          loading={loading}
        />
        <KpiCard
          title="Commandes"
          value={data.stats.totalCommandes}
          icon={<ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="from-purple-500 to-purple-600"
          loading={loading}
        />
        <KpiCard
          title="Taux validation"
          value={`${Math.round(data.stats.tauxValidation)}%`}
          icon={<Percent className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="from-indigo-500 to-indigo-600"
          loading={loading}
          trend={{ value: data.stats.tauxValidation, isPositive: data.stats.tauxValidation > 50 }}
        />
      </div>

      {/* Second row - 2 columns responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <KpiCard
          title="En mission"
          value={data.stats.robotsEnMission}
          icon={<Truck className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="from-blue-500 to-blue-600"
          loading={loading}
        />
        <KpiCard
          title="En maintenance"
          value={data.stats.robotsMaintenance}
          icon={<Activity className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="from-orange-500 to-orange-600"
          loading={loading}
        />
        <KpiCard
          title="En attente"
          value={data.stats.commandesEnAttente}
          icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="from-yellow-500 to-yellow-600"
          loading={loading}
        />
      </div>

      {/* Alertes responsive */}
      {(data.stats.produitsFaibleStock > 0 || data.stats.produitsRupture > 0) && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6 sm:mb-8"
        >
          <div className="flex items-start sm:items-center gap-3 flex-col sm:flex-row">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-400 text-sm sm:text-base">Alertes stock</p>
              <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-500">
                {data.stats.produitsRupture} produit(s) en rupture, {data.stats.produitsFaibleStock} produit(s) avec stock faible
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </MainLayout>
  );
}

export default Dashboard;