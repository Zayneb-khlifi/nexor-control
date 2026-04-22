// backend/src/controllers/produitController.js
const { Produit, Stock } = require("../models");
const { createLog } = require("../services/logService");
const RedisService = require('../services/redisService');


// 🔹 LISTER TOUS LES PRODUITS

exports.getProduits = async (req, res) => {
  try {
    console.log("📡 Récupération des produits...");
    
    // Récupérer tous les produits
    const produits = await Produit.findAll({
      order: [["nom", "ASC"]]
    });
    
    console.log(`📦 ${produits.length} produits trouvés en base`);
    
    // Récupérer les stocks
    const stocks = await Stock.findAll();
    const stockMap = {};
    stocks.forEach(s => {
      stockMap[s.produit_id] = s.quantite_disponible;
    });
    
    // Formater la réponse
    const resultats = produits.map(p => ({
      id: p.id_produit,
      nom: p.nom,
      description: p.description,
      prix: parseFloat(p.prix_unitaire),
      stock: stockMap[p.id_produit] || 0
    }));
    
    console.log(`✅ ${resultats.length} produits formatés`);
    console.log("Premier produit:", resultats[0]);
    
    res.json(resultats);
    
  } catch (error) {
    console.error("❌ Erreur getProduits:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 RÉCUPÉRER UN PRODUIT PAR ID
exports.getProduitById = async (req, res) => {
  try {
    const produitId = req.params.id;
    console.log("📡 Récupération produit ID:", produitId);
    
    const produit = await Produit.findByPk(produitId);
    
    if (!produit) {
      return res.status(404).json({ message: "Produit introuvable" });
    }
    
    // Récupérer le stock associé
    const stock = await Stock.findOne({ where: { produit_id: produit.id_produit } });
    
    const resultat = {
      id: produit.id_produit,
      nom: produit.nom,
      description: produit.description,
      prix: parseFloat(produit.prix_unitaire),
      stock: stock ? stock.quantite_disponible : 0,
      seuil_minimum: stock ? stock.seuil_minimum : 10
    };
    
    console.log("✅ Produit trouvé:", resultat);
    res.json(resultat);
    
  } catch (error) {
    console.error("❌ Erreur getProduitById:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 CRÉER UN PRODUIT
exports.createProduit = async (req, res) => {
  try {
    const { nom, description, prix, stock = 0, seuil_minimum = 10 } = req.body;
    
    console.log("📥 Création produit:", { nom, description, prix, stock, seuil_minimum });
    
    if (!nom || !prix) {
      return res.status(400).json({ message: "Nom et prix sont requis" });
    }
    
    // Créer le produit
    const produit = await Produit.create({ 
      nom, 
      description, 
      prix_unitaire: prix
    });
    
    console.log("✅ Produit créé, ID:", produit.id_produit);
    
    // Créer l'entrée stock associée
    await Stock.create({
      produit_id: produit.id_produit,
      quantite_disponible: stock,
      seuil_minimum: seuil_minimum
    });
    
    console.log("✅ Stock créé pour produit ID:", produit.id_produit);
    
    await createLog(req.user?.id, `Création produit "${produit.nom}"`, req.ip);

     await RedisService.invalidateCache('produits:*');
    res.status(201).json({ 
      message: "Produit créé avec succès", 
      produit: {
        id: produit.id_produit,
        nom: produit.nom,
        description: produit.description,
        prix: parseFloat(produit.prix_unitaire),
        stock: stock,
        seuil_minimum: seuil_minimum
      }
    });
    
    
  } catch (error) {
    console.error("❌ Erreur createProduit:", error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

// 🔹 MODIFIER UN PRODUIT
exports.updateProduit = async (req, res) => {
  try {
    const produitId = req.params.id;
    const { nom, description, prix, stock, seuil_minimum } = req.body;
    
    console.log("📥 Modification produit ID:", produitId);
    console.log("Données reçues:", { nom, description, prix, stock, seuil_minimum });
    
    // Vérifier que le produit existe
    const produit = await Produit.findByPk(produitId);
    
    if (!produit) {
      console.log("❌ Produit non trouvé ID:", produitId);
      return res.status(404).json({ message: "Produit introuvable" });
    }
    
    // Mettre à jour le produit
    if (nom !== undefined) produit.nom = nom;
    if (description !== undefined) produit.description = description;
    if (prix !== undefined) produit.prix_unitaire = prix;
    
    await produit.save();
    console.log("✅ Produit mis à jour");
    
    // Gérer le stock
    if (stock !== undefined || seuil_minimum !== undefined) {
      let stockItem = await Stock.findOne({ where: { produit_id: produit.id_produit } });
      
      if (!stockItem) {
        // Créer une entrée stock si elle n'existe pas
        stockItem = await Stock.create({
          produit_id: produit.id_produit,
          quantite_disponible: stock !== undefined ? stock : 0,
          seuil_minimum: seuil_minimum !== undefined ? seuil_minimum : 10
        });
        console.log("✅ Nouvelle entrée stock créée");
      } else {
        // Mettre à jour le stock existant
        if (stock !== undefined) {
          stockItem.quantite_disponible = stock;
          console.log(`✅ Stock mis à jour: ${stock} unités`);
        }
        if (seuil_minimum !== undefined) {
          stockItem.seuil_minimum = seuil_minimum;
          console.log(`✅ Seuil mis à jour: ${seuil_minimum}`);
        }
        await stockItem.save();
      }
    }
    
    await createLog(req.user?.id, `Modification produit "${produit.nom}"`, req.ip);
    
    // Récupérer le stock final
    const finalStock = await Stock.findOne({ where: { produit_id: produit.id_produit } });
    
    const resultat = {
      id: produit.id_produit,
      nom: produit.nom,
      description: produit.description,
      prix: parseFloat(produit.prix_unitaire),
      stock: finalStock ? finalStock.quantite_disponible : 0,
      seuil_minimum: finalStock ? finalStock.seuil_minimum : 10
    };
    
    console.log("✅ Réponse finale:", resultat);
    
    res.json({ 
      message: "Produit modifié avec succès", 
      produit: resultat
    });
    
  } catch (error) {
    console.error("❌ Erreur updateProduit:", error);
    res.status(500).json({ 
      message: "Erreur lors de la modification du produit",
      error: error.message,
      stack: error.stack
    });
  }
};

// 🔹 SUPPRIMER UN PRODUIT
exports.deleteProduit = async (req, res) => {
  try {
    const produitId = req.params.id;
    console.log("🗑️ Suppression produit ID:", produitId);
    
    const produit = await Produit.findByPk(produitId);
    
    if (!produit) {
      return res.status(404).json({ message: "Produit introuvable" });
    }
    
    // Supprimer le stock
    await Stock.destroy({ where: { produit_id: produit.id_produit } });
    console.log("✅ Stock supprimé");
    
    // Supprimer le produit
    await produit.destroy();
    console.log("✅ Produit supprimé");
    
    await createLog(req.user?.id, `Suppression produit "${produit.nom}"`, req.ip);
    
    res.json({ message: "Produit supprimé avec succès" });
    
  } catch (error) {
    console.error("❌ Erreur deleteProduit:", error);
    res.status(500).json({ error: error.message });
  }
};