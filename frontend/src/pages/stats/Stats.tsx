// src/pages/stats/Stats.tsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import MainLayout from "../../layouts/MainLayout";
import { getRobots } from "../../services/robotService";
import { getCommandes } from "../../services/commandeService";
import { getProduits } from "../../services/produitService";
import { getStocks } from "../../services/stockService";
import socket from "../../realtime/socket";
import toast from "react-hot-toast";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Activity,
  Bot,
  ShoppingCart,
  Package,
  Clock,
  Zap,
  Award,
  Users,
  DollarSign,
  Percent
} from "lucide-react";

interface StatsData {
  robots: any[];
  commandes: any[];
  produits: any[];
  stocks: any[];
  dailyStats: {
    date: string;
    commandes: number;
    robotsActifs: number;
    valeurTotale: number;
  }[];
  monthlyStats: {
    mois: string;
    commandes: number;
    revenus: number;
  }[];
  robotStats: {
    nom: string;
    missions: number;
    tempsUtilisation: number;
    batterieMoyenne: number;
  }[];
  produitStats: {
    nom: string;
    quantiteVendue: number;
    chiffreAffaire: number;
    stock: number;
  }[];
  performance: {
    tauxValidation: number;
    tauxOccupation: number;
    satisfaction: number;
    efficacite: number;
  };
  trends: {
    commandes: { value: number; isPositive: boolean };
    revenus: { value: number; isPositive: boolean };
    robots: { value: number; isPositive: boolean };
  };
}

// Données simulées pour les graphiques (à remplacer par API réelle)
const generateMockStats = (commandes: any[], robots: any[], produits: any[]): StatsData => {
  const dailyStats = [];
  const monthlyStats = [];
  
  // Générer 30 jours de stats
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const commandesJour = Math.floor(Math.random() * 10) + 1;
    dailyStats.push({
      date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      commandes: commandesJour,
      robotsActifs: Math.floor(Math.random() * 8) + 2,
      valeurTotale: commandesJour * (Math.random() * 500 + 100)
    });
  }
  
  // Générer 6 mois de stats
  const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
  for (let i = 0; i < 6; i++) {
    monthlyStats.push({
      mois: mois[i],
      commandes: Math.floor(Math.random() * 30) + 10,
      revenus: Math.floor(Math.random() * 5000) + 2000
    });
  }
  
  // Stats robots
  const robotStats = robots.map(robot => ({
    nom: robot.nom,
    missions: Math.floor(Math.random() * 20) + 1,
    tempsUtilisation: Math.floor(Math.random() * 100) + 10,
    batterieMoyenne: robot.batterie || 85
  }));
  
  // Stats produits
  const produitStats = produits.map(produit => ({
    nom: produit.nom,
    quantiteVendue: Math.floor(Math.random() * 100) + 10,
    chiffreAffaire: Math.floor(Math.random() * 5000) + 500,
    stock: produit.stock || 0
  }));
  
  const commandesValidees = commandes.filter((c: any) => c.statut === "VALIDEE").length;
  const commandesTotal = commandes.length;
  
  const robotsOccupes = robots.filter((r: any) => r.statut === "EN_MISSION" || r.statut === "OCCUPE").length;
  
  return {
    robots,
    commandes,
    produits,
    stocks: [],
    dailyStats,
    monthlyStats,
    robotStats,
    produitStats,
    performance: {
      tauxValidation: commandesTotal > 0 ? (commandesValidees / commandesTotal) * 100 : 0,
      tauxOccupation: robots.length > 0 ? (robotsOccupes / robots.length) * 100 : 0,
      satisfaction: 94,
      efficacite: 87
    },
    trends: {
      commandes: { value: 23, isPositive: true },
      revenus: { value: 15, isPositive: true },
      robots: { value: 8, isPositive: true }
    }
  };
};

// Couleurs pour les graphiques
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

