"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AnalyzePortfolioPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [stockName, setStockName] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [portfolio, setPortfolio] = useState<
    { name: string; quantity: number }[]
  >([]);
  const [analysis, setAnalysis] = useState<string>("");

  // Load portfolio and redirect if not authenticated
  useEffect(() => {
    if (!token) {
      router.push('/login');
    } else {
      loadPortfolio();
    }
  }, [token, router]);

  // Load user's portfolio from database
  const loadPortfolio = async () => {
    try {
      const res = await fetch('/api/portfolio', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const loadedStocks = data.stocks.map((item: any) => ({
          name: item.stockSymbol,
          quantity: item.quantity
        }));
        setPortfolio(loadedStocks);
      }
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    }
  };

  // Show loading while checking auth
  if (!token) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Add stock to portfolio
  const addStock = () => {
    if (!stockName || !quantity) return;

    setPortfolio([
      ...portfolio,
      { name: stockName, quantity: Number(quantity) },
    ]);
    setStockName("");
    setQuantity("");
  };

  // Delete stock from portfolio
  const deleteStock = (index: number) => {
    setPortfolio(portfolio.filter((_, i) => i !== index));
  };

  // Send portfolio to API for analysis
  const analyzePortfolio = async () => {
    try {
      const headers: any = { "Content-Type": "application/json" };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers,
        body: JSON.stringify({ stocks: portfolio }),
      });

      const data = await res.json();
      setAnalysis(data.analysis || "No response from AI.");
    } catch (err) {
      console.error(err);
      setAnalysis("⚠️ Failed to analyze portfolio.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-6">🔍 Analyze Your Portfolio</h1>

      <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-lg">
        {/* Stock Name Input */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Stock Name</label>
          <input
            type="text"
            placeholder="e.g. RELIANCE, TCS, HDFCBANK"
            value={stockName}
            onChange={(e) => setStockName(e.target.value.toUpperCase())}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        {/* Quantity Input */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Quantity</label>
          <input
            type="number"
            placeholder="e.g. 10"
            value={quantity}
            onChange={(e) =>
              setQuantity(e.target.value ? Number(e.target.value) : "")
            }
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        {/* Add Stock Button */}
        <button
          onClick={addStock}
          className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded font-semibold mb-4"
        >
          ➕ Add Stock
        </button>

        {/* Portfolio Preview */}
        {portfolio.length > 0 && (
          <div className="bg-gray-900 p-4 rounded mb-4">
            <h2 className="font-bold mb-2">Your Portfolio</h2>
            <div className="space-y-2">
              {portfolio.map((stock, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                  <span className="text-sm">
                    {stock.quantity} shares of {stock.name}
                  </span>
                  <button
                    onClick={() => deleteStock(index)}
                    className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded"
                    title="Delete stock"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analyze Button */}
        <button
          onClick={analyzePortfolio}
          disabled={portfolio.length === 0}
          className="w-full bg-green-600 hover:bg-green-500 py-2 rounded font-semibold disabled:opacity-50"
        >
          🔎 Analyze Portfolio
        </button>
      </div>

      {/* AI Analysis Output */}
      {analysis && (
        <div className="mt-6 w-full max-w-2xl bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-2">📈 AI Analysis</h2>
          <p className="whitespace-pre-wrap">{analysis}</p>
        </div>
      )}
    </div>
  );
}
