// src/components/dashboard/SpecialOffers.tsx
import { motion } from "framer-motion";
import { Gift, Tag, Clock } from "lucide-react";

interface Offer {
  id: number;
  title: string;
  description: string;
  discount: number;
  expiresIn: string;
}

const offers: Offer[] = [
  {
    id: 1,
    title: "Livraison gratuite",
    description: "Sur toutes les commandes de plus de 50€",
    discount: 0,
    expiresIn: "2 jours"
  },
  {
    id: 2,
    title: "-20% sur votre première commande",
    description: "Code promo : BIENVENUE20",
    discount: 20,
    expiresIn: "5 jours"
  },
  {
    id: 3,
    title: "Double points fidélité",
    description: "Sur tous les produits cette semaine",
    discount: 0,
    expiresIn: "7 jours"
  }
];

export default function SpecialOffers() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {offers.map((offer, index) => (
        <motion.div
          key={offer.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg p-5 text-white"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {offer.discount > 0 ? <Tag className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
            </div>
            <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
              <Clock className="w-3 h-3" />
              {offer.expiresIn}
            </div>
          </div>
          <h3 className="text-lg font-bold mb-1">{offer.title}</h3>
          <p className="text-sm text-white/90 mb-3">{offer.description}</p>
          {offer.discount > 0 && (
            <div className="text-2xl font-bold">{offer.discount}%</div>
          )}
        </motion.div>
      ))}
    </div>
  );
}