// src/components/dashboard/MLRecommendations.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, TrendingUp, Star, ShoppingCart, AlertCircle, RefreshCw } from "lucide-react";
import mlRecommendationService from "../../services/mlRecommendationService";
import type { MLRecommendation, UserPreferences } from "../../services/mlRecommendationService";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

interface MLRecommendationsProps {
  preferences?: UserPreferences;
  refreshTrigger?: number;
  testGroup?: "IA" | "RANDOM";
}

export default function MLRecommendations({ preferences, refreshTrigger, testGroup = "IA" }: MLRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<MLRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [mlAvailable, setMlAvailable] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [randomProducts, setRandomProducts] = useState<any[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Enregistrer la vue des recommandations pour A/B test
  const trackView = async () => {
    if (!user?.id) return;
    try {
      await axios.post("http://localhost:5000/api/recommendations/tracking/view", {
        test_group: testGroup,
        count: recommendations.length
      });
    } catch (error) {
      console.error("Erreur tracking vue:", error);
    }
  };

  // Enregistrer un clic sur recommandation
  const trackClick = async (productId: number, score: number, reason: string) => {
    if (!user?.id) return;
    try {
      await axios.post("http://localhost:5000/api/recommendations/tracking/click", {
        product_id: productId,
        score: score,
        reason: reason,
        test_group: testGroup
      });
    } catch (error) {
      console.error("Erreur tracking clic:", error);
    }
  };

  const loadRecommendations = async (showToastMessage: boolean = false) => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const available = await mlRecommendationService.healthCheck();
      setMlAvailable(available);
      
      if (available) {
        if (testGroup === "IA") {
          const recos = await mlRecommendationService.getRecommendations(user.id, preferences);
          setRecommendations(recos);
          
          const perfMetrics = await mlRecommendationService.getPerformanceMetrics();
          setMetrics(perfMetrics);
          
          if (showToastMessage && recos.length > 0) {
            toast.success(`🎯 ${recos.length} recommandations IA disponibles`);
          }
        } else {
          // Groupe RANDOM : produits aléatoires pour A/B test
          const allProducts = await mlRecommendationService.getAllProducts();
          const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
          setRandomProducts(shuffled.slice(0, 8));
          if (showToastMessage) {
            toast(`🎲 ${shuffled.slice(0, 8).length} recommandations aléatoires (groupe témoin)`, {
              icon: "🎲"
            });
          }
        }
        
        await trackView();
      }
    } catch (error) {
      console.error("Erreur chargement recommandations:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleProductClick = async (product: any, score: number, reason: string) => {
    await trackClick(product.id, score, reason);
    navigate(`/commandes/create?produit=${product.id}`);
  };

  useEffect(() => {
    loadRecommendations();
  }, [user?.id, preferences, refreshTrigger, testGroup]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRecommendations(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-yellow-500";
    return "text-gray-500";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: "🔥 Forte recommandation", color: "bg-green-100 text-green-800 dark:bg-green-900/30" };
    if (score >= 60) return { label: "⭐ Recommandé", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30" };
    if (score >= 40) return { label: "👌 Peut vous plaire", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30" };
    return { label: "🤔 À découvrir", color: "bg-gray-100 text-gray-800 dark:bg-gray-700" };
  };

  const displayProducts = testGroup === "IA" ? recommendations : randomProducts;
  const isIAGroup = testGroup === "IA";

  if (!mlAvailable) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-400">
          Service de recommandation temporairement indisponible
        </h3>
        <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">
          Veuillez réessayer plus tard
        </p>
      </div>
    );
  }

  if (loading && displayProducts.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (displayProducts.length === 0 && !loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 text-center">
        <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
          Aucune recommandation pour le moment
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Passez des commandes pour recevoir des suggestions personnalisées par l'IA
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Badge A/B Test */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {isIAGroup ? (
            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">🧠 Groupe IA</span>
          ) : (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">🎲 Groupe Témoin</span>
          )}
        </div>
        <div className="flex gap-4 text-xs text-gray-500">
          {isIAGroup && metrics && (
            <>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>Latence: {metrics.average_latency_ms} ms</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Précision: {metrics.average_precision_at_5}%</span>
              </div>
            </>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1 text-purple-500 hover:text-purple-600 transition"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
            Rafraîchir
          </button>
        </div>
      </div>
      
      {/* Grille des recommandations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {displayProducts.map((item: any, index: number) => {
          const score = isIAGroup ? (item as MLRecommendation).score : Math.floor(Math.random() * 50) + 20;
          const reason = isIAGroup ? (item as MLRecommendation).reason : "Découverte aléatoire";
          const product = isIAGroup ? (item as MLRecommendation).product : item;
          const scoreBadge = getScoreBadge(score);
          
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
              onClick={() => handleProductClick(product, score, reason)}
            >
              <div className="relative h-36 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${scoreBadge.color}`}>
                    {scoreBadge.label}
                  </span>
                </div>
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                    {Math.round(score)}% match
                  </span>
                </div>
                <span className="text-5xl">
                  {product.nom.includes("Café") ? "☕" :
                   product.nom.includes("Pizza") ? "🍕" :
                   product.nom.includes("Burger") ? "🍔" :
                   product.nom.includes("Salade") ? "🥗" :
                   product.nom.includes("Tiramisu") ? "🍰" : "🍽️"}
                </span>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">{product.nom}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.description}</p>
                
                <div className="flex justify-between items-center mt-3">
                  <span className="text-lg font-bold text-orange-600">{product.prix}€</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs text-gray-500">{Math.round(score)}%</span>
                  </div>
                </div>
                
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 truncate">
                  💡 {reason.length > 40 ? reason.substring(0, 40) + "..." : reason}
                </p>
                
                <button 
                  className="w-full mt-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-red-600 transition flex items-center justify-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProductClick(product, score, reason);
                  }}
                >
                  <ShoppingCart className="w-3 h-3" />
                  Commander
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}