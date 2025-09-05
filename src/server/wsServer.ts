// src/server/wsServer.ts
import WebSocket, { WebSocketServer } from "ws";
import pkg from '@next/env';
const { loadEnvConfig } = pkg;


const projectDir = process.cwd();
loadEnvConfig(projectDir);

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
if (!FINNHUB_API_KEY) {
  console.error("⚠️ FINNHUB_API_KEY is missing in environment variables!");
  process.exit(1);
}

const PORT = 8080;

const wss = new WebSocketServer({ port: PORT }, () => {
  console.log(`🚀 WebSocket server running on ws://localhost:${PORT}`);
});

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (message) => {
    try {
      const { symbol } = JSON.parse(message.toString());

      if (!symbol) {
        ws.send(JSON.stringify({ error: "Missing symbol" }));
        return;
      }

      const res = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
      );
      const data = await res.json();

      ws.send(JSON.stringify({ symbol, data }));
    } catch (err) {
      console.error(err);
      ws.send(JSON.stringify({ error: "Something went wrong" }));
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("✅ FINNHUB_API_KEY loaded successfully");
