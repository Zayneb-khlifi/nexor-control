// src/components/dashboard/FeaturedProducts.tsx
import { motion } from "framer-motion";
import { Package, Star, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Product {
  id: number;
  nom: string;
  description: string;
  prix: number;
  stock: number;
  image?: string;
  rating?: number;
}

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const navigate = useNavigate();

  const topProducts = products.slice(0, 4);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {topProducts.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
          onClick={() => navigate(`/produits`)}
        >
          <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-400" />
            {product.rating && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
                <Star className="w-3 h-3 fill-current" />
                {product.rating}
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{product.nom}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{product.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-blue-600">{product.prix}€</span>
              <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-1">
                <ShoppingCart className="w-3 h-3" /> Commander
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}