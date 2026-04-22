// src/pages/commandes/CreateCommande.tsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { createCommande } from "../../services/commandeService";
import { getProduits } from "../../services/produitService";
import MainLayout from "../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { 
  ArrowLeftIcon, 
  TrashIcon, 
  ShoppingCartIcon, 
  AlertTriangleIcon, 
  CheckCircleIcon,
  Coffee,
  Pizza,
  IceCream,
  Utensils,
  Plus,
  Minus
} from "lucide-react";
import toast from "react-hot-toast";


interface CartItem {
  produit_id: number;
  quantite: number;
  produit: {
    id: number;
    nom: string;
    prix: number;
    description: string;
    stock: number;
  };
}

function CreateCommande() {
  const [produits, setProduits] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientId, setClientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState("all");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const categories = [
    { id: "all", name: "Tous", icon: Utensils },
    { id: "plats", name: "Plats", icon: Pizza },
    { id: "boissons-chaudes", name: "Boissons chaudes", icon: Coffee },
    { id: "boissons-froides", name: "Boissons froides", icon: Coffee },
    { id: "desserts", name: "Desserts", icon: IceCream },
  ];

  const getProduitCategorie = (nom: string): string => {
    const nomLower = nom.toLowerCase();
    if (nomLower.includes("café") || nomLower.includes("thé") || nomLower.includes("chocolat") || nomLower.includes("cappuccino")) return "boissons-chaudes";
    if (nomLower.includes("jus") || nomLower.includes("ice tea") || nomLower.includes("limonade") || nomLower.includes("smoothie") || nomLower.includes("coca") || nomLower.includes("eau")) return "boissons-froides";
    if (nomLower.includes("tiramisu") || nomLower.includes("fondant") || nomLower.includes("crème") || nomLower.includes("tarte") || nomLower.includes("profiterole") || nomLower.includes("mousse") || nomLower.includes("panacotta")) return "desserts";
    if (nomLower.includes("croissant") || nomLower.includes("pain au chocolat") || nomLower.includes("brioche") || nomLower.includes("brunch")) return "petit-dejeuner";
    return "plats";
  };

  useEffect(() => {
    loadProduits();
  }, []);

  useEffect(() => {
    const produitId = searchParams.get("produit");
    if (produitId && produits.length > 0) {
      const produit = produits.find(p => p.id === parseInt(produitId));
      if (produit) {
        addToCart(produit);
        toast.success(`"${produit.nom}" ajouté au panier`);
      }
    }
  }, [produits, searchParams]);

  useEffect(() => {
    if (user?.role === "USER" && user.id) {
      setClientId(user.id.toString());
    }
  }, [user]);

  const loadProduits = async () => {
    try {
      const data = await getProduits();
      console.log("Produits chargés:", data);
      const produitsAvecCategorie = data.map((p: any) => ({
        ...p,
        categorie: getProduitCategorie(p.nom)
      }));
      setProduits(produitsAvecCategorie);
      
      if (data.length === 0) {
        toast.error("Aucun produit disponible");
      }
    } catch (error) {
      console.error("Erreur chargement produits:", error);
      toast.error("Erreur lors du chargement de la carte");
    }
  };

  // Ajouter au panier
  const addToCart = (produit: any) => {
    console.log("Ajout au panier:", produit);
    
    // Vérifier le stock
    if (produit.stock <= 0) {
      toast.error(`"${produit.nom}" n'est plus disponible en stock`);
      return;
    }
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.produit_id === produit.id);
      
      if (existingItem) {
        // Vérifier la quantité disponible
        if (existingItem.quantite + 1 > produit.stock) {
          toast.error(`Stock insuffisant pour "${produit.nom}". Maximum: ${produit.stock}`);
          return prevCart;
        }
        // Augmenter la quantité
        return prevCart.map(item =>
          item.produit_id === produit.id
            ? { ...item, quantite: item.quantite + 1 }
            : item
        );
      } else {
        // Ajouter nouveau produit
        return [...prevCart, {
          produit_id: produit.id,
          quantite: 1,
          produit: {
            id: produit.id,
            nom: produit.nom,
            prix: produit.prix,
            description: produit.description,
            stock: produit.stock
          }
        }];
      }
    });
    
    toast.success(`"${produit.nom}" ajouté au panier`);
  };

  // Retirer du panier
  const removeFromCart = (produitId: number) => {
    setCart(prevCart => prevCart.filter(item => item.produit_id !== produitId));
    const produit = produits.find(p => p.id === produitId);
    if (produit) {
      toast.success(`"${produit.nom}" retiré du panier`);
    }
  };

  // Modifier la quantité
  const updateQuantity = (produitId: number, newQuantity: number) => {
    const produit = produits.find(p => p.id === produitId);
    if (!produit) return;
    
    if (newQuantity < 1) {
      removeFromCart(produitId);
      return;
    }
    
    if (newQuantity > produit.stock) {
      toast.error(`Stock insuffisant pour "${produit.nom}". Maximum: ${produit.stock}`);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.produit_id === produitId
          ? { ...item, quantite: newQuantity }
          : item
      )
    );
  };

  // Vider le panier
  const clearCart = () => {
    setCart([]);
    toast.success("Panier vidé");
  };

  // Calculer le total
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.produit.prix * item.quantite), 0);
  };

  // Valider la commande
  const handleSubmit = async () => {
    if (!clientId) {
      toast.error("Veuillez entrer l'ID du client");
      return;
    }

    if (cart.length === 0) {
      toast.error("Veuillez ajouter au moins un produit");
      return;
    }

    setLoading(true);
    
    try {
      const commandeData = {
        client_id: parseInt(clientId),
        produits: cart.map(item => ({
          produit_id: item.produit_id,
          quantite: item.quantite
        }))
      };
      
      console.log("Envoi commande:", commandeData);
      await createCommande(commandeData);
      toast.success("✅ Commande créée avec succès !");
      setCart([]);
      navigate("/commandes");
      
    } catch (error: any) {
      console.error("Erreur création commande:", error);
      toast.error(error.response?.data?.message || "❌ Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const filteredProduits = selectedCategorie === "all" 
    ? produits 
    : produits.filter(p => p.categorie === selectedCategorie);

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/commandes")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour aux commandes
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panier - Colonne de droite sur desktop */}
          <div className="lg:col-span-1 order-2 lg:order-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm sticky top-24">
              <div className="p-5 border-b dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <ShoppingCartIcon className="w-5 h-5" />
                    Mon panier
                  </h2>
                  {cart.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Vider
                    </button>
                  )}
                </div>
              </div>
              
              <div className="p-5 max-h-96 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCartIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>Votre panier est vide</p>
                    <p className="text-sm">Ajoutez des produits depuis la carte</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.produit_id} className="flex justify-between items-center py-2 border-b">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{item.produit.nom}</p>
                          <p className="text-sm text-gray-500">{item.produit.prix.toFixed(2)}€</p>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => updateQuantity(item.produit_id, item.quantite - 1)}
                              className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200 flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm">{item.quantite}</span>
                            <button
                              onClick={() => updateQuantity(item.produit_id, item.quantite + 1)}
                              className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200 flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{(item.produit.prix * item.quantite).toFixed(2)}€</p>
                          <button
                            onClick={() => removeFromCart(item.produit_id)}
                            className="text-red-500 text-xs hover:text-red-700"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-5 border-t dark:border-gray-700">
                <div className="flex justify-between mb-4">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-orange-600">{calculateTotal().toFixed(2)}€</span>
                </div>
                
                <div className="mb-4">
                  <label className="text-sm font-medium block mb-1">ID Client *</label>
                  <input
                    type="number"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Votre ID client"
                    required
                    disabled={user?.role === "USER"}
                  />
                  {user?.role === "USER" && (
                    <p className="text-xs text-gray-500 mt-1">Vous commandez pour votre compte (ID: {user.id})</p>
                  )}
                </div>
                
                <button
                  onClick={handleSubmit}
                  disabled={loading || cart.length === 0}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Commande en cours...
                    </div>
                  ) : (
                    `Confirmer la commande (${calculateTotal().toFixed(2)}€)`
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Carte des produits - Colonne de gauche */}
          <div className="lg:col-span-2 order-1 lg:order-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">🍽️ Notre Carte</h1>
              <p className="text-gray-600 dark:text-gray-400">Sélectionnez vos plats et boissons</p>
            </div>

            {/* Catégories */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const count = produits.filter(p => cat.id === "all" ? true : p.categorie === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategorie(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                      selectedCategorie === cat.id
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{cat.name}</span>
                    <span className="text-xs">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Produits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProduits.map((produit) => (
                <div key={produit.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{produit.nom}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{produit.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg font-bold text-orange-600">{produit.prix.toFixed(2)}€</span>
                        {produit.stock < 10 && produit.stock > 0 && (
                          <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                            Plus que {produit.stock}
                          </span>
                        )}
                        {produit.stock === 0 && (
                          <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                            Rupture
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(produit)}
                    disabled={produit.stock === 0}
                    className={`w-full mt-3 py-2 rounded-lg transition text-sm flex items-center justify-center gap-2 ${
                      produit.stock > 0
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    {produit.stock > 0 ? "Ajouter au panier" : "Indisponible"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default CreateCommande;