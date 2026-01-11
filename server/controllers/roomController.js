const Rooms = require("../models/roomModel");
const User = require("../models/userModel");


module.exports.createRoom = async (req, res, next) => {
  try {
    const { name, ownerId } = req.body;

    const room = await Rooms.create({
      name,
      owner: ownerId,
      members: [ownerId], // Le créateur est automatiquement membre
      channels: [{ name: "général", type: "text" }], // Canal par défaut
    });

    return res.json({ status: true, room });
  } catch (ex) {
    next(ex);
  }
};


module.exports.getUserRooms = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const rooms = await Rooms.find({ members: userId })
      .populate("members", "username _id")
      .populate({
        path: "waitingList",
        select: "username _id",
        model: "Users" // Assure-toi que ton modèle User s'appelle bien "Users" dans mongoose.model
      });

    // On s'assure que chaque room a au moins un tableau vide pour waitingList avant de répondre
    const safeRooms = rooms.map(room => {
      const r = room.toObject();
      if (!r.waitingList) r.waitingList = [];
      return r;
    });

    return res.json(safeRooms);
  } catch (ex) {
    console.error("Erreur getUserRooms:", ex);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des salons" });
  }
};


module.exports.addMember = async (req, res, next) => {
  try {
    const { roomId, userId } = req.body;

    // On ajoute l'ID au tableau 'members' s'il n'y est pas déjà ($addToSet évite les doublons)
    const room = await Rooms.findByIdAndUpdate(
      roomId,
      { $addToSet: { members: userId } },
      { new: true } // Renvoie le salon mis à jour
    );

    if (room) return res.json({ status: true, room });
    else return res.json({ status: false, msg: "Erreur lors de l'ajout." });
  } catch (ex) {
    next(ex);
  }
};


module.exports.addChannel = async (req, res, next) => {
  try {
    const { roomId, channelName } = req.body;

    // On met à jour la room en ajoutant le nouveau canal au tableau
    const updatedRoom = await Rooms.findByIdAndUpdate(
      roomId,
      { $push: { channels: { name: channelName.toLowerCase() } } },
      { new: true } // Pour renvoyer la room mise à jour
    );

    return res.json({ status: true, updatedRoom });
  } catch (ex) {
    next(ex);
  }
};



module.exports.renameChannel = async (req, res, next) => {
  try {
    const { roomId, channelId, newName } = req.body;

    const updatedRoom = await Rooms.findOneAndUpdate(
      { _id: roomId, "channels._id": channelId },
      {
        $set: { "channels.$.name": newName.toLowerCase() }
      },
      { new: true }
    );

    if (updatedRoom) return res.json({ status: true, updatedRoom });
    else return res.json({ status: false, msg: "Canal non trouvé." });
  } catch (ex) {
    next(ex);
  }
};


module.exports.deleteChannel = async (req, res, next) => {
  try {
    const { roomId, channelId } = req.body;

    const updatedRoom = await Rooms.findByIdAndUpdate(
      roomId,
      {
        $pull: { channels: { _id: channelId } }
      },
      { new: true }
    );

    if (updatedRoom) return res.json({ status: true, updatedRoom });
    else return res.json({ status: false, msg: "Erreur lors de la suppression." });
  } catch (ex) {
    next(ex);
  }
};


// 1. Récupérer les utilisateurs qui ne sont pas encore membres de la room
module.exports.getAvailableUsers = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const room = await Rooms.findById(roomId);

    // On cherche tous les users SAUF ceux déjà présents dans room.members
    const users = await User.find({
      _id: { $nin: room.members }
    }).select("username _id");

    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};

// 2. Ajouter des membres à la room
module.exports.addMembers = async (req, res, next) => {
  try {
    const { roomId, userIds } = req.body; // userIds est un tableau d'IDs
    const room = await Rooms.findByIdAndUpdate(
      roomId,
      { $addToSet: { members: { $each: userIds } } }, // $addToSet évite les doublons
      { new: true }
    ).populate("members", "username");

    return res.json(room);
  } catch (ex) {
    next(ex);
  }
};

// Quitter le salon (Membre)
module.exports.leaveRoom = async (req, res, next) => {
  try {
    const { roomId, userId } = req.body;
    await Rooms.findByIdAndUpdate(
      roomId,
      { $pull: { members: userId } }
    );
    return res.json({ status: true, msg: "Vous avez quitté le salon." });
  } catch (ex) {
    next(ex);
  }
};

