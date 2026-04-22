# app/models.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Product(BaseModel):
    id: int
    nom: str
    description: str
    prix: float
    categorie: str
    stock: int

class UserPreference(BaseModel):
    categorie_aimee: Optional[str] = None
    categorie_detestee: Optional[str] = None
    prix_max: Optional[float] = 100
    allergenes: Optional[List[str]] = []

class UserHistory(BaseModel):
    user_id: int
    products: List[Product]
    preferences: Optional[UserPreference] = None

class RecommendationRequest(BaseModel):
    user_id: int
    user_history: List[Product]
    all_products: List[Product]
    popular_products: List[Product]
    hour: int
    season: str
    preferences: Optional[UserPreference] = None

class RecommendationResponse(BaseModel):
    product_id: int
    score: float
    reason: str
    product: Product

class TrainRequest(BaseModel):
    products: List[Product]

class PerformanceMetrics(BaseModel):
    precision_at_5: float
    precision_at_10: float
    average_latency_ms: float
    total_requests: int
    timestamp: str