# app/recommender.py - VERSION CORRIGÉE
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime
import time

# Liste de stop words français personnalisée
FRENCH_STOP_WORDS = [
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'à', 'a', 'au', 'aux',
    'pour', 'par', 'sur', 'dans', 'avec', 'sans', 'ou', 'mais', 'donc', 'or', 'ni',
    'car', 'ce', 'cet', 'cette', 'ces', 'mon', 'ton', 'son', 'notre', 'votre', 'leur',
    'mes', 'tes', 'ses', 'nos', 'vos', 'leurs', 'il', 'elle', 'ils', 'elles', 'on',
    'nous', 'vous', 'je', 'tu', 'se', 'me', 'te', 'y', 'en', 'est', 'sont', 'était',
    'étaient', 'sera', 'seront', 'a', 'ont', 'avaient', 'aura', 'auront', 'ceci', 'cela',
    'celle', 'celles', 'celui', 'ceux', 'que', 'qui', 'dont', 'lequel', 'laquelle'
]

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NEXORRecommender:
    """Système de recommandation hybride professionnel"""
    
    def __init__(self):
        # Modèle TF-IDF pour le contenu (sans stop_words param)
        self.tfidf = TfidfVectorizer(
            max_features=300,
            ngram_range=(1, 2),
            min_df=1
        )
        
        # Matrices et données
        self.product_features = None
        self.product_ids = None
        self.product_categories = {}
        self.product_prices = {}
        self.product_names = {}
        
        # Métriques de performance
        self.request_count = 0
        self.total_latency = 0
        self.precision_history = []
        
        self.is_trained = False
        
    def _extract_features(self, product: Dict) -> str:
        """Extraire les caractéristiques textuelles d'un produit"""
        # Nettoyer le texte
        nom = product['nom'].lower()
        description = product['description'].lower()
        categorie = product['categorie'].lower()
        
        # Supprimer les stop words simples
        for stop in FRENCH_STOP_WORDS:
            nom = nom.replace(f' {stop} ', ' ')
            description = description.replace(f' {stop} ', ' ')
        
        return f"{nom} {description} {categorie}"
    
    def fit(self, products: List[Dict]) -> Dict:
        """Entraîner le modèle sur les produits"""
        start_time = time.time()
        
        try:
            # Extraire les descriptions
            descriptions = [self._extract_features(p) for p in products]
            
            # Créer la matrice TF-IDF
            self.product_features = self.tfidf.fit_transform(descriptions)
            self.product_ids = [p['id'] for p in products]
            
            # Stocker les métadonnées
            self.product_categories = {p['id']: p['categorie'] for p in products}
            self.product_prices = {p['id']: p['prix'] for p in products}
            self.product_names = {p['id']: p['nom'] for p in products}
            
            self.is_trained = True
            
            training_time = (time.time() - start_time) * 1000
            
            logger.info(f"✅ Modèle entraîné sur {len(products)} produits")
            logger.info(f"   - {self.product_features.shape[1]} caractéristiques")
            logger.info(f"   - Temps d'entraînement: {training_time:.2f} ms")
            
            return {
                "status": "success",
                "n_products": len(products),
                "n_features": self.product_features.shape[1],
                "training_time_ms": training_time
            }
            
        except Exception as e:
            logger.error(f"❌ Erreur entraînement: {e}")
            raise e
    
    def get_similar_products(self, product_id: int, top_n: int = 5) -> List[Dict]:
        """Trouver des produits similaires (Content-based filtering)"""
        if not self.is_trained:
            return []
        
        if product_id not in self.product_ids:
            return []
        
        idx = self.product_ids.index(product_id)
        similarities = cosine_similarity(
            self.product_features[idx:idx+1], 
            self.product_features
        ).flatten()
        
        similar_idx = np.argsort(similarities)[::-1][1:top_n+1]
        
        return [{
            "product_id": self.product_ids[i],
            "similarity": float(similarities[i]),
            "product_name": self.product_names.get(self.product_ids[i], "")
        } for i in similar_idx if similarities[i] > 0.1]
    
    def _get_period_recommendations(self, hour: int, all_products: List[Dict]) -> List[int]:
        """Recommandations basées sur l'heure (Contextuel)"""
        if hour < 11:  # Matin (6h - 11h)
            return [p['id'] for p in all_products if p['categorie'] == 'petit-dejeuner']
        elif hour < 15:  # Midi (11h - 15h)
            return [p['id'] for p in all_products if p['categorie'] == 'plats']
        else:  # Soir (15h - 23h)
            return [p['id'] for p in all_products if p['categorie'] in ['plats', 'desserts']]
    
    def _get_season_recommendations(self, season: str, all_products: List[Dict]) -> List[int]:
        """Recommandations basées sur la saison (Contextuel)"""
        season_map = {
            'ete': 'boissons-froides',
            'hiver': 'boissons-chaudes',
            'printemps': 'plats',
            'automne': 'plats'
        }
        target_category = season_map.get(season, 'plats')
        return [p['id'] for p in all_products if p['categorie'] == target_category]
    
    def _calculate_category_preferences(self, user_history: List[Dict]) -> Dict[str, int]:
        """Calculer les préférences de catégories (Collaboratif)"""
        category_count = {}
        for product in user_history:
            cat = self.product_categories.get(product['id'], 'plats')
            category_count[cat] = category_count.get(cat, 0) + 1
        return category_count
    
    def _apply_constraints(self, product: Dict, preferences: Optional[Dict] = None,
                           allergies: Optional[List[str]] = None) -> bool:
        """Appliquer les contraintes (stock, allergies, prix, préférences)"""
        # Contrainte 1: Stock disponible
        if product.get('stock', 0) <= 0:
            return False
        
        # Contrainte 2: Allergies
        if allergies:
            description = f"{product['nom']} {product.get('description', '')}".lower()
            if any(allergie.lower() in description for allergie in allergies):
                return False
        
        # Contrainte 3: Prix maximum
        if preferences and preferences.get('prix_max'):
            if product['prix'] > preferences['prix_max']:
                return False
        
        # Contrainte 4: Catégories détestées
        if preferences and preferences.get('categorie_detestee'):
            if product['categorie'] == preferences['categorie_detestee']:
                return False
        
        return True
    
    def predict(self, user_history: List[Dict], all_products: List[Dict],
                popular_products: List[Dict], hour: int, season: str,
                preferences: Optional[Dict] = None,
                allergies: Optional[List[str]] = None) -> List[Dict]:
        """Prédire les meilleures recommandations avec scoring hybride"""
        
        start_time = time.time()
        
        if not self.is_trained:
            logger.warning("⚠️ Modèle non entraîné")
            return []
        
        # Initialisation des scores
        scores = {p['id']: 0 for p in all_products}
        reasons = {p['id']: [] for p in all_products}
        
        # ==================== 1. COLLABORATIVE FILTERING (30%) ====================
        if user_history:
            # Basé sur les catégories préférées
            category_prefs = self._calculate_category_preferences(user_history)
            if category_prefs:
                favorite_category = max(category_prefs, key=category_prefs.get)
                for p in all_products:
                    if p['categorie'] == favorite_category:
                        scores[p['id']] += 30
                        reasons[p['id']].append(f"Vous aimez les {favorite_category} (+30%)")
            
            # Basé sur la similarité avec les derniers produits (Content-based)
            recent_products = user_history[-3:]
            for recent in recent_products:
                similar = self.get_similar_products(recent['id'], 3)
                for sim in similar:
                    if sim['product_id'] in scores:
                        score_bonus = int(sim['similarity'] * 20)
                        scores[sim['product_id']] += score_bonus
                        reasons[sim['product_id']].append(
                            f"Similaire à {recent['nom']} (+{score_bonus}%)"
                        )
        
        # ==================== 2. CONTENT-BASED FILTERING (25%) ====================
        for i, pop in enumerate(popular_products[:5]):
            scores[pop['id']] += 25 - (i * 3)
            reasons[pop['id']].append(f"Tendance du moment (+{25 - (i * 3)}%)")
        
        # ==================== 3. CONTEXTUAL FILTERING (25%) ====================
        # Heure de la journée
        period_products = self._get_period_recommendations(hour, all_products)
        for pid in period_products:
            scores[pid] += 15
            reasons[pid].append("Idéal pour ce moment (+15%)")
        
        # Saison
        season_products = self._get_season_recommendations(season, all_products)
        for pid in season_products:
            scores[pid] += 10
            reasons[pid].append("Parfait pour la saison (+10%)")
        
        # ==================== 4. HYBRID BOOST (20%) ====================
        for pid, score in list(scores.items()):
            if score >= 50:
                scores[pid] += 10
                reasons[pid].append("Recommandation forte (+10%)")
        
        # Filtrer les produits déjà commandés
        ordered_ids = {p['id'] for p in user_history}
        
        # Appliquer les contraintes et générer les résultats
        results = []
        for pid, score in scores.items():
            if pid in ordered_ids:
                continue
            
            product = next((p for p in all_products if p['id'] == pid), None)
            if not product:
                continue
            
            # Appliquer les contraintes
            if not self._apply_constraints(product, preferences, allergies):
                continue
            
            results.append({
                "product_id": pid,
                "score": min(100, score),
                "reason": " • ".join(reasons[pid][:2]) if reasons[pid] else "Recommandé pour vous",
                "product": product
            })
        
        # Trier par score
        results.sort(key=lambda x: x["score"], reverse=True)
        
        # Bonus pour les catégories aimées
        if preferences and preferences.get('categorie_aimee'):
            for rec in results:
                if rec["product"]["categorie"] == preferences["categorie_aimee"]:
                    rec["score"] = min(100, rec["score"] + 15)
                    rec["reason"] += " • Correspond à vos goûts (+15%)"
            
            results.sort(key=lambda x: x["score"], reverse=True)
        
        # Métriques
        latency = (time.time() - start_time) * 1000
        self.request_count += 1
        self.total_latency += latency
        
        precision_at_5 = self._calculate_simulated_precision(results[:5])
        self.precision_history.append(precision_at_5)
        
        logger.info(f"✅ {len(results[:8])} recommandations générées en {latency:.2f} ms")
        logger.info(f"   - Precision@5: {precision_at_5:.1f}%")
        
        return results[:8]
    
    def _calculate_simulated_precision(self, recommendations: List[Dict]) -> float:
        """Calculer la précision simulée (basée sur les scores > 50)"""
        if not recommendations:
            return 0
        relevant = sum(1 for r in recommendations if r["score"] > 50)
        return (relevant / len(recommendations)) * 100
    
    def get_performance_metrics(self) -> Dict:
        """Obtenir les métriques de performance"""
        avg_latency = self.total_latency / self.request_count if self.request_count > 0 else 0
        avg_precision = sum(self.precision_history) / len(self.precision_history) if self.precision_history else 0
        
        return {
            "total_requests": self.request_count,
            "average_latency_ms": round(avg_latency, 2),
            "average_precision_at_5": round(avg_precision, 1),
            "model_status": "trained" if self.is_trained else "untrained",
            "n_products": len(self.product_ids) if self.product_ids else 0
        }
    
    def get_model_info(self) -> Dict:
        """Obtenir des informations sur le modèle"""
        return {
            "is_trained": self.is_trained,
            "n_products": len(self.product_ids) if self.product_ids else 0,
            "n_features": self.product_features.shape[1] if self.product_features is not None else 0,
            "algorithm": "Hybrid: Collaborative + Content-based + Contextual",
            "scoring_weights": {
                "collaborative": "30%",
                "content_based": "25%",
                "contextual": "25%",
                "hybrid_boost": "20%"
            }
        }