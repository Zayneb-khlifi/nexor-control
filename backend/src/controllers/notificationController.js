// backend/src/controllers/notificationController.js
const { Notification, User } = require("../models");

// Récupérer les notifications d'un utilisateur
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
      limit: 50
    });
    res.json(notifications);
  } catch (error) {
    console.error("Erreur getNotifications:", error);
    res.status(500).json({ error: error.message });
  }
};

// Créer une notification
exports.createNotification = async (userId, title, message, type = "info", link = null) => {
  try {
    const notification = await Notification.create({
      user_id: userId,
      title,
      message,
      type,
      link
    });
    
    // Émettre via Socket.io
    const io = req?.app?.get("io");
    if (io) {
      io.to(`user_${userId}`).emit("newNotification", notification);
    }
    
    return notification;
  } catch (error) {
    console.error("Erreur createNotification:", error);
    return null;
  }
};

// Marquer une notification comme lue
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const notification = await Notification.findOne({
      where: { id_notification: id, user_id: userId }
    });
    
    if (!notification) {
      return res.status(404).json({ message: "Notification non trouvée" });
    }
    
    notification.read = true;
    await notification.save();
    
    res.json({ message: "Notification marquée comme lue" });
  } catch (error) {
    console.error("Erreur markAsRead:", error);
    res.status(500).json({ error: error.message });
  }
};

// Marquer toutes les notifications comme lues
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await Notification.update(
      { read: true },
      { where: { user_id: userId, read: false } }
    );
    
    res.json({ message: "Toutes les notifications marquées comme lues" });
  } catch (error) {
    console.error("Erreur markAllAsRead:", error);
    res.status(500).json({ error: error.message });
  }
};

// Supprimer une notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const notification = await Notification.findOne({
      where: { id_notification: id, user_id: userId }
    });
    
    if (!notification) {
      return res.status(404).json({ message: "Notification non trouvée" });
    }
    
    await notification.destroy();
    
    res.json({ message: "Notification supprimée" });
  } catch (error) {
    console.error("Erreur deleteNotification:", error);
    res.status(500).json({ error: error.message });
  }
};