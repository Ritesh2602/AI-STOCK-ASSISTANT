"use client";

import { useState, useEffect } from "react";

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
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        if (response.ok) {
          const newsData = await response.json();
          setNews(newsData);
          setIsConnected(true);
        }
      } catch (error) {
        setIsConnected(false);
      }
    };

    fetchNews();
    const newsInterval = setInterval(fetchNews, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(newsInterval);
  }, []);

  useEffect(() => {
    if (news.length === 0) return;

    const rotateNews = () => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
      setLastUpdate(new Date());
    };

    const rotateInterval = setInterval(rotateNews, 7000); // Rotate every 7 seconds
    return () => clearInterval(rotateInterval);
  }, [news.length]);

  const displayNews = news.length > 0 ? [
    news[currentIndex],
    ...news.slice(0, currentIndex),
    ...news.slice(currentIndex + 1)
  ].slice(0, 20) : [];

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
        
        {displayNews.length > 0 ? (
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4 pr-2 pb-6">
              {displayNews.map((item, index) => (
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
              {isConnected ? "Loading news..." : "Connecting to news feed..."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}