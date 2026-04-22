// src/pages/stock/StockList.tsx
import { useEffect, useState } from "react";
import { getStocks, updateStock, setStockAlerte } from "../../services/stockService";
import { getProduits } from "../../services/produitService";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../hooks/useAuth";
import { RefreshCwIcon, TrendingUpIcon, TrendingDownIcon, AlertTriangleIcon, PackageIcon, EditIcon, PlusIcon, MinusIcon, SaveIcon } from "lucide-react";
import toast from "react-hot-toast";

interface StockItem {
  id: number;
  produit_id: number;
  produit_nom: string;
  quantite: number;
  seuil_minimum: number;
  prix: number;
}

function StockList() {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingStock, setEditingStock] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState<string>("");
  const [editOperation, setEditOperation] = useState<'add' | 'remove' | 'set'>('add');
  const [editingSeuil, setEditingSeuil] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'rupture' | 'faible' | 'ok'>('all');
  const { isAdmin, isSuperAdmin } = useAuth();

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
            Cette page est réservée aux administrateurs.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Seuls les administrateurs peuvent gérer les stocks.
          </p>
        </div>
      </MainLayout>
    );
  }

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const stocksData = await getStocks();
      const produitsData = await getProduits();
      
      const stocksAvecNoms = stocksData.map((stock: any) => ({
        ...stock,
        produit_nom: produitsData.find((p: any) => p.id === stock.produit_id)?.nom || "Inconnu",
        prix: produitsData.find((p: any) => p.id === stock.produit_id)?.prix || 0
      }));
      
      setStocks(stocksAvecNoms);
    } catch (error) {
      console.error("Erreur chargement stocks:", error);
      toast.error("Erreur lors du chargement des stocks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  // Fonction pour ajouter du stock (même quand il est à 0)
  const handleAddStock = async (produitId: number) => {
    const quantite = prompt("Entrez la quantité à ajouter au stock :", "10");
    if (quantite && !isNaN(parseInt(quantite)) && parseInt(quantite) > 0) {
      try {
        await updateStock(produitId, parseInt(quantite), 'add');
        toast.success(`✅ +${quantite} unités ajoutées au stock`);
        fetchStocks();
        setEditingStock(null);
      } catch (error) {
        console.error("Erreur ajout stock:", error);
      }
    } else {
      toast.error("Veuillez entrer une quantité valide");
    }
  };

  // Fonction pour retirer du stock
  const handleRemoveStock = async (produitId: number, quantiteActuelle: number) => {
    const quantite = prompt("Entrez la quantité à retirer du stock :", "1");
    if (quantite && !isNaN(parseInt(quantite)) && parseInt(quantite) > 0) {
      if (parseInt(quantite) > quantiteActuelle) {
        toast.error(`Impossible de retirer ${quantite} unités. Stock actuel: ${quantiteActuelle}`);
        return;
      }
      try {
        await updateStock(produitId, parseInt(quantite), 'remove');
        toast.success(`✅ -${quantite} unités retirées du stock`);
        fetchStocks();
        setEditingStock(null);
      } catch (error) {
        console.error("Erreur retrait stock:", error);
      }
    } else {
      toast.error("Veuillez entrer une quantité valide");
    }
  };

  // Fonction pour définir le stock manuellement
  const handleSetStock = async (produitId: number) => {
    const quantite = prompt("Entrez la nouvelle quantité en stock :", "0");
    if (quantite && !isNaN(parseInt(quantite)) && parseInt(quantite) >= 0) {
      try {
        await updateStock(produitId, parseInt(quantite), 'set');
        toast.success(`✅ Stock défini à ${quantite} unités`);
        fetchStocks();
        setEditingStock(null);
      } catch (error) {
        console.error("Erreur définition stock:", error);
      }
    } else {
      toast.error("Veuillez entrer une quantité valide (0 ou plus)");
    }
  };

  const handleSetAlerte = async (produitId: number, currentSeuil: number) => {
    const newSeuil = prompt("Entrez le seuil d'alerte (nombre d'unités minimum) :", currentSeuil.toString());
    if (newSeuil && !isNaN(parseInt(newSeuil)) && parseInt(newSeuil) >= 0) {
      try {
        await setStockAlerte(produitId, parseInt(newSeuil));
        toast.success(`🔔 Seuil d'alerte configuré à ${newSeuil} unités`);
        fetchStocks();
        setEditingSeuil(null);
      } catch (error) {
        console.error("Erreur configuration alerte:", error);
      }
    } else {
      toast.error("Veuillez entrer un seuil valide");
    }
  };

  const getStockStatus = (quantite: number, seuil: number) => {
    if (quantite === 0) return { label: "Rupture de stock", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", icon: AlertTriangleIcon, urgent: true };
    if (quantite <= seuil) return { label: "Stock faible", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", icon: AlertTriangleIcon, urgent: false };
    if (quantite < 20) return { label: "Stock moyen", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400", icon: null, urgent: false };
    return { label: "Stock OK", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", icon: null, urgent: false };
  };

  // Filtrage des stocks
  const filteredStocks = stocks.filter(stock => {
    if (filterStatus === 'rupture') return stock.quantite === 0;
    if (filterStatus === 'faible') return stock.quantite > 0 && stock.quantite <= stock.seuil_minimum;
    if (filterStatus === 'ok') return stock.quantite > stock.seuil_minimum;
    return true;
  });

  const totalValeur = stocks.reduce((sum, s) => sum + (s.quantite * s.prix), 0);
  const totalUnites = stocks.reduce((sum, s) => sum + s.quantite, 0);
  const stockRupture = stocks.filter(s => s.quantite === 0).length;
  const stockFaible = stocks.filter(s => s.quantite > 0 && s.quantite <= s.seuil_minimum).length;

  return (
    <MainLayout>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des stocks</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez les niveaux de stock et les alertes
            </p>
          </div>
          <button
            onClick={fetchStocks}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 transition"
            disabled={loading}
          >
            <RefreshCwIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Rafraîchir
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Total produits en stock</p>
          <p className="text-2xl font-bold">{stocks.filter(s => s.quantite > 0).length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
          <p className="text-gray-500 text-sm">Stock faible</p>
          <p className="text-2xl font-bold text-yellow-600">{stockFaible}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-red-500">
          <p className="text-gray-500 text-sm">Rupture de stock</p>
          <p className="text-2xl font-bold text-red-600">{stockRupture}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Valeur totale du stock</p>
          <p className="text-2xl font-bold text-green-600">{totalValeur.toLocaleString()}€</p>
          <p className="text-xs text-gray-400">{totalUnites} unités</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg transition ${
            filterStatus === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          Tous ({stocks.length})
        </button>
        <button
          onClick={() => setFilterStatus('rupture')}
          className={`px-4 py-2 rounded-lg transition ${
            filterStatus === 'rupture' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          ⚠️ Rupture ({stockRupture})
        </button>
        <button
          onClick={() => setFilterStatus('faible')}
          className={`px-4 py-2 rounded-lg transition ${
            filterStatus === 'faible' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          📉 Stock faible ({stockFaible})
        </button>
        <button
          onClick={() => setFilterStatus('ok')}
          className={`px-4 py-2 rounded-lg transition ${
            filterStatus === 'ok' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          ✅ Stock OK ({stocks.filter(s => s.quantite > s.seuil_minimum).length})
        </button>
      </div>

      {/* Tableau des stocks */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800">
          <h2 className="font-semibold text-gray-700 dark:text-gray-300">Inventaire des produits</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredStocks.length === 0 ? (
          <div className="text-center py-12">
            <PackageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aucun stock trouvé</h3>
            <p className="text-gray-500 mt-1">Aucun produit ne correspond au filtre sélectionné</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix unitaire</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seuil d'alerte</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valeur totale</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredStocks.map((stock) => {
                  const status = getStockStatus(stock.quantite, stock.seuil_minimum);
                  const StatusIcon = status.icon;
                  const valeurTotale = stock.quantite * stock.prix;
                  
                  return (
                    <tr key={stock.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition ${status.urgent ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{stock.produit_nom}</div>
                        <div className="text-xs text-gray-500">ID: {stock.produit_id}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{stock.prix}€</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${stock.quantite === 0 ? 'text-red-600' : 'text-gray-800 dark:text-white'}`}>
                            {stock.quantite}
                          </span>
                          <span className="text-xs text-gray-400">unités</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{stock.seuil_minimum} unités</span>
                          <button
                            onClick={() => handleSetAlerte(stock.produit_id, stock.seuil_minimum)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition"
                            title="Modifier le seuil d'alerte"
                          >
                            <EditIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                          {StatusIcon && <StatusIcon className="w-3 h-3" />}
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{valeurTotale.toLocaleString()}€</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {/* 🔥 Bouton AJOUTER - disponible même en rupture */}
                          <button
                            onClick={() => handleAddStock(stock.produit_id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs font-medium"
                            title="Ajouter du stock"
                          >
                            <PlusIcon className="w-3 h-3" />
                            Ajouter
                          </button>
                          
                          {/* Bouton RETIRER - désactivé si stock = 0 */}
                          <button
                            onClick={() => handleRemoveStock(stock.produit_id, stock.quantite)}
                            disabled={stock.quantite === 0}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg transition text-xs font-medium ${
                              stock.quantite > 0
                                ? 'bg-orange-600 text-white hover:bg-orange-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            title={stock.quantite === 0 ? "Stock vide - impossible de retirer" : "Retirer du stock"}
                          >
                            <MinusIcon className="w-3 h-3" />
                            Retirer
                          </button>
                          
                          {/* Bouton DÉFINIR - pour définir une quantité exacte */}
                          <button
                            onClick={() => handleSetStock(stock.produit_id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-medium"
                            title="Définir la quantité exacte"
                          >
                            <SaveIcon className="w-3 h-3" />
                            Définir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section d'aide */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <h3 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">💡 Gestion du stock</h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• <strong>Ajouter</strong> : Augmente le stock (peut être utilisé pour réapprovisionner un produit en rupture)</li>
          <li>• <strong>Retirer</strong> : Diminue le stock (désactivé si le stock est à 0)</li>
          <li>• <strong>Définir</strong> : Permet de définir une quantité exacte (utile pour corriger le stock)</li>
          <li>• <strong>Seuil d'alerte</strong> : Configure le niveau à partir duquel le stock est considéré comme "faible"</li>
        </ul>
      </div>
    </MainLayout>
  );
}

export default StockList;