// Supprimer le salon (Propriétaire)
module.exports.deleteRoom = async (req, res, next) => {
  try {
    // Utilisation de req.params pour être plus compatible avec axios.delete
    const { roomId, userId } = req.body;

    const room = await Rooms.findById(roomId);
    if (!room) return res.json({ status: false, msg: "Salon introuvable." });

    // On vérifie que c'est bien le proprio
    if (room.owner.toString() !== userId) {
      return res.status(403).json({ status: false, msg: "Action non autorisée." });
    }

    await Rooms.findByIdAndDelete(roomId);
    return res.json({ status: true, msg: "Salon supprimé avec succès." });
  } catch (ex) {
    next(ex);
  }
};

// Demander à rejoindre
module.exports.requestJoin = async (req, res, next) => {
  const { roomId, userId } = req.body;
  await Rooms.findByIdAndUpdate(roomId, { $addToSet: { waitingList: userId } });
  res.json({ msg: "Demande envoyée" });
};


module.exports.handleJoinRequest = async (req, res, next) => {
  try {
    const { roomId, userId, accept } = req.body;

    let update;
    if (accept) {
      // Si accepté : on retire de la liste d'attente ET on ajoute aux membres
      update = {
        $pull: { waitingList: userId },
        $addToSet: { members: userId }
      };
    } else {
      // Si refusé : on retire juste de la liste d'attente
      update = {
        $pull: { waitingList: userId }
      };
    }

    const room = await Rooms.findByIdAndUpdate(roomId, update, { new: true })
      .populate("members", "username _id")
      .populate("waitingList", "username _id");

    return res.json({ status: true, room });
  } catch (ex) {
    next(ex);
  }
};

module.exports.sendRoomInvitations = async (req, res, next) => {
  try {
    const { roomId, userIds } = req.body;
    const room = await Rooms.findByIdAndUpdate(
      roomId,
      { $addToSet: { waitingList: { $each: userIds } } },
      { new: true }
    ).populate("owner", "username");

    // Récupération sécurisée de Socket.io
    const io = req.app.get("socketio");

    userIds.forEach((userId) => {
      // On cherche si l'utilisateur a un socket actif dans la Map globale
      const socketId = global.onlineUsers.get(userId);
      if (socketId) {
        // On envoie l'événement "new-room-invitation" au socket spécifique
        io.to(socketId).emit("new-room-invitation", room);
      }
    });

    res.json({ status: true, room });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getInvitations = async (req, res, next) => {
  try {
    const { userId } = req.params;
    // On cherche les rooms où l'utilisateur est présent dans la waitingList
    const invitations = await Rooms.find({ waitingList: userId })
      .select("name _id owner")
      .populate("owner", "username");

    return res.json(invitations);
  } catch (ex) {
    next(ex);
  }
};


// Ajouter un ami directement au salon (Invite)
module.exports.inviteToRoom = async (req, res, next) => {
  try {
    const { roomId, userId } = req.body;

    // On ajoute l'utilisateur et on renvoie le salon mis à jour AVEC les détails des membres
    const room = await Rooms.findByIdAndUpdate(
      roomId,
      { $addToSet: { members: userId } }, // $addToSet évite les doublons
      { new: true }
    ).populate("members", "username _id email avatarImage"); 
    // ^ Le populate est CRUCIAL pour mettre à jour l'affichage immédiatement

    if (room) return res.json({ status: true, room });
    else return res.json({ status: false, msg: "Erreur lors de l'ajout." });
  } catch (ex) {
    next(ex);
  }
};

// Expulser un membre (Kick)
module.exports.kickMember = async (req, res, next) => {
  try {
    const { roomId, memberId, ownerId } = req.body;

    const room = await Rooms.findById(roomId);
    if (!room) return res.json({ status: false, msg: "Salon introuvable." });

    // Sécurité : Vérifier que c'est bien le propriétaire qui demande l'expulsion
    if (room.owner.toString() !== ownerId) {
      return res.json({ status: false, msg: "Seul le propriétaire peut expulser un membre." });
    }

    // On retire le membre
    const updatedRoom = await Rooms.findByIdAndUpdate(
      roomId,
      { $pull: { members: memberId } },
      { new: true }
    ).populate("members", "username _id email avatarImage");

    return res.json({ status: true, room: updatedRoom });
  } catch (ex) {
    next(ex);
  }
};