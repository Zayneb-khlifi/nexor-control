// src/pages/profile/Profile.tsx
import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../hooks/useAuth";
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  ShoppingBag, 
  Coins, 
  TrendingUp,
  Star,
  Crown,
  Gift,
  Zap,
  Loader2,
  Settings,
  Shield,
  Bell,
  CreditCard,
  Heart
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import PreferencesModal from "./PreferencesModal";
import BadgesSection from "../../components/profile/BadgesSection";

interface ProfileData {
  user: {
    id_user: number;
    nom: string;
    email: string;
    role: string;
    date_creation: string;
    statut_compte: string;
  };
  points: {
    total_points: number;
    points_utilises: number;
    niveau: string;
  };
  stats: {
    totalCommandes: number;
    totalDepense: number;
    points: number;
    niveau: string;
  };
  commandes: any[];
  recompenses: any[];
}

interface Recompense {
  id_recompense: number;
  nom: string;
  description: string;
  points_requis: number;
  type: string;
  valeur: number;
}

const niveauConfig: Record<string, { color: string; bg: string; text: string; icon: any; minPoints: number }> = {
  BRONZE: { color: "from-amber-600 to-amber-700", bg: "bg-amber-100", text: "text-amber-600", icon: Star, minPoints: 0 },
  ARGENT: { color: "from-gray-400 to-gray-500", bg: "bg-gray-100", text: "text-gray-600", icon: Award, minPoints: 200 },
  OR: { color: "from-yellow-500 to-yellow-600", bg: "bg-yellow-100", text: "text-yellow-600", icon: Crown, minPoints: 500 },
  PLATINE: { color: "from-cyan-500 to-blue-600", bg: "bg-cyan-100", text: "text-cyan-600", icon: Zap, minPoints: 1000 }
};

