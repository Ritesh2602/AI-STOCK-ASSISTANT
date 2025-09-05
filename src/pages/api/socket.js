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

    const newsRes = await fetch(url);
    if (!newsRes.ok) {
      throw new Error(`Failed to fetch news: ${newsRes.statusText}`);
    }
    const freshNews = await newsRes.json();
    if (freshNews && Array.isArray(freshNews) && freshNews.length > 0) {
      g.newsState.buffer = freshNews;
      g.newsState.index = 0;
    } else {
      useFallbackNews();
    }
  } catch (err) {
    useFallbackNews();
  }
};

const useFallbackNews = () => {
  if (g.newsState.buffer.length === 0) {
    g.newsState.buffer = [
      {
        id: 1,
        headline: "Market Update: Stocks Show Mixed Performance",
        summary:
          "Major indices display varied performance as investors await economic data.",
        url: "#",
        source: "Market News",
      },
      {
        id: 2,
        headline: "Tech Sector Continues Growth Trajectory",
        summary: "Technology companies report strong quarterly earnings.",
        url: "#",
        source: "Tech News",
      },
    ];
    g.newsState.index = 0;
  }
};

const startNewsEmitter = (host) => {
  // Clear existing intervals first
  if (g.newsState.emitInterval) {
    clearInterval(g.newsState.emitInterval);
    g.newsState.emitInterval = null;
  }
  if (g.newsState.refreshInterval) {
    clearInterval(g.newsState.refreshInterval);
    g.newsState.refreshInterval = null;
  }

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
      g.newsState.io.emit("news-item", article);
      g.newsState.index = (g.newsState.index + 1) % g.newsState.buffer.length;
    }
  }, NEWS_EMIT_INTERVAL);
};

const socketHandler = (req, res) => {
  try {
    if (!res.socket.server.io) {
      const io = new Server(res.socket.server, {
        path: "/api/socket",
        cors: { origin: "*" },
        transports: ["websocket", "polling"],
      });
      res.socket.server.io = io;
      g.newsState.io = io;

      startNewsEmitter(req.headers.host);

      io.on("connection", (socket) => {
        // Send the current full buffer to the newly connected client
        if (g.newsState.buffer.length > 0) {
          socket.emit("news-initial", g.newsState.buffer);
        } else {
          // Ensure fallback data is available
          useFallbackNews();
          socket.emit("news-initial", g.newsState.buffer);
        }

        socket.on("disconnect", () => {});

        socket.on("error", (error) => {});
      });

      io.on("error", (error) => {});
    }
    res.end();
  } catch (error) {
    res.status(500).json({ error: "Socket initialization failed" });
  }
};

export const config = { api: { bodyParser: false } };

export default socketHandler;
