// src/pages/api/news.js
import axios from "axios";

export default async function handler(req, res) {
  const { FINNHUB_API_KEY } = process.env;

  if (!FINNHUB_API_KEY) {
    console.error("FINNHUB_API_KEY is not set in /api/news.");
    return res.status(500).json({ error: "API key is not configured." });
  }

  const url = `https://finnhub.io/api/v1/news`;

  try {
    const apiRes = await axios.get(url, {
      params: {
        category: "general",
        token: FINNHUB_API_KEY,
      },
      timeout: 10000, // 10-second timeout
    });

    const newsData = apiRes.data;
    const articles = newsData.slice(0, 20); // Limit to the top 20 articles

    res.status(200).json(articles);
  } catch (error) {
    console.error("Error fetching from Finnhub in /api/news:", error.message);

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Finnhub API Response Error:", error.response.data);
      res.status(error.response.status).json({
        error: "Failed to fetch news from Finnhub.",
        details: error.response.data,
      });
    } else if (error.request) {
      // The request was made but no response was received (e.g., timeout)
      res
        .status(504)
        .json({ error: "No response from Finnhub API (Gateway Timeout)." });
    } else {
      // Something happened in setting up the request that triggered an Error
      res.status(500).json({ error: "An internal server error occurred." });
    }
  }
}
