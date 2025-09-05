"use client";
import { useState } from "react";
import StockChart from "@/components/StockChart";

export default function RiskPage() {
  const [stock, setStock] = useState("");
  const [tf, setTf] = useState("6M");
  const [data, setData] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState("");

  async function analyzeRisk() {
    try {
      // 1️⃣ Fetch stock chart data
      const chartRes = await fetch(
        `/api/stocks/${encodeURIComponent(stock)}?tf=${tf}`
      );
      const chartJson = await chartRes.json();
      if (chartJson.error) throw new Error(chartJson.error);
      setData(chartJson.prices);

      // 2️⃣ Send request for AI risk analysis
      const riskRes = await fetch("/api/risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock }),
      });
      const riskJson = await riskRes.json();
      if (riskJson.error) throw new Error(riskJson.error);
      setAnalysis(riskJson.analysis);
    } catch (err) {
      console.error("⚠️ Failed to analyze risk:", err);
      setAnalysis("⚠️ Failed to analyze risk. Try again.");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Risk Analysis</h1>

      {/* Input */}
      <input
        type="text"
        placeholder="Enter stock symbol (e.g., RELIANCE.NS)"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className="p-2 rounded bg-gray-800 w-80"
      />

      {/* Timeframe selector */}
      <select
        value={tf}
        onChange={(e) => setTf(e.target.value)}
        className="p-2 rounded bg-gray-800 ml-4"
      >
        <option value="1M">1 Month</option>
        <option value="6M">6 Months</option>
        <option value="1Y">1 Year</option>
      </select>

      <button
        onClick={analyzeRisk}
        className="ml-4 px-4 py-2 bg-emerald-600 rounded hover:bg-emerald-500"
      >
        Analyze
      </button>

      {/* Chart */}
      {data.length > 0 && (
        <>
          <h2 className="text-lg font-semibold">Price Chart ({tf})</h2>
          <StockChart data={data} />
        </>
      )}

      {/* AI Risk Analysis */}
      {analysis && (
        <div className="p-4 bg-gray-800 rounded">
          <h2 className="font-semibold mb-2">AI Risk Analysis:</h2>
          <p>{analysis}</p>
        </div>
      )}
    </div>
  );
}