function Profile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [recompenses, setRecompenses] = useState<Recompense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecompense, setSelectedRecompense] = useState<Recompense | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      console.log("🔑 Token présent:", !!token);
      
      const response = await axios.get("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("✅ Profil reçu:", response.data);
      setProfile(response.data);
    } catch (error: any) {
      console.error("❌ Erreur chargement profil:", error);
      console.error("Détails:", error.response?.data);
      setError(error.response?.data?.message || "Erreur lors du chargement du profil");
      toast.error("Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecompenses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/profile/recompenses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("✅ Récompenses reçues:", response.data);
      setRecompenses(response.data);
    } catch (error: any) {
      console.error("❌ Erreur chargement récompenses:", error);
    }
  };

  const handleEchanger = async (recompense: Recompense) => {
    if (!profile || profile.stats.points < recompense.points_requis) {
      toast.error(`Points insuffisants. Vous avez ${profile?.stats.points || 0} points, besoin de ${recompense.points_requis}`);
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/profile/echanger", 
        { recompenseId: recompense.id_recompense },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`✅ Récompense "${recompense.nom}" obtenue !`);
      fetchProfile();
      setSelectedRecompense(null);
    } catch (error: any) {
      console.error("Erreur échange:", error);
      toast.error(error.response?.data?.message || "Erreur lors de l'échange");
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchRecompenses();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-500">Chargement de votre profil...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full mb-4">
            <User className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Erreur de chargement</h2>
          <p className="text-gray-500">{error}</p>
          <button
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Réessayer
          </button>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <User className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-500">Aucune donnée de profil disponible</p>
          <button
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Recharger
          </button>
        </div>
      </MainLayout>
    );
  }

  const currentNiveau = profile?.stats?.niveau || "BRONZE";
  const niveauInfo = niveauConfig[currentNiveau] || niveauConfig.BRONZE;
  const NiveauIcon = niveauInfo.icon;
  
  const levels = ["BRONZE", "ARGENT", "OR", "PLATINE"];
  const currentIndex = levels.indexOf(currentNiveau);
  const nextLevel = currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
  const currentMin = niveauConfig[currentNiveau]?.minPoints || 0;
  const nextMin = nextLevel ? niveauConfig[nextLevel]?.minPoints || 1000 : profile?.stats?.totalDepense || 1000;
  const progress = profile ? ((profile.stats.totalDepense - currentMin) / (nextMin - currentMin)) * 100 : 0;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mon Profil</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez vos informations personnelles et vos récompenses
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne de gauche */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className={`h-24 bg-gradient-to-r ${niveauInfo.color}`} />
              <div className="relative px-6 pb-6">
                <div className="flex justify-center -mt-12 mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-800">
                    <span className="text-3xl font-bold text-white">
                      {profile?.user?.nom?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white">
                  {profile?.user?.nom || "Utilisateur"}
                </h2>
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {profile?.user?.email}
                </p>
                <div className="mt-4 flex justify-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${niveauInfo.bg} ${niveauInfo.text}`}>
                    <NiveauIcon className="w-3 h-3 inline mr-1" />
                    {currentNiveau}
                  </span>
                </div>
              </div>
              <div className="border-t dark:border-gray-700 px-6 py-4 space-y-3">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{profile?.user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    Membre depuis {profile?.user?.date_creation ? new Date(profile.user.date_creation).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="text-sm">{profile?.stats?.totalCommandes || 0} commandes passées</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Coins className="w-6 h-6" />
                  <span className="font-semibold">Mes Points</span>
                </div>
                <span className="text-3xl font-bold">{profile?.stats?.points || 0}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total dépensé</span>
                  <span>{profile?.stats?.totalDepense?.toFixed(2) || 0}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Points cumulés</span>
                  <span>{profile?.points?.total_points || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Points utilisés</span>
                  <span>{profile?.points?.points_utilises || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne de droite */}
          <div className="lg:col-span-2 space-y-6">
            {nextLevel && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Progression vers {nextLevel}</h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    {Math.min(100, Math.round(progress))}% complété
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full bg-gradient-to-r ${niveauConfig[nextLevel]?.color || "from-blue-500 to-blue-600"}`}
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Plus que {Math.max(0, nextMin - (profile?.stats?.totalDepense || 0)).toFixed(2)}€ pour atteindre le niveau {nextLevel}
                </p>
              </div>
            )}

            {/* Section Badges */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">🏆 Mes trophées</h3>
              </div>
              <BadgesSection />
            </div>

            {/* Récompenses disponibles */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Récompenses disponibles</h3>
              </div>
              {recompenses.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune récompense disponible pour le moment</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recompenses.map((recompense) => {
                    const canAfford = (profile?.stats?.points || 0) >= recompense.points_requis;
                    return (
                      <div key={recompense.id_recompense} className={`border rounded-xl p-4 transition ${canAfford ? "hover:shadow-md" : "opacity-60"}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">{recompense.nom}</h4>
                            <p className="text-xs text-gray-500 mt-1">{recompense.description}</p>
                            <div className="flex items-center gap-1 mt-2">
                              <Coins className="w-3 h-3 text-yellow-500" />
                              <span className="text-sm font-semibold text-yellow-600">{recompense.points_requis} points</span>
                            </div>
                          </div>
                          <div className="ml-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              recompense.type === "REDUCTION" ? "bg-green-100 text-green-600" :
                              recompense.type === "PRODUIT_GRATUIT" ? "bg-purple-100 text-purple-600" :
                              "bg-blue-100 text-blue-600"
                            }`}>
                              {recompense.type === "REDUCTION" ? `${recompense.valeur}€ off` :
                               recompense.type === "PRODUIT_GRATUIT" ? "Produit gratuit" :
                               "Livraison offerte"}
                            </span>
                          </div>
                        </div>
                        {canAfford && (
                          <button 
                            onClick={() => setSelectedRecompense(recompense)}
                            className="mt-3 w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
                          >
                            Échanger mes points
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dernières commandes */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Mes dernières commandes</h3>
              </div>
              {!profile?.commandes || profile.commandes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune commande pour le moment</p>
              ) : (
                <div className="space-y-3">
                  {profile.commandes.slice(0, 5).map((commande) => {
                    const total = commande.LigneCommandes?.reduce((sum: number, l: any) => sum + (l.prix_total || 0), 0) || 0;
                    return (
                      <div key={commande.id_commande} className="border rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Commande #{commande.numero_commande || commande.id_commande}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {commande.date_creation ? new Date(commande.date_creation).toLocaleDateString() : "Date inconnue"}
                            </p>
                            <div className="mt-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                commande.statut === "VALIDEE" ? "bg-green-100 text-green-600" :
                                commande.statut === "EN_ATTENTE" ? "bg-yellow-100 text-yellow-600" :
                                commande.statut === "EN_COURS" ? "bg-blue-100 text-blue-600" :
                                "bg-gray-100 text-gray-600"
                              }`}>
                                {commande.statut === "VALIDEE" ? "Validée" :
                                 commande.statut === "EN_ATTENTE" ? "En attente" :
                                 commande.statut === "EN_COURS" ? "En cours" : commande.statut}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white">{total.toFixed(2)}€</p>
                            <p className="text-xs text-gray-500 mt-1">
                              +{Math.floor(total)} points
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'échange de points */}
      {selectedRecompense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRecompense(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Échanger vos points</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Vous allez échanger <strong>{selectedRecompense.points_requis} points</strong> contre :
            </p>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 mb-4">
              <p className="font-semibold text-gray-900 dark:text-white">{selectedRecompense.nom}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedRecompense.description}</p>
              <div className="flex items-center gap-1 mt-2">
                <Coins className="w-3 h-3 text-yellow-500" />
                <span className="text-sm font-semibold text-yellow-600">{selectedRecompense.points_requis} points</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleEchanger(selectedRecompense)}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Confirmer l'échange
              </button>
              <button
                onClick={() => setSelectedRecompense(null)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Préférences */}
      <PreferencesModal 
        isOpen={showPreferences} 
        onClose={() => setShowPreferences(false)} 
        onUpdate={fetchProfile} 
      />
    </MainLayout>
  );
}

export default Profile;