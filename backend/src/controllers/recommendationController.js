// backend/src/controllers/recommendationController.js
const { Commande, LigneCommande, Produit } = require("../models");

// Récupérer l'historique des commandes d'un utilisateur
exports.getUserOrderHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const commandes = await Commande.findAll({
      where: { client_id: userId, statut: ["VALIDEE", "TERMINEE"] },
      include: [
        { 
          model: LigneCommande,
          include: [{ model: Produit }]
        }
      ],
      limit: 20
    });
    
    const produits = [];
    commandes.forEach(commande => {
      if (commande.LigneCommandes) {
        commande.LigneCommandes.forEach(ligne => {
          if (ligne.Produit) {
            produits.push({
              id: ligne.Produit.id_produit,
              nom: ligne.Produit.nom,
              description: ligne.Produit.description,
              prix: ligne.Produit.prix_unitaire
            });
          }
        });
      }
    });
    
    res.json(produits);
  } catch (error) {
    console.error("Erreur getUserOrderHistory:", error);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer les produits populaires (top ventes)
exports.getPopularProducts = async (req, res) => {
  try {
    const popularProducts = await LigneCommande.findAll({
      include: [{ model: Produit }],
      attributes: [
        'produit_id',
        [sequelize.fn('SUM', sequelize.col('quantite')), 'total_vendus']
      ],
      group: ['produit_id', 'Produit.id_produit', 'Produit.nom', 'Produit.description', 'Produit.prix_unitaire'],
      order: [[sequelize.literal('total_vendus'), 'DESC']],
      limit: 10
    });
    
    const resultats = popularProducts.map(p => ({
      id: p.Produit.id_produit,
      nom: p.Produit.nom,
      description: p.Produit.description,
      prix: p.Produit.prix_unitaire,
      total_vendus: p.dataValues.total_vendus
    }));
    
    res.json(resultats);
  } catch (error) {
    console.error("Erreur getPopularProducts:", error);
    res.status(500).json({ error: error.message });
  }
};