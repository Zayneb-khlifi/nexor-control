// src/pages/UserDashboard.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MainLayout from "../layouts/MainLayout";
import { getProduits } from "../services/produitService";
import { getCommandes } from "../services/commandeService";
import { useAuth } from "../hooks/useAuth";
import MLRecommendations from "../components/dashboard/MLRecommendations";
import { 
  ShoppingBag, 
  Star, 
  TrendingUp, 
  Gift,
  Heart,
  Utensils,
  Crown,
  Tag,
  Sparkles,
  Coffee,
  Pizza,
  IceCream,
  Zap
} from "lucide-react";
import FeaturedProducts from "../components/dashboard/FeaturedProducts";
import Recipes from "../components/dashboard/Recipes";
import SpecialOffers from "../components/dashboard/SpecialOffers";

function UserDashboard() {
  const [products, setProducts] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [produitsData, commandesData] = await Promise.all([
          getProduits(),
          getCommandes()
        ]);
        setProducts(produitsData);
        setCommandes(commandesData);
      } catch (error) {
        console.error("Erreur chargement dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = {
    commandesTotal: commandes.length,
    commandesEnCours: commandes.filter((c: any) => c.statut === "EN_COURS").length,
    points: user ? 1250 : 0,
    niveau: "Or"
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative mb-12 overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-white/10"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-8 h-8 text-yellow-300" />
            <span className="text-sm font-medium">Niveau {stats.niveau}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Bonjour, {user?.nom || "Client"} ! 👋
          </h1>
          <p className="text-white/90 text-lg mb-6">
            Découvrez nos suggestions personnalisées pour vous
          </p>
          <div className="flex gap-4">
            <div className="bg-white/20 rounded-xl px-4 py-2">
              <p className="text-sm">Commandes totales</p>
              <p className="text-2xl font-bold">{stats.commandesTotal}</p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2">
              <p className="text-sm">Points fidélité</p>
              <p className="text-2xl font-bold">{stats.points}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION RECOMMANDATIONS IA */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">🧠 Recommandé pour vous (IA)</h2>
          </div>
          <span className="text-xs text-gray-400">Basé sur votre historique</span>
        </div>
        <MLRecommendations />
      </div>

      {/* Statistiques personnelles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
          <ShoppingBag className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.commandesTotal}</p>
          <p className="text-sm text-gray-500">Commandes</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
          <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.commandesEnCours}</p>
          <p className="text-sm text-gray-500">En cours</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
          <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.points}</p>
          <p className="text-sm text-gray-500">Points</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
          <Gift className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">3</p>
          <p className="text-sm text-gray-500">Offres actives</p>
        </div>
      </div>

      {/* Produits en vedette */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">🔥 Produits populaires</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700">Voir tout →</button>
        </div>
        <FeaturedProducts products={products} />
      </div>

      {/* Recettes recommandées */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Utensils className="w-5 h-5 text-orange-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">🍽️ Recettes recommandées</h2>
        </div>
        <Recipes />
      </div>

      {/* Offres spéciales */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">🎁 Offres spéciales</h2>
        </div>
        <SpecialOffers />
      </div>

      {/* Bannière de fidélité */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white text-center">
        <Heart className="w-10 h-10 mx-auto mb-3 text-pink-200" />
        <h3 className="text-xl font-bold mb-2">Programme de fidélité</h3>
        <p className="text-white/90 mb-4">Gagnez des points à chaque commande et profitez d'avantages exclusifs</p>
        <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
          En savoir plus
        </button>
      </div>
    </MainLayout>
  );
}

export default UserDashboard;