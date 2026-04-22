// backend/src/controllers/stockController.js
const { Stock, Produit } = require("../models");
const { createLog } = require("../services/logService");

// 🔹 LISTER TOUS LES STOCKS
exports.getStocks = async (req, res) => {
  try {
    console.log("📡 Récupération des stocks...");
    
    const stocks = await Stock.findAll({
      include: [
        { 
          model: Produit, 
          attributes: ["id_produit", "nom", "prix_unitaire"] 
        }
      ],
      order: [["produit_id", "ASC"]]
    });
    
    const resultats = stocks.map(s => ({
      id: s.id_stock,
      produit_id: s.produit_id,
      produit_nom: s.Produit ? s.Produit.nom : "Inconnu",
      quantite: s.quantite_disponible,
      seuil_minimum: s.seuil_minimum,
      prix: s.Produit ? parseFloat(s.Produit.prix_unitaire) : 0
    }));
    
    console.log(`✅ ${resultats.length} stocks trouvés`);
    res.json(resultats);
    
  } catch (error) {
    console.error("❌ Erreur getStocks:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 RÉCUPÉRER LE STOCK D'UN PRODUIT
exports.getStockByProduitId = async (req, res) => {
  try {
    const { produitId } = req.params;
    
    const stock = await Stock.findOne({
      where: { produit_id: produitId },
      include: [
        { 
          model: Produit, 
          attributes: ["id_produit", "nom", "prix_unitaire"] 
        }
      ]
    });
    
    if (!stock) {
      return res.status(404).json({ message: "Stock non trouvé pour ce produit" });
    }
    
    res.json({
      id: stock.id_stock,
      produit_id: stock.produit_id,
      produit_nom: stock.Produit ? stock.Produit.nom : "Inconnu",
      quantite: stock.quantite_disponible,
      seuil_minimum: stock.seuil_minimum,
      prix: stock.Produit ? parseFloat(stock.Produit.prix_unitaire) : 0
    });
    
  } catch (error) {
    console.error("❌ Erreur getStockByProduitId:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 METTRE À JOUR LE STOCK
exports.updateStock = async (req, res) => {
  try {
    const { produitId } = req.params;
    const { quantite, operation } = req.body;
    
    console.log("📥 Mise à jour stock:", { produitId, quantite, operation });
    
    // Vérifier que le produit existe
    const produit = await Produit.findByPk(produitId);
    if (!produit) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    
    // Trouver ou créer le stock
    let stock = await Stock.findOne({ where: { produit_id: produitId } });
    
    if (!stock) {
      stock = await Stock.create({ 
        produit_id: produitId, 
        quantite_disponible: 0,
        seuil_minimum: 10
      });
      console.log("📦 Nouvelle entrée stock créée");
    }
    
    let nouvelleQuantite = stock.quantite_disponible;
    let message = "";
    
    switch (operation) {
      case 'add':
        nouvelleQuantite += quantite;
        message = `Ajout de ${quantite} unités`;
        break;
      case 'remove':
        if (stock.quantite_disponible - quantite < 0) {
          return res.status(400).json({ 
            message: "Quantité insuffisante en stock",
            disponible: stock.quantite_disponible,
            demande: quantite
          });
        }
        nouvelleQuantite -= quantite;
        message = `Retrait de ${quantite} unités`;
        break;
      case 'set':
        nouvelleQuantite = quantite;
        message = `Stock défini à ${quantite} unités`;
        break;
      default:
        return res.status(400).json({ 
          message: "Opération invalide. Utilisez 'add', 'remove' ou 'set'" 
        });
    }
    
    stock.quantite_disponible = nouvelleQuantite;
    await stock.save();
    
    console.log(`✅ Stock mis à jour: ${message} -> Nouveau stock: ${nouvelleQuantite}`);
    
    await createLog(req.user?.id, `Mise à jour stock produit #${produitId}: ${message}`, req.ip);
    
    // Vérifier l'alerte de stock bas
    const isAlerte = nouvelleQuantite <= stock.seuil_minimum;
    if (isAlerte && nouvelleQuantite > 0) {
      console.log(`⚠️ Alerte stock bas pour produit #${produitId}: ${nouvelleQuantite} unités (seuil: ${stock.seuil_minimum})`);
    } else if (nouvelleQuantite === 0) {
      console.log(`⚠️ Rupture de stock pour produit #${produitId}`);
    }
    
    res.json({ 
      message: "Stock mis à jour avec succès", 
      stock: {
        produit_id: stock.produit_id,
        produit_nom: produit.nom,
        quantite: stock.quantite_disponible,
        seuil: stock.seuil_minimum,
        alerte: isAlerte
      }
    });
    
  } catch (error) {
    console.error("❌ Erreur updateStock:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 CONFIGURER UNE ALERTE DE STOCK
exports.setStockAlerte = async (req, res) => {
  try {
    const { produitId, seuil } = req.body;
    
    console.log("📥 Configuration alerte stock:", { produitId, seuil });
    
    if (!produitId || seuil === undefined) {
      return res.status(400).json({ message: "produitId et seuil sont requis" });
    }
    
    // Vérifier que le produit existe
    const produit = await Produit.findByPk(produitId);
    if (!produit) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    
    // Trouver ou créer le stock
    let stock = await Stock.findOne({ where: { produit_id: produitId } });
    
    if (!stock) {
      stock = await Stock.create({ 
        produit_id: produitId, 
        quantite_disponible: 0,
        seuil_minimum: seuil
      });
    } else {
      stock.seuil_minimum = seuil;
      await stock.save();
    }
    
    console.log(`✅ Seuil d'alerte configuré à ${seuil} unités pour ${produit.nom}`);
    
    res.json({ 
      message: "Alerte configurée avec succès", 
      seuil: stock.seuil_minimum,
      produit: produit.nom
    });
    
  } catch (error) {
    console.error("❌ Erreur setStockAlerte:", error);
    res.status(500).json({ error: error.message });
  }
};