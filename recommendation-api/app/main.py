# app/main.py
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import logging
from datetime import datetime

from .models import (
    Product, RecommendationRequest, RecommendationResponse,
    TrainRequest, PerformanceMetrics, UserPreference
)
from .recommender import NEXORRecommender

# Configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Création de l'application
app = FastAPI(
    title="NEXOR Recommendation API",
    description="API de recommandation IA hybride pour NEXOR Restaurant",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instance du modèle
recommender = NEXORRecommender()

# ==================== ENDPOINTS ====================

@app.get("/")
async def root():
    return {
        "service": "NEXOR Recommendation API",
        "status": "running",
        "version": "2.0.0",
        "model": recommender.get_model_info()
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "model_ready": recommender.is_trained
    }

@app.get("/model/info")
async def get_model_info():
    """Obtenir des informations détaillées sur le modèle"""
    return recommender.get_model_info()

@app.get("/model/performance")
async def get_performance():
    """Obtenir les métriques de performance du modèle"""
    return recommender.get_performance_metrics()

@app.post("/train")
async def train_model(request: TrainRequest):
    """Entraîner le modèle sur les produits"""
    try:
        logger.info(f"📥 Entraînement avec {len(request.products)} produits")
        
        products_dict = []
        for p in request.products:
            products_dict.append({
                "id": p.id,
                "nom": p.nom,
                "description": p.description,
                "prix": p.prix,
                "categorie": p.categorie,
                "stock": p.stock
            })
        
        result = recommender.fit(products_dict)
        
        return {
            "status": "success",
            "message": "Modèle entraîné avec succès",
            "details": result
        }
    except Exception as e:
        logger.error(f"Erreur entraînement: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommend", response_model=List[RecommendationResponse])
async def get_recommendations(request: RecommendationRequest):
    """Obtenir des recommandations personnalisées"""
    try:
        logger.info(f"📥 Requête recommandation - User {request.user_id}")
        
        # Convertir les données
        user_history = []
        for p in request.user_history:
            user_history.append({
                "id": p.id,
                "nom": p.nom,
                "description": p.description,
                "prix": p.prix,
                "categorie": p.categorie,
                "stock": p.stock
            })
        
        all_products = []
        for p in request.all_products:
            all_products.append({
                "id": p.id,
                "nom": p.nom,
                "description": p.description,
                "prix": p.prix,
                "categorie": p.categorie,
                "stock": p.stock
            })
        
        popular_products = []
        for p in request.popular_products:
            popular_products.append({
                "id": p.id,
                "nom": p.nom,
                "description": p.description,
                "prix": p.prix,
                "categorie": p.categorie,
                "stock": p.stock
            })
        
        # Préférences utilisateur
        preferences = None
        allergies = None
        if request.preferences:
            preferences = {
                "categorie_aimee": request.preferences.categorie_aimee,
                "categorie_detestee": request.preferences.categorie_detestee,
                "prix_max": request.preferences.prix_max
            }
            allergies = request.preferences.allergenes if request.preferences.allergenes else None
        
        # Vérifier si le modèle est entraîné
        if not recommender.is_trained:
            logger.info("⚠️ Modèle non entraîné, entraînement automatique...")
            recommender.fit(all_products)
        
        # Obtenir les recommandations
        recommendations = recommender.predict(
            user_history=user_history,
            all_products=all_products,
            popular_products=popular_products,
            hour=request.hour,
            season=request.season,
            preferences=preferences,
            allergies=allergies
        )
        
        # Convertir en réponse
        response = []
        for r in recommendations:
            response.append({
                "product_id": r["product_id"],
                "score": r["score"],
                "reason": r["reason"],
                "product": {
                    "id": r["product"]["id"],
                    "nom": r["product"]["nom"],
                    "description": r["product"]["description"],
                    "prix": r["product"]["prix"],
                    "categorie": r["product"]["categorie"],
                    "stock": r["product"]["stock"]
                }
            })
        
        return response
        
    except Exception as e:
        logger.error(f"Erreur recommandation: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))