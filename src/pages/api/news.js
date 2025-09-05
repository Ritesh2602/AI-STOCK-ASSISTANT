// src/pages/api/news.js
import axios from "axios";

export default async function handler(req, res) {
  const { FINNHUB_API_KEY } = process.env;

  if (!FINNHUB_API_KEY) {
    console.error("FINNHUB_API_KEY is not set in /api/news.");
    return res.status(500).json({ error: "API key is not configured." });
  }

  const url = `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`;

  try {
    const apiRes = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'AI-Stock-Assistant/1.0'
      }
    });

    const newsData = apiRes.data;
    
    if (!Array.isArray(newsData)) {
      console.error("Unexpected response format from Finnhub:", newsData);
      return res.status(500).json({ error: "Invalid response format from news API" });
    }

    // Transform the data to match expected format
    const articles = newsData.slice(0, 20).map((item, index) => ({
      id: item.id || Date.now() + index,
      headline: item.headline || "No headline available",
      summary: item.summary || "No summary available",
      url: item.url || "#",
      source: item.source || "Finnhub"
    }));

    res.status(200).json(articles);
  } catch (error) {
    console.error("Error fetching from Finnhub in /api/news:", error.message);
    console.error("Full error:", error.response?.data || error);

    if (error.response) {
      console.error("Finnhub API Response Error:", error.response.data);
      res.status(error.response.status).json({
        error: "Failed to fetch news from Finnhub.",
        details: error.response.data,
      });
    } else if (error.request) {
      res
        .status(504)
        .json({ error: "No response from Finnhub API (Gateway Timeout)." });
    } else {
      res.status(500).json({ error: "An internal server error occurred." });
    }
  }
}
