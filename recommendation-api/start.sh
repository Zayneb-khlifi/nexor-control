#!/bin/bash
# start.sh

echo "🚀 Démarrage de l'API de recommandation NEXOR..."
echo "📦 Installation des dépendances..."
pip install -r requirements.txt

echo "🎯 Lancement du serveur FastAPI..."
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000