// src/components/dashboard/MLMetricsDashboard.tsx
import { useEffect, useState } from "react";
import { Activity, Zap, TrendingUp, Cpu, Server } from "lucide-react";
import mlRecommendationService from "../../services/mlRecommendationService";

export default function MLMetricsDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      const data = await mlRecommendationService.getPerformanceMetrics();
      setMetrics(data);
      setLoading(false);
    };
    loadMetrics();
    
    const interval = setInterval(loadMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Cpu className="w-4 h-4 text-purple-500" />
        Performance du modèle IA
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap className="w-3 h-3 text-purple-500" />
            <span className="text-xs text-gray-500">Latence moyenne</span>
          </div>
          <p className="text-xl font-bold text-purple-600">
            {metrics.average_latency_ms} ms
          </p>
          <p className="text-xs text-gray-400">Objectif: &lt;200ms</p>
        </div>
        
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-xs text-gray-500">Precision@5</span>
          </div>
          <p className="text-xl font-bold text-green-600">
            {metrics.average_precision_at_5}%
          </p>
          <p className="text-xs text-gray-400">Taux d'acceptation</p>
        </div>
      </div>
      
      <div className="text-center pt-3 border-t dark:border-gray-700">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Modèle: Hybride ML</span>
          <span>Requêtes: {metrics.total_requests}</span>
        </div>
      </div>
    </div>
  );
}