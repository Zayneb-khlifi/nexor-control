// src/components/profile/BadgesSection.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Trophy, Star, Lock, Sparkles, RefreshCw } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

interface Badge {
  id: number;
  nom: string;
  description: string;
  icone: string;
  points: number;
  date?: string;
}

export default function BadgesSection() {
  const [obtainedBadges, setObtainedBadges] = useState<Badge[]>([]);
  const [availableBadges, setAvailableBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const { isAdmin } = useAuth();

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("🔑 Token présent:", !!token);
      
      const [obtainedRes, availableRes] = await Promise.all([
        axios.get("http://localhost:5000/api/badges", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:5000/api/badges/available", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      console.log("Badges obtenus:", obtainedRes.data);
      console.log("Badges disponibles:", availableRes.data);
      
      setObtainedBadges(obtainedRes.data);
      setAvailableBadges(availableRes.data);
    } catch (error: any) {
      console.error("Erreur chargement badges:", error.response?.data || error.message);
      toast.error("Erreur chargement des badges");
    } finally {
      setLoading(false);
    }
  };

  const forceCheckBadges = async () => {
    setChecking(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:5000/api/badges/force-check", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Force check résultat:", response.data);
      toast.success(`✅ ${response.data.newBadges?.length || 0} nouveaux badges débloqués !`);
      fetchBadges();
    } catch (error: any) {
      console.error("Erreur force check:", error.response?.data || error.message);
      toast.error("Erreur lors de la vérification");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      '🎯': <span className="text-2xl">🎯</span>,
      '🏆': <Trophy className="w-6 h-6 text-yellow-500" />,
      '👑': <span className="text-2xl">👑</span>,
      '💰': <span className="text-2xl">💰</span>,
      '📦': <span className="text-2xl">📦</span>,
      '⭐': <Star className="w-6 h-6 text-yellow-500" />,
      '🤝': <span className="text-2xl">🤝</span>,
      '🚀': <span className="text-2xl">🚀</span>,
      '🍽️': <span className="text-2xl">🍽️</span>,
      '☕': <span className="text-2xl">☕</span>,
      '🌙': <span className="text-2xl">🌙</span>,
      '📅': <span className="text-2xl">📅</span>,
    };
    return icons[iconName] || <Award className="w-6 h-6 text-purple-500" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bouton force check (admin uniquement) */}
      {isAdmin && (
        <div className="flex justify-end">
          <button
            onClick={forceCheckBadges}
            disabled={checking}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg text-xs hover:bg-purple-200 transition"
          >
            <RefreshCw className={`w-3 h-3 ${checking ? "animate-spin" : ""}`} />
            {checking ? "Vérification..." : "Forcer vérification badges"}
          </button>
        </div>
      )}

      {/* Badges obtenus */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Mes trophées ({obtainedBadges.length})</h3>
        </div>
        {obtainedBadges.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 text-center">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Aucun badge obtenu pour le moment</p>
            <p className="text-sm text-gray-400">Continuez à commander pour débloquer des trophées !</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {obtainedBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-3 text-center border border-yellow-200 dark:border-yellow-800"
              >
                <div className="flex justify-center mb-2">
                  {getIcon(badge.icone)}
                </div>
                <h4 className="font-medium text-sm text-gray-900 dark:text-white">{badge.nom}</h4>
                <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                {badge.points > 0 && (
                  <p className="text-xs text-green-600 mt-1">+{badge.points} points</p>
                )}
                {badge.date && (
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(badge.date).toLocaleDateString()}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Badges à débloquer */}
      {availableBadges.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">À débloquer ({availableBadges.length})</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {availableBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 text-center opacity-60"
              >
                <div className="flex justify-center mb-2">
                  {getIcon(badge.icone)}
                </div>
                <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">{badge.nom}</h4>
                <p className="text-xs text-gray-400 mt-1">{badge.description}</p>
                {badge.points > 0 && (
                  <p className="text-xs text-gray-400 mt-1">+{badge.points} points</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}