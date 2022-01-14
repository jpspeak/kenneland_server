import express from "express";
import dotenv from "dotenv";
import config from "./src/config/index";
import http from "http";
import { Server } from "socket.io";
import { IMessage } from "./src/models/message.model";
import loaders from "./loaders";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.allowedOrigin,
    methods: ["GET", "POST"]
  }
});

io.on("connection", socket => {
  socket.join(socket.handshake?.auth?.userId);

  socket.on("sendMessage", async (data: { createdMessage: IMessage; receiverUserId: string }) => {
    io.to(data.receiverUserId)
      .to(socket.handshake?.auth?.userId)
      .emit("receivedMessage", data.createdMessage);
  });
});

const startServer = async () => {
  try {
    await loaders(app);

    server.listen({ port: config.app.port, host: config.app.hostname });

    console.log("Server listening on Port", config.app.port);
  } catch (error) {
    console.log("Failed to start the server.");

    console.log((error as Error).message);
  }
};
startServer();
