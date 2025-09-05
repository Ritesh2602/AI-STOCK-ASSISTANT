"use client";
import { useState, useEffect } from "react";

type Stock = {
  symbol: string;
  description?: string;
  displaySymbol?: string;
  currency?: string;
};

export default function StocksBySectorPage() {
  const [sector, setSector] = useState("Information Technology");
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available sectors
  const sectors = [
    "Information Technology",
    "Financial Services",
    "Healthcare",
    "Energy",
    "Industrials",
    "Consumer Staples",
    "Automobiles and Auto Components",
    "Materials",
    "Real Estate",
    "Utilities"
  ];

  // Fetch stocks automatically when the sector changes
  useEffect(() => {
    const fetchStocks = async () => {
      if (!sector) return;

      setLoading(true);
      setError(null);
      setStocks([]); // Clear previous stocks
      try {
        const res = await fetch(
          `/api/sectors?sector=${encodeURIComponent(sector)}`
        );
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "An unknown error occurred.");
        }
        setStocks(json.stocks || []);
      } catch (err: any) {
        console.error("Failed to fetch stocks:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, [sector]);

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">📊 Stocks by Sector</h1>

      <div className="mb-6">
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="w-full sm:max-w-xs p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-400">Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && stocks.length === 0 && sector && (
        <p className="text-gray-500">No stocks found for this sector.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stocks.map((stock) => (
          <div key={stock.symbol} className="p-4 bg-gray-800 rounded shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold break-words">{stock.displaySymbol}</h2>
            <p className="text-gray-400 text-sm sm:text-base truncate" title={stock.description}>
              {stock.description}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 break-all">Symbol: {stock.symbol}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
