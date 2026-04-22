// src/pages/produits/CreateProduit.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createProduit, updateProduit, getProduitById } from "../../services/produitService";
import MainLayout from "../../layouts/MainLayout";
import { ArrowLeftIcon, SaveIcon, PackageIcon, AlertTriangleIcon } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

function CreateProduit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    prix: "",
    stock: "",
    seuil_minimum: "10"
  });

  // Vérifier les permissions
  if (!isAdmin && !isSuperAdmin) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full mb-4">
            <AlertTriangleIcon className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Accès refusé</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Seuls les administrateurs peuvent créer ou modifier des produits.
          </p>
        </div>
      </MainLayout>
    );
  }

  useEffect(() => {
    if (id) {
      loadProduit();
    }
  }, [id]);

  const loadProduit = async () => {
    setLoadingData(true);
    try {
      const data = await getProduitById(Number(id));
      console.log("Produit chargé:", data);
      setFormData({
        nom: data.nom || "",
        description: data.description || "",
        prix: data.prix?.toString() || "",
        stock: data.stock?.toString() || "0",
        seuil_minimum: data.seuil_minimum?.toString() || "10"
      });
    } catch (error) {
      console.error("Erreur chargement produit:", error);
      toast.error("Erreur lors du chargement du produit");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.prix) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const prixValue = parseFloat(formData.prix);
    if (isNaN(prixValue) || prixValue <= 0) {
      toast.error("Le prix doit être un nombre positif");
      return;
    }

    const stockValue = parseInt(formData.stock);
    if (isNaN(stockValue) || stockValue < 0) {
      toast.error("Le stock doit être un nombre positif ou zéro");
      return;
    }

    const seuilValue = parseInt(formData.seuil_minimum);
    if (isNaN(seuilValue) || seuilValue < 0) {
      toast.error("Le seuil d'alerte doit être un nombre positif");
      return;
    }

    setLoading(true);
    
    try {
      const produitData = {
        nom: formData.nom,
        description: formData.description,
        prix: prixValue,
        stock: stockValue,
        seuil_minimum: seuilValue
      };
      
      console.log("Envoi des données:", produitData);
      
      if (id) {
        await updateProduit(Number(id), produitData);
        toast.success("✅ Produit modifié avec succès !");
      } else {
        await createProduit(produitData);
        toast.success("✅ Produit créé avec succès !");
      }
      
      navigate("/produits");
    } catch (error: any) {
      console.error("Erreur sauvegarde:", error);
      toast.error(error.response?.data?.message || "❌ Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Toaster position="top-right" />
      
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/produits")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour aux produits
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {id ? "Modifier le produit" : "Créer un nouveau produit"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {id ? "Modifiez les informations du produit et son stock" : "Ajoutez un nouveau produit au catalogue"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Informations produit */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <PackageIcon className="w-5 h-5" />
                Informations produit
              </h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nom du produit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ex: Robot Nettoyeur X1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Description du produit..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Prix (€) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.prix}
                    onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Gestion du stock */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                📦 Gestion du stock
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Quantité en stock
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Nombre d'unités disponibles en stock</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Seuil d'alerte
                  </label>
                  <input
                    type="number"
                    value={formData.seuil_minimum}
                    onChange={(e) => setFormData({ ...formData, seuil_minimum: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="10"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Alerte quand le stock est inférieur ou égal à cette valeur</p>
                </div>
              </div>

              {/* Aperçu du statut stock */}
              {parseInt(formData.stock) > 0 && parseInt(formData.stock) <= parseInt(formData.seuil_minimum) && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-400 flex items-center gap-2">
                    <AlertTriangleIcon className="w-4 h-4" />
                    Attention : Ce produit sera en stock faible dès sa création ({formData.stock} unités, seuil: {formData.seuil_minimum})
                  </p>
                </div>
              )}
              
              {parseInt(formData.stock) === 0 && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangleIcon className="w-4 h-4" />
                    Attention : Ce produit sera en rupture de stock dès sa création
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <SaveIcon className="w-4 h-4" />
                )}
                {loading ? "Enregistrement..." : (id ? "Modifier le produit" : "Créer le produit")}
              </button>
              <button
                type="button"
                onClick={() => navigate("/produits")}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}

export default CreateProduit;