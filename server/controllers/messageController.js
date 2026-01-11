const Messages = require("../models/messageModel");
const User = require("../models/userModel");

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message, channelId } = req.body;
    const data = await Messages.create({
      message: { text: message },
      // Si channelId existe, on ne met que l'expéditeur dans 'users'
      users: channelId ? [from] : [from, to],
      sender: from,
      channelId: channelId || null,
    });

    if (data) return res.json({ msg: "Message ajouté avec succès." });
    else return res.json({ msg: "Erreur lors de l'ajout du message." });
  } catch (ex) {
    next(ex);
  }
};



module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to, roomId } = req.body;

    // 1. On construit la requête
    let query;
    if (roomId) {
      query = { channelId: roomId };
    } else if (from && to) {
      query = { users: { $all: [from, to] }, channelId: null };
    } else {
      return res.status(400).json({ msg: "Paramètres manquants" });
    }

    // 2. On récupère les messages
    const messages = await Messages.find(query)
      .populate("sender", "username")
      .sort({ updatedAt: 1 });

    // 3. On formate la réponse (C'est ici que ça plantait souvent)
    const projectedMessages = messages.map((msg) => {
      // Sécurité : on vérifie si msg.sender existe avant le toString()
      const isFromSelf = msg.sender ? msg.sender._id.toString() === from : false;
      
      return {
        fromSelf: isFromSelf,
        message: msg.message.text,
        senderName: msg.sender ? msg.sender.username : "Utilisateur inconnu",
        createdAt: msg.createdAt
      };
    });

    res.json(projectedMessages);
  } catch (ex) {
    // Si ça crash, on voit l'erreur exacte dans le terminal du serveur
    console.error("ERREUR GET_MESSAGES:", ex);
    res.status(500).send(ex.message); 
  }
};