// src/pages/NotFound.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search, Bot } from "lucide-react";

function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
      {/* Effet de fond animé */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Robot 3D effect */}
      <motion.div
        animate={{
          x: (mousePosition.x - window.innerWidth / 2) / 50,
          y: (mousePosition.y - window.innerHeight / 2) / 50,
        }}
        transition={{ type: "spring", damping: 30 }}
        className="absolute top-1/4 right-1/4 opacity-10"
      >
        <Bot className="w-64 h-64 text-white" />
      </motion.div>

      <div className="relative z-10 text-center px-4">
        {/* Code erreur */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="text-8xl sm:text-9xl font-bold text-white mb-4"
        >
          4
          <span className="inline-block animate-bounce">0</span>
          4
        </motion.div>

        {/* Message */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl sm:text-3xl font-semibold text-white mb-4"
        >
          Oups ! Page non trouvée
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 mb-8 max-w-md mx-auto"
        >
          La page que vous recherchez n'existe pas ou a été déplacée.
        </motion.p>

        {/* Boutons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Page précédente
          </button>
        </motion.div>

        {/* Search suggestion */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-sm text-gray-400">
            <Search className="w-4 h-4" />
            <span>Vous cherchez quelque chose de spécifique ?</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default NotFound;