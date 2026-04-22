// src/App.tsx
import ErrorBoundary from "./components/ErrorBoundary";
import AppRoutes from "./routes/AppRoutes";
import { useEffect } from "react";
import mlRecommendationService from "./services/mlRecommendationService";


function App() {
 useEffect(() => {
    // Entraîner le modèle ML au démarrage
    const initML = async () => {
      const available = await mlRecommendationService.healthCheck();
      if (available) {
        console.log("🚀 API ML disponible, entraînement du modèle...");
        await mlRecommendationService.trainModel();
      } else {
        console.log("⚠️ API ML non disponible, recommandations désactivées");
      }
    };
    initML();
  }, []);

  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}

export default App;