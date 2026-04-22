// src/services/recommendationService.ts
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

export interface Product {
  id: number;
  nom: string;
  description: string;
  prix: number;
  stock: number;
  categorie?: string;
}

export interface Recommendation {
  product: Product;
  score: number;
  reason: string;
}

class RecommendationService {
  
  // 1. Récupérer l'historique des commandes de l'utilisateur
  async getUserOrderHistory(userId: number): Promise<Product[]> {
    try {
      const response = await axios.get(`${API_URL}/commandes/history/${userId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error("Erreur récupération historique:", error);
      return [];
    }
  }
  
  // 2. Récupérer tous les produits disponibles
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await axios.get(`${API_URL}/produits`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error("Erreur récupération produits:", error);
      return [];
    }
  }
  
  // 3. Récupérer les produits populaires (top ventes)
  async getPopularProducts(): Promise<Product[]> {
    try {
      const response = await axios.get(`${API_URL}/produits/popular`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error("Erreur récupération produits populaires:", error);
      return [];
    }
  }
  
  // 4. Déterminer la catégorie d'un produit
  getProductCategory(product: Product): string {
    const nom = product.nom.toLowerCase();
    if (nom.includes("café") || nom.includes("thé") || nom.includes("chocolat") || nom.includes("cappuccino")) return "boissons-chaudes";
    if (nom.includes("jus") || nom.includes("ice tea") || nom.includes("limonade") || nom.includes("smoothie") || nom.includes("coca")) return "boissons-froides";
    if (nom.includes("tiramisu") || nom.includes("fondant") || nom.includes("crème") || nom.includes("tarte") || nom.includes("profiterole")) return "desserts";
    if (nom.includes("croissant") || nom.includes("pain au chocolat") || nom.includes("brioche")) return "petit-dejeuner";
    return "plats";
  }
  
  // 5. Recommandation basée sur l'historique (similarité)
  getHistoryBasedRecommendations(userHistory: Product[], allProducts: Product[]): Product[] {
    if (userHistory.length === 0) return [];
    
    // Compter les catégories préférées
    const categoryCount: Record<string, number> = {};
    userHistory.forEach(product => {
      const cat = this.getProductCategory(product);
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    
    // Trouver la catégorie préférée
    const favoriteCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0];
    
    if (!favoriteCategory) return [];
    
    // Récupérer les produits de la même catégorie non encore commandés
    const orderedIds = new Set(userHistory.map(p => p.id));
    const recommendations = allProducts.filter(p => 
      this.getProductCategory(p) === favoriteCategory && !orderedIds.has(p.id) && p.stock > 0
    );
    
    return recommendations;
  }
  
  // 6. Recommandation contextuelle (heure, saison)
  getContextualRecommendations(allProducts: Product[]): Product[] {
    const hour = new Date().getHours();
    const month = new Date().getMonth();
    
    // Déterminer la période de la journée
    let period: string;
    if (hour < 11) period = "petit-dejeuner";
    else if (hour < 15) period = "midi";
    else period = "diner";
    
    // Déterminer la saison
    let season: string;
    if (month >= 5 && month <= 8) season = "ete";
    else if (month >= 11 || month <= 1) season = "hiver";
    else season = "printemps";
    
    // Filtrer selon la période
    let filtered = allProducts.filter(p => p.stock > 0);
    
    if (period === "petit-dejeuner") {
      filtered = filtered.filter(p => this.getProductCategory(p) === "petit-dejeuner" || p.nom.toLowerCase().includes("café"));
    } else if (period === "midi") {
      filtered = filtered.filter(p => this.getProductCategory(p) === "plats");
    } else {
      filtered = filtered.filter(p => this.getProductCategory(p) === "plats" || this.getProductCategory(p) === "desserts");
    }
    
    // Ajustement saisonnier
    if (season === "ete") {
      const eteProducts = filtered.filter(p => this.getProductCategory(p) === "boissons-froides" || p.nom.toLowerCase().includes("salade"));
      if (eteProducts.length > 0) filtered = eteProducts;
    } else if (season === "hiver") {
      const hiverProducts = filtered.filter(p => this.getProductCategory(p) === "boissons-chaudes" || p.nom.toLowerCase().includes("soupe"));
      if (hiverProducts.length > 0) filtered = hiverProducts;
    }
    
    return filtered.slice(0, 8);
  }
  
  // 7. Recommandation collaborative (les autres clients ont aimé)
  getCollaborativeRecommendations(popularProducts: Product[], allProducts: Product[], limit: number = 6): Product[] {
    // Prendre les produits populaires non commandés (simulé)
    const popularIds = new Set(popularProducts.map(p => p.id));
    const recommendations = allProducts.filter(p => popularIds.has(p.id) && p.stock > 0);
    return recommendations.slice(0, limit);
  }
  
  // 8. Recommandation hybride (combinaison de toutes les méthodes)
  async getHybridRecommendations(userId: number): Promise<Recommendation[]> {
    try {
      // Récupérer les données
      const userHistory = await this.getUserOrderHistory(userId);
      const allProducts = await this.getAllProducts();
      const popularProducts = await this.getPopularProducts();
      
      const recommendationsMap = new Map<number, { product: Product; score: number; reasons: string[] }>();
      
      // Méthode 1: Historique (poids 40%)
      const historyRecos = this.getHistoryBasedRecommendations(userHistory, allProducts);
      historyRecos.forEach(product => {
        const existing = recommendationsMap.get(product.id);
        if (existing) {
          existing.score += 40;
          existing.reasons.push("Basé sur vos préférences");
        } else {
          recommendationsMap.set(product.id, { product, score: 40, reasons: ["Basé sur vos préférences"] });
        }
      });
      
      // Méthode 2: Contexte (poids 30%)
      const contextRecos = this.getContextualRecommendations(allProducts);
      contextRecos.forEach(product => {
        const existing = recommendationsMap.get(product.id);
        if (existing) {
          existing.score += 30;
          existing.reasons.push("Recommandé pour ce moment");
        } else {
          recommendationsMap.set(product.id, { product, score: 30, reasons: ["Recommandé pour ce moment"] });
        }
      });
      
      // Méthode 3: Collaboratif (poids 30%)
      const collabRecos = this.getCollaborativeRecommendations(popularProducts, allProducts);
      collabRecos.forEach(product => {
        const existing = recommendationsMap.get(product.id);
        if (existing) {
          existing.score += 30;
          existing.reasons.push("Populaire auprès des clients");
        } else {
          recommendationsMap.set(product.id, { product, score: 30, reasons: ["Populaire auprès des clients"] });
        }
      });
      
      // Trier par score et retourner les meilleures recommandations
      const recommendations = Array.from(recommendationsMap.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map(r => ({
          product: r.product,
          score: r.score,
          reason: r.reasons.join(" • ")
        }));
      
      return recommendations;
      
    } catch (error) {
      console.error("Erreur recommandation hybride:", error);
      return [];
    }
  }
}

export default new RecommendationService();