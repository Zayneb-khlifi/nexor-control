// src/pages/profile/PreferencesModal.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, AlertCircle } from "lucide-react";
import { getPreferences, updatePreferences, addAllergie, removeAllergie } from "../../services/preferenceService";
import type { UserPreferences } from "../../services/preferenceService";
import toast from "react-hot-toast";

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const categories = [
  { value: "plats", label: "🍕 Plats" },
  { value: "desserts", label: "🍰 Desserts" },
  { value: "boissons-chaudes", label: "☕ Boissons chaudes" },
  { value: "boissons-froides", label: "🥤 Boissons froides" },
  { value: "petit-dejeuner", label: "🥐 Petit-déjeuner" }
];

export default function PreferencesModal({ isOpen, onClose, onUpdate }: PreferencesModalProps) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    categorie_aimee: null,
    categorie_detestee: null,
    prix_max: 100
  });
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergie, setNewAllergie] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPreferences();
    }
  }, [isOpen]);

  const loadPreferences = async () => {
    try {
      const data = await getPreferences();
      setPreferences(data.preferences);
      setAllergies(data.allergies);
    } catch (error) {
      console.error("Erreur chargement préférences:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updatePreferences(preferences);
      toast.success("✅ Préférences enregistrées");
      onUpdate();
      onClose();
    } catch (error) {
      toast.error("❌ Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllergie = async () => {
    if (!newAllergie.trim()) return;
    try {
      await addAllergie(newAllergie);
      setAllergies([...allergies, newAllergie]);
      setNewAllergie("");
      toast.success(`Allergie à "${newAllergie}" ajoutée`);
    } catch (error) {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleRemoveAllergie = async (ingredient: string) => {
    try {
      await removeAllergie(ingredient);
      setAllergies(allergies.filter(a => a !== ingredient));
      toast.success(`Allergie à "${ingredient}" supprimée`);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mes préférences</h2>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Ces préférences permettent d'affiner nos recommandations IA et d'éviter les allergènes.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catégorie préférée
                </label>
                <select
                  value={preferences.categorie_aimee || ""}
                  onChange={(e) => setPreferences({ ...preferences, categorie_aimee: e.target.value || null })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Aucune préférence --</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catégorie à éviter
                </label>
                <select
                  value={preferences.categorie_detestee || ""}
                  onChange={(e) => setPreferences({ ...preferences, categorie_detestee: e.target.value || null })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Aucune restriction --</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prix maximum par plat (€)
                </label>
                <input
                  type="number"
                  value={preferences.prix_max}
                  onChange={(e) => setPreferences({ ...preferences, prix_max: parseInt(e.target.value) || 100 })}
                  min="0"
                  max="200"
                  step="5"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Allergies alimentaires
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newAllergie}
                    onChange={(e) => setNewAllergie(e.target.value)}
                    placeholder="Ex: gluten, lactose, arachides..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddAllergie()}
                  />
                  <button
                    onClick={handleAddAllergie}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allergies.map((allergie) => (
                    <div key={allergie} className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/20 rounded-full">
                      <span className="text-sm text-red-600 dark:text-red-400">{allergie}</span>
                      <button onClick={() => handleRemoveAllergie(allergie)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {allergies.length === 0 && (
                    <p className="text-sm text-gray-400">Aucune allergie renseignée</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t dark:border-gray-700 flex gap-3">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Enregistrement..." : "Enregistrer les préférences"}
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}