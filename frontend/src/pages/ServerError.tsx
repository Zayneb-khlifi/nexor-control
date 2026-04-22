// src/pages/ServerError.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, RefreshCw, AlertTriangle, WifiOff } from "lucide-react";

function ServerError() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.reload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-gray-900 flex items-center justify-center relative overflow-hidden">
      {/* Effet de fond */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 text-center px-4">
        {/* Code erreur */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="relative"
        >
          <div className="text-8xl sm:text-9xl font-bold text-white mb-4 flex items-center justify-center gap-2">
            <span>5</span>
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="inline-block"
            >
              0
            </motion.span>
            <span>0</span>
          </div>
          <div className="absolute -top-6 -right-6">
            <AlertTriangle className="w-12 h-12 text-yellow-500 animate-pulse" />
          </div>
        </motion.div>

        {/* Message */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl sm:text-3xl font-semibold text-white mb-4"
        >
          Erreur interne du serveur
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 mb-8 max-w-md mx-auto"
        >
          Une erreur inattendue s'est produite. Nos équipes ont été notifiées.
        </motion.p>

        {/* Boutons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20"
          >
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </motion.div>

        {/* Compte à rebours */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-sm text-gray-500"
        >
          Rechargement automatique dans {countdown} secondes...
        </motion.p>

        {/* Conseils */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 p-4 bg-white/5 rounded-xl inline-block"
        >
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <WifiOff className="w-4 h-4" />
            <span>Vérifiez votre connexion internet</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ServerError;