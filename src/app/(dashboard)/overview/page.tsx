"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

interface NewsItem {
  headline: string;
  url: string;
  summary: string;
  source: string;
  id: number; // Finnhub provides an ID, useful for keys
}

export default function OverviewPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // This is the crucial fix:
    // Connect to the Next.js server itself by specifying the correct path.
    // This removes the need for hardcoding "http://localhost:xxxx".
    const socket: Socket = io({
      path: "/api/socket",
    });

    socket.on("connect", () => {
      console.log("🟢 Connected to Socket.IO server:", socket.id);
      setIsConnected(true);
    });

    // Event to receive the initial batch of news articles
    socket.on("news-initial", (newsData: NewsItem[]) => {
      console.log(
        `Received initial batch of ${newsData.length} news articles.`
      );
      setNews(newsData);
    });

    // Event for a single, new, rotating news item
    socket.on("news-item", (newItem: NewsItem) => {
      setNews((prevNews) => {
        // Avoid adding duplicates
        if (prevNews.some((item) => item.id === newItem.id)) {
          return prevNews;
        }
        // Add the new item to the start and keep the list at a max of 20
        const updatedNews = [newItem, ...prevNews];
        return updatedNews.slice(0, 20);
      });
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Disconnected from Socket.IO server:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    // Cleanup on component unmount
    return () => {
      console.log("Unmounting, disconnecting socket.");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Live Market News</h1>
        <div
          className={`w-4 h-4 rounded-full transition-colors ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
          title={isConnected ? "Connected" : "Disconnected"}
        />
      </div>
      <section className="mb-6">
        {news.length > 0 ? (
          <ul className="space-y-4">
            {news.map((item) => (
              <li
                key={item.id}
                className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-bold text-lg"
                >
                  {item.headline}
                </a>
                <p className="text-gray-600 text-sm mt-2">{item.summary}</p>
                <small className="text-gray-400 block mt-2">
                  Source: {item.source}
                </small>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center p-8">
            {isConnected ? "Waiting for news..." : "Connecting to news feed..."}
          </p>
        )}
      </section>
    </div>
  );
}
