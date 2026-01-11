const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
  channels: [
    {
      name: { type: String, required: true },
      type: { type: String, default: "text" },
    },
  ],
  // ICI : Le champ doit être défini EXACTEMENT comme ça
  waitingList: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }], 
}, { timestamps: true });

module.exports = mongoose.model("Rooms", roomSchema);