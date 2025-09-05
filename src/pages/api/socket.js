import { Server } from "socket.io";

// Define intervals in milliseconds
const NEWS_EMIT_INTERVAL = 7000; // 7 seconds
const NEWS_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Use a global object to persist state across hot reloads in development
const g = globalThis;
if (!g.newsState) {
  g.newsState = {
    buffer: [],
    index: 0,
    emitInterval: null,
    refreshInterval: null,
    io: null,
  };
}

const fetchAndBufferNews = async (host) => {
  try {
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const url = `${protocol}://${host}/api/news`;
    console.log(`Socket: Fetching news from ${url}`);
    const newsRes = await fetch(url);
    if (!newsRes.ok) {
      throw new Error(`Failed to fetch news: ${newsRes.statusText}`);
    }
    const freshNews = await newsRes.json();
    if (freshNews && Array.isArray(freshNews) && freshNews.length > 0) {
      g.newsState.buffer = freshNews;
      g.newsState.index = 0;
      console.log(
        `Socket: Buffered ${g.newsState.buffer.length} news articles.`
      );
    }
  } catch (err) {
    console.error("Socket: Error fetching and buffering news:", err.message);
  }
};

const startNewsEmitter = (host) => {
  // Prevent multiple intervals from starting
  if (g.newsState.emitInterval) return;

  console.log("Socket: Starting news emitter.");

  // Fetch news immediately
  fetchAndBufferNews(host);

  // Set up intervals
  g.newsState.refreshInterval = setInterval(
    () => fetchAndBufferNews(host),
    NEWS_REFRESH_INTERVAL
  );

  g.newsState.emitInterval = setInterval(() => {
    if (g.newsState.io && g.newsState.buffer.length > 0) {
      const article = g.newsState.buffer[g.newsState.index];
      g.newsState.io.emit("news-item", article); // Emit a single item to all clients
      g.newsState.index = (g.newsState.index + 1) % g.newsState.buffer.length;
    }
  }, NEWS_EMIT_INTERVAL);
};

const socketHandler = (req, res) => {
  if (!res.socket.server.io) {
    console.log("Socket is initializing...");
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      cors: { origin: "*" }, // In production, restrict this to your frontend domain
    });
    res.socket.server.io = io;
    g.newsState.io = io;

    startNewsEmitter(req.headers.host);

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);
      // Send the current full buffer to the newly connected client
      if (g.newsState.buffer.length > 0) {
        socket.emit("news-initial", g.newsState.buffer);
      }
      socket.on("disconnect", () =>
        console.log("Client disconnected:", socket.id)
      );
    });
  }
  res.end();
};

export const config = { api: { bodyParser: false } };

export default socketHandler;
