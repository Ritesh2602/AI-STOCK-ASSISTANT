// lib/stocks.ts
import axios from 'axios';

export async function fetchStockDataForAI(symbol: string) {
  const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
  const TIMEOUT = 5000; // 5 seconds

  // Helper to fetch a valid profile, trying a specific symbol
  async function fetchProfile(sym: string) {
    if (!sym) return null;
    try {
      const { data: profile } = await axios.get(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${sym}&token=${FINNHUB_API_KEY}`,
        { timeout: TIMEOUT }
      );
      // A valid profile has a name and is not an empty object.
      if (profile && profile.name) {
        return profile;
      }
      return null;
    } catch (e) {
      // Don't log error here, it's expected that some variations will fail.
      return null;
    }
  }

  // Helper to fetch a valid quote, trying a specific symbol
  async function fetchQuote(sym: string) {
    if (!sym) return null;
    try {
      const { data: quote } = await axios.get(
        `https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FINNHUB_API_KEY}`,
        { timeout: TIMEOUT }
      );
      // A valid quote for a traded stock won't have all zero values.
      if (quote && (quote.c !== 0 || quote.pc !== 0)) {
        return quote;
      }
      return null;
    } catch (e) {
      // Don't log error here.
      return null;
    }
  }

  // --- Main Logic ---
  // For US stocks, we only need to try the symbol as-is.
  // The frontend ensures it's uppercased.
  const profile = await fetchProfile(symbol);
  const quote = await fetchQuote(symbol);

  if (!profile || !quote) {
    // Only log an error if all attempts fail.
    console.error(
      `Failed to resolve stock data for ${symbol}. This may be an invalid US stock symbol.`
    );
    throw new Error(`Failed to fetch comprehensive stock data for ${symbol}`);
  }

  return { profile, quote };
}