function Stats() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7j" | "30j" | "90j">("30j");
  const [chartType, setChartType] = useState<"bar" | "line" | "area">("bar");
  const [selectedStat, setSelectedStat] = useState<string>("commandes");

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [robots, commandes, produits, stocks] = await Promise.all([
        getRobots(),
        getCommandes(),
        getProduits(),
        getStocks()
      ]);
      const statsData = generateMockStats(commandes, robots, produits);
      setData(statsData);
      toast.success("Statistiques mises à jour");
    } catch (error) {
      console.error("Erreur chargement stats:", error);
      toast.error("Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    socket.on("robotUpdate", () => fetchStats());
    socket.on("commandeUpdate", () => fetchStats());
    
    return () => {
      socket.off("robotUpdate");
      socket.off("commandeUpdate");
    };
  }, []);

  if (loading || !data) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des statistiques...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const renderChart = () => {
    if (chartType === "bar") {
      return (
        <BarChart data={data.dailyStats}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
            labelStyle={{ color: '#F3F4F6' }}
          />
          <Legend />
          <Bar dataKey="commandes" fill="#3B82F6" name="Commandes" radius={[4, 4, 0, 0]} />
          <Bar dataKey="robotsActifs" fill="#10B981" name="Robots actifs" radius={[4, 4, 0, 0]} />
        </BarChart>
      );
    } else if (chartType === "line") {
      return (
        <LineChart data={data.dailyStats}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
            labelStyle={{ color: '#F3F4F6' }}
          />
          <Legend />
          <Line type="monotone" dataKey="commandes" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
          <Line type="monotone" dataKey="robotsActifs" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
        </LineChart>
      );
    } else {
      return (
        <AreaChart data={data.dailyStats}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
            labelStyle={{ color: '#F3F4F6' }}
          />
          <Legend />
          <Area type="monotone" dataKey="commandes" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
          <Area type="monotone" dataKey="robotsActifs" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
        </AreaChart>
      );
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Statistiques avancées</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Analyse détaillée des performances de votre flotte
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchStats}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
            <button
              onClick={() => toast.success("Export en cours...")}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
            >
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <ShoppingCart className="w-8 h-8 opacity-80" />
            <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full">
              {data.trends.commandes.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {data.trends.commandes.value}%
            </div>
          </div>
          <p className="text-sm opacity-80">Total commandes</p>
          <p className="text-3xl font-bold mt-1">{data.commandes.length}</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <DollarSign className="w-8 h-8 opacity-80" />
            <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full">
              {data.trends.revenus.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {data.trends.revenus.value}%
            </div>
          </div>
          <p className="text-sm opacity-80">Chiffre d'affaires</p>
          <p className="text-3xl font-bold mt-1">
            {data.monthlyStats.reduce((sum, m) => sum + m.revenus, 0).toLocaleString()} €
          </p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <Bot className="w-8 h-8 opacity-80" />
            <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full">
              {data.trends.robots.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {data.trends.robots.value}%
            </div>
          </div>
          <p className="text-sm opacity-80">Robots actifs</p>
          <p className="text-3xl font-bold mt-1">{data.robots.length}</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <Percent className="w-8 h-8 opacity-80" />
          </div>
          <p className="text-sm opacity-80">Taux d'occupation</p>
          <p className="text-3xl font-bold mt-1">{Math.round(data.performance.tauxOccupation)}%</p>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Taux de validation</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{Math.round(data.performance.tauxValidation)}%</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${data.performance.tauxValidation}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Efficacité</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.performance.efficacite}%</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${data.performance.efficacite}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Users className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Satisfaction</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.performance.satisfaction}%</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${data.performance.satisfaction}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Temps moyen mission</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">32 min</p>
          <p className="text-sm text-gray-500 mt-1">-5% vs mois dernier</p>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex gap-2">
          {(["bar", "line", "area"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`p-2 rounded-lg transition ${
                chartType === type
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              {type === "bar" && <BarChart3 className="w-5 h-5" />}
              {type === "line" && <LineChartIcon className="w-5 h-5" />}
              {type === "area" && <PieChartIcon className="w-5 h-5" />}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(["7j", "30j", "90j"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition ${
                timeRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              {range === "7j" ? "7 jours" : range === "30j" ? "30 jours" : "90 jours"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Évolution des commandes et robots actifs</h2>
        <ResponsiveContainer width="100%" height={400}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenus mensuels</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="mois" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                formatter={(value) => [`${value} €`, 'Revenus']}
              />
              <Bar dataKey="revenus" fill="#10B981" name="Revenus (€)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Robot Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top robots par missions</h2>
          <div className="space-y-4">
            {data.robotStats.slice(0, 5).map((robot, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{robot.nom}</span>
                    <span className="text-sm text-gray-500">{robot.missions} missions</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(robot.missions / Math.max(...data.robotStats.map(r => r.missions))) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Products Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Produits les plus vendus</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité vendue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chiffre d'affaires</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock restant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.produitStats.slice(0, 5).map((produit, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{produit.nom}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{produit.quantiteVendue} unités</td>
                  <td className="px-4 py-3 text-sm text-green-600 font-medium">{produit.chiffreAffaire.toLocaleString()} €</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{produit.stock} unités</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (produit.quantiteVendue / 100) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {Math.round((produit.quantiteVendue / Math.max(...data.produitStats.map(p => p.quantiteVendue))) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}

export default Stats;