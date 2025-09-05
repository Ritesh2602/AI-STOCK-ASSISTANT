"use client";

import { useState } from "react";
import StockChart from "@/components/StockChart"; // Assuming you have this component

type ChartDataPoint = {
  date: string;
  close: number;
};

type StockDetails = {
  profile: {
    name: string;
    currency: string;
    marketCapitalization: number;
    finnhubIndustry: string;
  };
  quote: {
    c: number; // current price
    h: number; // high
    l: number; // low
    pc: number; // previous close
  };
};

export default function ComparePage() {
  const [stockA, setStockA] = useState("");
  const [stockB, setStockB] = useState("");
  const [result, setResult] = useState("");
  const [symbols, setSymbols] = useState<string[]>([]);
  const [chartData, setChartData] = useState<{
    [key: string]: ChartDataPoint[];
  }>({});
  const [details, setDetails] = useState<{ [key: string]: StockDetails }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleCompare = async () => {
    if (!stockA || !stockB) {
      setResult("Please enter two stock symbols to compare.");
      return;
    }
    setIsLoading(true);
    setResult(""); // Clear previous result
    setChartData({}); // Clear previous chart data
    setDetails({}); // Clear previous details

    // For US stocks, we just need the uppercase symbol.
    const formatSymbol = (symbol: string) => symbol.toUpperCase().trim();
    const symA = formatSymbol(stockA);
    const symB = formatSymbol(stockB);

    setSymbols([symA, symB]);

    try {
      // Fetch AI comparison first to ensure we get the analysis
      const aiRes = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockA: symA, stockB: symB }),
      });

      // Handle AI response
      const aiData = await aiRes.json();
      if (aiRes.ok) {
        // Handle cases where the response might be successful but empty
        setResult(aiData.response || "No analysis was returned from the AI.");
        setDetails(aiData.details || {});
      } else {
        setResult(aiData.error || "An error occurred during comparison.");
      }

      // Then, fetch chart data
      const [chartDataA, chartDataB] = await Promise.all([
        fetch(`/api/stocks/${symA}?tf=1Y`),
        fetch(`/api/stocks/${symB}?tf=1Y`),
      ]);

      // Handle chart data responses
      const newChartData: { [key: string]: ChartDataPoint[] } = {};
      if (chartDataA.ok) {
        const json = await chartDataA.json();
        newChartData[symA] = json.prices || [];
      } else {
        console.error(`Failed to fetch chart data for ${symA}`);
        newChartData[symA] = [];
      }
      if (chartDataB.ok) {
        const json = await chartDataB.json();
        newChartData[symB] = json.prices || [];
      } else {
        console.error(`Failed to fetch chart data for ${symB}`);
        newChartData[symB] = [];
      }
      setChartData(newChartData);
    } catch (error) {
      setResult(
        "Failed to fetch comparison. Please check the console for errors."
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-4">⚖️ Compare Stocks</h1>
      <p className="text-gray-400 mb-6">
        Enter two US stock symbols (e.g., AAPL, MSFT) to get an AI-powered
        comparison and view their performance charts.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          className="w-full sm:w-1/2 p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Stock A (e.g., AAPL)"
          value={stockA}
          onChange={(e) => setStockA(e.target.value)}
          onKeyUp={(e) => e.key === "Enter" && handleCompare()}
        />
        <input
          className="w-full sm:w-1/2 p-3 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Stock B (e.g., MSFT)"
          value={stockB}
          onChange={(e) => setStockB(e.target.value)}
          onKeyUp={(e) => e.key === "Enter" && handleCompare()}
        />
      </div>
      <button
        onClick={handleCompare}
        disabled={isLoading || !stockA || !stockB}
        className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold px-6 py-3 mt-4 rounded-lg transition-colors w-full sm:w-auto"
      >
        {isLoading ? "Comparing..." : "Compare"}
      </button>

      {isLoading && !result && (
        <div className="mt-8 text-center text-gray-400">
          Loading AI Analysis & Charts...
        </div>
      )}

      {result && (
        <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">AI Analysis</h2>
          <p className="text-gray-300 whitespace-pre-wrap">{result}</p>
        </div>
      )}

      {symbols.length > 0 && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {symbols.map((symbol) => {
            const stockDetails = details[symbol];
            return (
              <div
                key={symbol}
                className="bg-gray-800 p-4 rounded-lg shadow-lg"
              >
                <h2 className="text-2xl font-bold text-white mb-4 text-center">
                  {stockDetails?.profile?.name || symbol}
                </h2>

                {stockDetails && (
                  <div className="text-sm text-gray-300 mb-4 space-y-2 border-t border-b border-gray-700 py-4">
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span className="font-semibold">
                        {stockDetails.quote.c} {stockDetails.profile.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Day's Range:</span>
                      <span className="font-semibold">
                        {stockDetails.quote.l} - {stockDetails.quote.h}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Market Cap (M):</span>
                      <span className="font-semibold">
                        {stockDetails.profile.marketCapitalization.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {isLoading ? (
                  <div className="w-full h-64 flex items-center justify-center text-gray-400">
                    Loading chart...
                  </div>
                ) : chartData[symbol] && chartData[symbol].length > 0 ? (
                  <StockChart data={chartData[symbol]} />
                ) : (
                  <div className="w-full h-64 flex items-center justify-center text-gray-400">
                    No chart data available.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
