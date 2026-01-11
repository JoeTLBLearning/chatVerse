const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const socket = require("socket.io");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const roomRoutes = require("./routes/roomRoutes");
const friendRoutes = require("./routes/friendRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/friends", friendRoutes);

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB Connection Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

const server = app.listen(process.env.PORT, () => {
  console.log(`Server Started on Port ${process.env.PORT}`);
});

const io = socket(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

app.set("socketio", io);

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`New Socket Connection: ${socket.id}`);

  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("get-online-users", Array.from(onlineUsers.keys()));
    console.log(`User ${userId} associated with socket ${socket.id}`);
  });

  socket.on("join-channel", (channelId) => {
    socket.join(channelId);
  });

  socket.on("send-msg", (data) => {
    if (data.channelId) {
      socket.to(data.channelId).emit("msg-recieve", data);
    } else {
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("msg-recieve", data);
      }
    }
  });

  // --- NOUVEAU : GESTION NOTIFICATION AMI EN TEMPS RÉEL ---
  socket.on("send-friend-request", (data) => {
    const receiverSocket = onlineUsers.get(data.recipientId);
    if (receiverSocket) {
      // On émet l'événement que ton Dashboard écoute (new-friend-request)
      io.to(receiverSocket).emit("new-friend-request", {
        _id: data.requestId,
        sender: data.sender, // L'objet complet de l'expéditeur
        status: "pending"
      });
    }
  });

  socket.on("disconnect", () => {
    let disconnectedUser;
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUser = userId;
        onlineUsers.delete(userId);
        break;
      }
    }
    // Prévenir tout le monde de la déconnexion
    io.emit("get-online-users", Array.from(onlineUsers.keys()));
  });
});