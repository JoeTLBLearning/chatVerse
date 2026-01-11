const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    message: {
      text: { type: String, required: true },
    },
    // Pour les DM : contient [ID_Expéditeur, ID_Destinataire]
    // Pour les Salons : contient uniquement [ID_Expéditeur]
    users: Array, 
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    // AJOUT : L'ID du canal si le message appartient à une Room
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rooms.channels", // Référence au sous-document channel
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Messages", MessageSchema);