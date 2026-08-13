const { Server } = require("socket.io");
require("dotenv").config();

let io;

function init(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:8000",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined room user-${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.IO has not been initialized.");
  }
  return io;
}

module.exports = {
  init,
  getIO,
};
