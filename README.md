# 🤖 NEXOR CONTROL - Robot Fleet Manager

Plateforme web complète de supervision et gestion intelligente de flotte de robots, avec système de commandes, gestion des stocks, fidélisation client et recommandations IA.

---

## À propos du projet

**NEXOR CONTROL** est une plateforme web développée dans le cadre d’un projet de fin d’études (PFE).
Elle permet de superviser et gérer une flotte de robots en temps réel tout en intégrant plusieurs modules métier avancés.

### Fonctionnalités clés :

* Supervision temps réel des robots
* Gestion complète des commandes
* Gestion des produits et des stocks
* Système de fidélité (points, badges, récompenses)
* Recommandation intelligente basée sur l’IA

---

## Objectifs du projet

| Objectif                  | Description                                |
| ------------------------- | ------------------------------------------ |
| Supervision temps réel | Suivi des robots (statut, batterie, position) |
| Gestion des commandes  | Création, validation et suivi des commandes   |
| Gestion de stock       | Suivi intelligent des produits et alertes     |
| Fidélisation client    | Points, badges, récompenses                   |
| IA                     | Recommandations personnalisées                |
| UI moderne             | Interface responsive et intuitive             |

---

## Architecture technique

```text
Frontend (React + TypeScript)
        │
        │ HTTP / WebSocket
        ▼
Backend (Node.js + Express)
        │
 ┌──────┼───────────────┐
 ▼      ▼               ▼
PostgreSQL     API IA (FastAPI)     MQTT Broker
```

---

## Fonctionnalités principales

### Authentification & Sécurité

* JWT Authentication
* Gestion des rôles (USER / ADMIN / SUPERADMIN)
* Mots de passe sécurisés avec bcrypt

---

### Gestion des robots

* CRUD complet
* Suivi du statut et batterie
* Tracking en temps réel (Socket.io)
* Carte interactive

---

### Gestion des commandes

* Panier dynamique
* Validation admin
* Assignation automatique de robots
* Suivi des états des commandes

---

### Produits & Stock

* Catalogue produits
* Recherche et filtres
* Gestion des stocks en temps réel
* Alertes de seuil minimum

---

### Système de fidélité

* 1€ = 1 point
* Niveaux : Bronze → Argent → Or → Platine
* Récompenses et badges

---

### Intelligence Artificielle

* Recommandation hybride :

  * Collaborative
  * Content-based
  * Contextuelle
* Algorithmes : TF-IDF + Cosine Similarity
* Latence < 10ms

---

### Supervision & Logs

* Dashboard temps réel
* Historique des actions
* Alertes système

---

## Technologies utilisées

### Backend

* Node.js
* Express.js
* PostgreSQL
* Sequelize
* JWT
* Socket.io
* MQTT
* bcrypt

### Frontend

* React
* TypeScript
* Vite
* TailwindCSS
* Framer Motion
* Recharts
* Leaflet
* Axios

### IA

* Python
* FastAPI
* scikit-learn
* Pandas
* NumPy

---

## Base de données (extrait)

```sql
users(id, nom, email, password, role)
robots(id, nom, statut, batterie, localisation)
produits(id, nom, prix)
stock(id, produit_id, quantite)
commandes(id, statut, client_id, robot_id)
```

---

## Installation & démarrage

### Prérequis

* Node.js 22+
* PostgreSQL 15+
* Python 3.10+

---

### Installation

```bash
# Clone repo
git clone https://github.com/your-username/nexor-control.git
cd nexor-control
```

---

### Backend

```bash
cd backend
npm install
npm run dev
```

---
# nexor-control
Robot Fleet Manager platform with real-time monitoring, orders, stock, loyalty system and AI recommendations.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

### API IA

```bash
cd recommendation-api
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## Roadmap

* [ ] Authentification complète
* [ ] Dashboard temps réel
* [ ] Intégration MQTT
* [ ] Système de recommandation IA
* [ ] UI complète

---

## Collaboration

Ce projet est réalisé en collaboration :

*  Full-Stack Developer
*  DevOps/Cloud Engineer
*  AI Developer

---

## Licence

MIT License

---

##  Auteur

Projet réalisé dans le cadre d’un **PFE (Projet de Fin d'Études)**
🎓 Spécialité : Informatique / Génie Logiciel / Cloud 

---
