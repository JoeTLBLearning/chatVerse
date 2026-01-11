const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    type: { type: String, default: "room_invite" }, // Peut être 'room_invite' ou 'friend_request'
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Rooms" }, // Optionnel si c'est juste une demande d'ami
    status: { type: String, default: "pending" }, // pending, accepted, rejected
  },
  { timestamps: true }
);

module.exports = mongoose.model("Requests", requestSchema);