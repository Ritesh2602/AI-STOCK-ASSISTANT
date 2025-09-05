"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

interface NewsItem {
  headline: string;
  url: string;
  summary: string;
  source: string;
  id: number;
}

export default function OverviewPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const socket: Socket = io({
      path: "/api/socket",
    });

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("news-initial", (newsData: NewsItem[]) => {
      setNews(newsData);
    });

    socket.on("news-item", (newItem: NewsItem) => {
      setNews((prevNews) => {
        const filtered = prevNews.filter(item => item.id !== newItem.id);
        return [newItem, ...filtered].slice(0, 20);
      });
      setLastUpdate(new Date());
    });

    socket.on("disconnect", (reason) => {
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="h-full bg-gray-50 overflow-hidden overflow-x-hidden">
      <div className="max-w-4xl mx-auto h-full flex flex-col overflow-x-hidden p-6">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h1 className="text-3xl font-bold text-gray-900">Live Market News</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {lastUpdate.toLocaleTimeString()}
            </span>
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
              title={isConnected ? "Connected" : "Disconnected"}
            />
          </div>
        </div>
        
        {news.length > 0 ? (
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4 pr-2 pb-6">
              {news.map((item, index) => (
                <div
                  key={`${item.id}-${lastUpdate.getTime()}`}
                  className={`bg-white rounded-lg shadow-md p-6 border-l-4 transition-all duration-300 hover:shadow-lg ${
                    index === 0 ? 'border-l-blue-500 bg-blue-50' : 'border-l-gray-300'
                  }`}
                >
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {item.headline}
                  </a>
                  <p className="text-gray-700 mt-3 leading-relaxed">{item.summary}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-500">
                      Source: {item.source}
                    </span>
                    {index === 0 && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        Latest
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-400 text-lg">
              {isConnected ? "Waiting for news..." : "Connecting to news feed..."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}