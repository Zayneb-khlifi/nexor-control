// src/services/mlRecommendationService.ts
import axios from 'axios';
import { getProduits } from './produitService';
import { getCommandes } from './commandeService';
import { getLignesCommande } from './commandeService';

const ML_API_URL = 'http://localhost:8000';

export interface MLProduct {
  id: number;
  nom: string;
  description: string;
  prix: number;
  categorie: string;
  stock: number;
}

export interface MLRecommendation {
  product_id: number;
  score: number;
  reason: string;
  product: MLProduct;
}

export interface UserPreferences {
  categorie_aimee?: string;
  categorie_detestee?: string;
  prix_max?: number;
  allergenes?: string[];
}

class MLRecommendationService {
  private isModelTrained: boolean = false;
  private allProductsCache: MLProduct[] = [];
  
  private getCategory(product: any): string {
    const nom = product.nom.toLowerCase();
    if (nom.includes("café") || nom.includes("thé") || nom.includes("chocolat") || nom.includes("cappuccino")) return "boissons-chaudes";
    if (nom.includes("jus") || nom.includes("ice tea") || nom.includes("limonade") || nom.includes("smoothie")) return "boissons-froides";
    if (nom.includes("tiramisu") || nom.includes("fondant") || nom.includes("crème") || nom.includes("tarte")) return "desserts";
    if (nom.includes("croissant") || nom.includes("pain au chocolat") || nom.includes("brioche")) return "petit-dejeuner";
    return "plats";
  }
  
  private convertToMLProduct(product: any): MLProduct {
    return {
      id: product.id,
      nom: product.nom,
      description: product.description || "",
      prix: product.prix,
      categorie: this.getCategory(product),
      stock: product.stock || 0
    };
  }
  
  async trainModel(): Promise<boolean> {
    try {
      console.log("🔄 Entraînement du modèle ML...");
      const produits = await getProduits();
      this.allProductsCache = produits.map((p: any) => this.convertToMLProduct(p));
      
      const response = await axios.post(`${ML_API_URL}/train`, { 
        products: this.allProductsCache 
      });
      
      if (response.data.status === "success") {
        this.isModelTrained = true;
        console.log("✅ Modèle ML entraîné avec succès");
        return true;
      }
      return false;
    } catch (error) {
      console.error("❌ Erreur entraînement ML:", error);
      return false;
    }
  }
  
  async getUserOrderHistory(userId: number): Promise<MLProduct[]> {
    try {
      const commandes = await getCommandes();
      const userCommandes = commandes.filter((c: any) => c.client_id === userId);
      const products: MLProduct[] = [];
      
      for (const commande of userCommandes) {
        const lignes = await getLignesCommande(commande.id_commande || commande.id);
        for (const ligne of lignes) {
          const produits = await getProduits();
          const produit = produits.find((p: any) => p.id === ligne.produit_id);
          if (produit) {
            products.push(this.convertToMLProduct(produit));
          }
        }
      }
      return products;
    } catch (error) {
      console.error("Erreur récupération historique:", error);
      return [];
    }
  }
  
  async getPopularProducts(): Promise<MLProduct[]> {
    try {
      const produits = await getProduits();
      const sorted = [...produits].sort((a, b) => b.stock - a.stock);
      return sorted.slice(0, 5).map((p: any) => this.convertToMLProduct(p));
    } catch (error) {
      return [];
    }
  }
  
  async getRecommendations(userId: number, preferences?: UserPreferences): Promise<MLRecommendation[]> {
    try {
      if (!this.isModelTrained) {
        await this.trainModel();
      }
      
      const [userHistory, allProducts, popularProducts] = await Promise.all([
        this.getUserOrderHistory(userId),
        getProduits().then(ps => ps.map((p: any) => this.convertToMLProduct(p))),
        this.getPopularProducts()
      ]);
      
      const hour = new Date().getHours();
      const month = new Date().getMonth();
      let season = "printemps";
      if (month >= 5 && month <= 8) season = "ete";
      else if (month >= 11 || month <= 1) season = "hiver";
      else if (month >= 2 && month <= 4) season = "printemps";
      else season = "automne";
      
      console.log(`📊 Appel API ML - Heure: ${hour}, Saison: ${season}`);
      console.log(`📊 Historique utilisateur: ${userHistory.length} produits`);
      
      const response = await axios.post(`${ML_API_URL}/recommend`, {
        user_id: userId,
        user_history: userHistory,
        all_products: allProducts,
        popular_products: popularProducts,
        hour: hour,
        season: season,
        preferences: preferences ? {
          categorie_aimee: preferences.categorie_aimee,
          categorie_detestee: preferences.categorie_detestee,
          prix_max: preferences.prix_max,
          allergenes: preferences.allergenes
        } : null
      });
      
      console.log(`✅ ${response.data.length} recommandations reçues`);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur recommandations ML:", error);
      return [];
    }
  }
  
  async getPerformanceMetrics(): Promise<any> {
    try {
      const response = await axios.get(`${ML_API_URL}/model/performance`);
      return response.data;
    } catch (error) {
      console.error("Erreur récupération métriques:", error);
      return null;
    }
  }
  
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${ML_API_URL}/health`);
      return response.data.status === "healthy";
    } catch (error) {
      console.error("API ML indisponible:", error);
      return false;
    }
  }

  // Ajouter cette méthode
  async getAllProducts(): Promise<any[]> {
   try {
    const produits = await getProduits();
    return produits;
   } catch (error) {
    console.error("Erreur récupération produits:", error);
    return [];
   }
}
}

export default new MLRecommendationService();