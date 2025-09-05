import axios from "axios";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const BASE_URL = "https://finnhub.io/api/v1";

// Fetch latest market news
export const fetchNews = async () => {
  const response = await axios.get(`${BASE_URL}/news`, {
    params: { category: "general", token: FINNHUB_API_KEY },
  });
  return response.data;
};

// Fetch real-time stock quote
export const fetchStockQuote = async (symbol: string) => {
  const response = await axios.get(`${BASE_URL}/quote`, {
    params: { symbol, token: FINNHUB_API_KEY },
  });
  return response.data; // {c: current, h: high, l: low, o: open, pc: prevClose}
};
