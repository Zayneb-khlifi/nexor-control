// src/components/dashboard/Recipes.tsx
import { motion } from "framer-motion";
import { Clock, Users, ChefHat, Heart } from "lucide-react";

interface Recipe {
  id: number;
  nom: string;
  description: string;
  temps: string;
  personnes: number;
  difficulte: "Facile" | "Moyen" | "Difficile";
  image?: string;
}

const recipes: Recipe[] = [
  {
    id: 1,
    nom: "Salade César au Poulet",
    description: "Une salade fraîche et savoureuse avec des morceaux de poulet grillé, parmesan et croûtons.",
    temps: "15 min",
    personnes: 2,
    difficulte: "Facile"
  },
  {
    id: 2,
    nom: "Boeuf Bourguignon",
    description: "Un plat traditionnel français mijoté longuement pour un résultat tendre et parfumé.",
    temps: "3h",
    personnes: 6,
    difficulte: "Moyen"
  },
  {
    id: 3,
    nom: "Tarte Tatin",
    description: "Une délicieuse tarte aux pommes caramélisées, servie tiède avec une boule de glace vanille.",
    temps: "1h",
    personnes: 8,
    difficulte: "Moyen"
  },
  {
    id: 4,
    nom: "Poké Bowl Saumon",
    description: "Bol healthy composé de riz, saumon frais, avocat, concombre et sauce soja.",
    temps: "20 min",
    personnes: 2,
    difficulte: "Facile"
  }
];

export default function Recipes() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {recipes.map((recipe, index) => (
        <motion.div
          key={recipe.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
        >
          <div className="relative h-40 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 flex items-center justify-center">
            <ChefHat className="w-12 h-12 text-gray-400" />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{recipe.nom}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{recipe.description}</p>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {recipe.temps}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {recipe.personnes} pers.
              </div>
              <div className={`px-2 py-0.5 rounded-full ${
                recipe.difficulte === "Facile" ? "bg-green-100 text-green-600" :
                recipe.difficulte === "Moyen" ? "bg-yellow-100 text-yellow-600" :
                "bg-red-100 text-red-600"
              }`}>
                {recipe.difficulte}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}