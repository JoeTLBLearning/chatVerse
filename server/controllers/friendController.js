const FriendRequest = require("../models/friendRequestModel");
const User = require("../models/userModel");

module.exports.sendFriendRequest = async (req, res, next) => {
  try {
    const { senderId, receiverId } = req.body;

    // 1. Ne pas s'ajouter soi-même
    if (senderId === receiverId) {
      return res.json({ status: false, msg: "Vous ne pouvez pas vous ajouter vous-même." });
    }

    // 2. Vérifier si une demande ou une amitié existe déjà
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existingRequest) {
      return res.json({ status: false, msg: "Une demande est déjà en cours ou vous êtes déjà amis." });
    }

    // 3. Création de la demande
    const newRequest = await FriendRequest.create({
      sender: senderId,
      receiver: receiverId,
      status: "pending"
    });

    // 4. Récupérer l'ID de la demande pour le renvoyer
    return res.json({ 
      status: true, 
      msg: "Demande d'ami envoyée !", 
      requestId: newRequest._id 
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.handleFriendRequest = async (req, res, next) => {
  try {
    const { requestId, accept } = req.body;
    const request = await FriendRequest.findById(requestId);
    if (!request) return res.json({ status: false, msg: "Demande introuvable." });

    if (accept === true || accept === "true") {
      request.status = "accepted";
      await request.save();

      await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.receiver } });
      await User.findByIdAndUpdate(request.receiver, { $addToSet: { friends: request.sender } });

      // On récupère les deux profils pour les échanges Socket
      const senderUser = await User.findById(request.sender).select("username email _id avatarImage shortId");
      const receiverUser = await User.findById(request.receiver).select("username email _id avatarImage shortId");

      // --- LOGIQUE SOCKET TEMPS RÉEL ---
      const io = req.app.get("socketio");
      const senderSocket = global.onlineUsers.get(request.sender.toString());
      
      if (senderSocket) {
        // On envoie au "Sender" les infos du "Receiver" (celui qui vient d'accepter)
        io.to(senderSocket).emit("friend-request-accepted", {
          newFriend: receiverUser 
        });
      }
      // ---------------------------------

      return res.json({ 
        status: true, 
        msg: "Ami ajouté !", 
        newFriend: senderUser // Pour celui qui clique (le Receiver)
      });
    } else {
      await FriendRequest.findByIdAndDelete(requestId);
      return res.json({ status: true, msg: "Demande refusée." });
    }
  } catch (ex) { next(ex); }
};
module.exports.getPendingRequests = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const requests = await FriendRequest.find({
      receiver: userId,
      status: "pending",
    }).populate("sender", "username _id");
    
    return res.json(requests);
  } catch (ex) { next(ex); }
};