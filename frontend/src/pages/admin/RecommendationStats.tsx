// src/pages/admin/RecommendationStats.tsx
import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../hooks/useAuth";
import { BarChart3, TrendingUp, MousePointerClick, ShoppingBag, AlertCircle } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface Stats {
  total_clicks: number;
  total_conversions: number;
  conversion_rate: number;
}

interface ABTestStats {
  test_group: string;
  views: number;
  clicks: number;
  conversions: number;
  ctr: number;
  conversion_rate: number;
}

export default function RecommendationStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [abStats, setAbStats] = useState<ABTestStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/recommendations/tracking/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data.stats);
        setAbStats(response.data.ab_test);
      } catch (error) {
        console.error("Erreur chargement stats:", error);
        toast.error("Erreur chargement statistiques");
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Accès refusé</h2>
          <p className="text-gray-500 mt-2">Cette page est réservée aux administrateurs</p>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📊 Performance des recommandations IA</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Analyse des clics et conversions du moteur de recommandation
        </p>
      </div>

      {/* Cartes principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <MousePointerClick className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Clics totaux</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.total_clicks || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Utilisateurs ayant cliqué</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Conversions</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.total_conversions || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Achats après recommandation</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Taux de conversion</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.conversion_rate || 0}%</p>
          <p className="text-sm text-gray-500 mt-1">Des clics vers les achats</p>
        </div>
      </div>

      {/* A/B Testing */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">A/B Testing : IA vs Aléatoire</h2>
          </div>
        </div>
        <div className="overflow-x-auto p-6">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Groupe</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vues</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clics</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CTR</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conversions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taux conv.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {abStats.map((stat) => (
                <tr key={stat.test_group} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3">
                    {stat.test_group === "IA" ? (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">🧠 IA</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">🎲 Aléatoire</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{stat.views || 0}</td>
                  <td className="px-4 py-3">{stat.clicks || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${(stat.ctr || 0) > 10 ? "text-green-600" : "text-yellow-600"}`}>
                      {(stat.ctr || 0).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3">{stat.conversions || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${(stat.conversion_rate || 0) > 5 ? "text-green-600" : "text-gray-600"}`}>
                      {(stat.conversion_rate || 0).toFixed(1)}%
                    </span>
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