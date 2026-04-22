// src/pages/produits/ProduitsList.tsx
import { useEffect, useState } from "react";
import { getProduits } from "../../services/produitService";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../hooks/useAuth";
import { 
  PlusIcon, 
  PackageIcon, 
  RefreshCwIcon, 
  ShoppingCartIcon,
  Coffee,
  Pizza,
  IceCream,
  Utensils,
  Filter,
  X,
  ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface Produit {
  id: number;
  nom: string;
  description: string;
  prix: number;
  stock: number;
  categorie?: string;
}

const categories = [
  { id: "all", name: "Tous", icon: Utensils },
  { id: "plats", name: "Plats", icon: Pizza },
  { id: "boissons-chaudes", name: "Boissons chaudes", icon: Coffee },
  { id: "boissons-froides", name: "Boissons froides", icon: Coffee },
  { id: "desserts", name: "Desserts", icon: IceCream },
];

const getProduitCategorie = (nom: string): string => {
  const nomLower = nom.toLowerCase();
  if (nomLower.includes("café") || nomLower.includes("thé") || nomLower.includes("chocolat")) return "boissons-chaudes";
  if (nomLower.includes("jus") || nomLower.includes("ice tea") || nomLower.includes("limonade") || nomLower.includes("smoothie")) return "boissons-froides";
  if (nomLower.includes("tiramisu") || nomLower.includes("fondant") || nomLower.includes("crème") || nomLower.includes("tarte")) return "desserts";
  return "plats";
};

function ProduitsList() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [filteredProduits, setFilteredProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategorie, setSelectedCategorie] = useState("all");
  
  // Filtres avancés
  const [showFilters, setShowFilters] = useState(false);
  const [prixMin, setPrixMin] = useState("");
  const [prixMax, setPrixMax] = useState("");
  const [stockMin, setStockMin] = useState("");
  const [showOnlyDispo, setShowOnlyDispo] = useState(false);
  const [sortBy, setSortBy] = useState<"nom" | "prix" | "stock">("nom");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  const navigate = useNavigate();
  const { isAdmin, isSuperAdmin, user } = useAuth();

  const fetchProduits = async () => {
    setLoading(true);
    try {
      const data = await getProduits();
      const produitsAvecCategorie = data.map((p: any) => ({
        ...p,
        categorie: getProduitCategorie(p.nom)
      }));
      setProduits(produitsAvecCategorie);
      setFilteredProduits(produitsAvecCategorie);
    } catch (error) {
      console.error("Erreur chargement produits:", error);
      toast.error("Erreur lors du chargement des produits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduits();
  }, []);

  // Appliquer tous les filtres
  const applyFilters = () => {
    let filtered = [...produits];
    
    // Recherche textuelle
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Catégorie
    if (selectedCategorie !== "all") {
      filtered = filtered.filter(p => p.categorie === selectedCategorie);
    }
    
    // Prix min
    if (prixMin) {
      const min = parseFloat(prixMin);
      if (!isNaN(min)) {
        filtered = filtered.filter(p => p.prix >= min);
      }
    }
    
    // Prix max
    if (prixMax) {
      const max = parseFloat(prixMax);
      if (!isNaN(max)) {
        filtered = filtered.filter(p => p.prix <= max);
      }
    }
    
    // Stock min
    if (stockMin) {
      const min = parseInt(stockMin);
      if (!isNaN(min)) {
        filtered = filtered.filter(p => p.stock >= min);
      }
    }
    
    // Disponibilité
    if (showOnlyDispo) {
      filtered = filtered.filter(p => p.stock > 0);
    }
    
    // Tri
    filtered.sort((a, b) => {
      if (sortBy === "nom") {
        return sortOrder === "asc" ? a.nom.localeCompare(b.nom) : b.nom.localeCompare(a.nom);
      } else if (sortBy === "prix") {
        return sortOrder === "asc" ? a.prix - b.prix : b.prix - a.prix;
      } else {
        return sortOrder === "asc" ? a.stock - b.stock : b.stock - a.stock;
      }
    });
    
    setFilteredProduits(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedCategorie, prixMin, prixMax, stockMin, showOnlyDispo, sortBy, sortOrder, produits]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategorie("all");
    setPrixMin("");
    setPrixMax("");
    setStockMin("");
    setShowOnlyDispo(false);
    setSortBy("nom");
    setSortOrder("asc");
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Rupture", color: "bg-red-100 text-red-800", icon: "🔴" };
    if (stock < 10) return { label: "Stock faible", color: "bg-yellow-100 text-yellow-800", icon: "🟡" };
    return { label: "Disponible", color: "bg-green-100 text-green-800", icon: "🟢" };
  };

  const activeFiltersCount = [
    searchTerm, prixMin, prixMax, stockMin, showOnlyDispo, selectedCategorie !== "all"
  ].filter(Boolean).length;

  return (
    <MainLayout>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🍽️ Notre Carte</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Découvrez nos délicieux plats et boissons
            </p>
          </div>
          {(isAdmin || isSuperAdmin) && (
            <button
              onClick={() => navigate("/produits/create")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition"
            >
              <PlusIcon className="w-5 h-5" />
              Nouveau produit
            </button>
          )}
        </div>
      </div>

      {/* Barre de recherche et bouton filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Rechercher un plat, une boisson, un dessert..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            showFilters ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtres
          {activeFiltersCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Panneau des filtres avancés */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-6 shadow-sm border dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Filtres avancés</h3>
            <button onClick={resetFilters} className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1">
              <X className="w-3 h-3" /> Réinitialiser
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Prix min */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix minimum</label>
              <input
                type="number"
                placeholder="0€"
                value={prixMin}
                onChange={(e) => setPrixMin(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Prix max */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix maximum</label>
              <input
                type="number"
                placeholder="100€"
                value={prixMax}
                onChange={(e) => setPrixMax(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Stock minimum */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock minimum</label>
              <input
                type="number"
                placeholder="0"
                value={stockMin}
                onChange={(e) => setStockMin(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Disponibilité */}
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyDispo}
                  onChange={(e) => setShowOnlyDispo(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Uniquement disponible</span>
              </label>
            </div>
          </div>
          
          {/* Tri */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Trier par :</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="nom">Nom</option>
                <option value="prix">Prix</option>
                <option value="stock">Stock</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50"
              >
                {sortOrder === "asc" ? "↑ Croissant" : "↓ Décroissant"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Catégories */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const count = produits.filter(p => cat.id === "all" ? true : p.categorie === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategorie(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200 ${
                selectedCategorie === cat.id
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                selectedCategorie === cat.id ? "bg-white/20" : "bg-gray-200 dark:bg-gray-600"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Résultat du filtrage */}
      <div className="text-sm text-gray-500 mb-4">
        {filteredProduits.length} produit(s) trouvé(s)
      </div>

      {/* Grille des produits */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredProduits.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <PackageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aucun produit</h3>
          <p className="text-gray-500 mt-1">Aucun produit ne correspond à vos critères</p>
          <button onClick={resetFilters} className="mt-4 text-blue-600 hover:text-blue-700">
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProduits.map((produit) => {
            const stockStatus = getStockStatus(produit.stock);
            
            return (
              <div key={produit.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <div className={`h-1 w-full ${
                  produit.stock === 0 ? "bg-red-500" : 
                  produit.stock < 10 ? "bg-yellow-500" : 
                  "bg-green-500"
                }`} />
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {produit.categorie === "plats" ? "🍕" : 
                         produit.categorie === "boissons-chaudes" ? "☕" :
                         produit.categorie === "boissons-froides" ? "🥤" :
                         produit.categorie === "desserts" ? "🍰" : "🥐"}
                      </span>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{produit.nom}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${stockStatus.color}`}>
                      {stockStatus.icon} {stockStatus.label}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                    {produit.description}
                  </p>

                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Prix</p>
                      <p className="text-xl font-bold text-orange-600">{produit.prix.toFixed(2)}€</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Stock</p>
                      <p className="text-sm font-semibold">{produit.stock} restants</p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/commandes/create?produit=${produit.id}`)}
                    disabled={produit.stock === 0}
                    className={`w-full py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                      produit.stock > 0
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <ShoppingCartIcon className="w-4 h-4" />
                    {produit.stock > 0 ? "Commander" : "Indisponible"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </MainLayout>
  );
}

export default ProduitsList;