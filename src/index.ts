import "dotenv/config";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { validateEnv } from "./config/env";
import app from "./app";
import crashWebSocketHandler from "./modules/crash/crash.ws.handler";

validateEnv();

mongoose
  .connect(process.env.DB_HOST as string, {
    writeConcern: { w: "majority" },
  })
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((error: Error) => {
    console.warn("Database connection error:", error.message);
  });

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: true,
    credentials: true,
  },
});

crashWebSocketHandler.initialize(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
  console.log(`WebSocket server ready on /crash namespace`);
});
