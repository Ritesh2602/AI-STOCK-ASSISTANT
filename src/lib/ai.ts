// src/lib/ai.ts - Updated to fix deprecated Cohere model
import { CohereClient } from "cohere-ai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY!,
});

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const HF_API_URL =
  "https://api-inference.huggingface.co/models/google/flan-t5-base";

// ✅ Google Gemini
async function tryGemini(prompt: string): Promise<string | null> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text?.trim() || null;
  } catch (err) {
    console.error("⚠️ Gemini failed:", err);
    return null;
  }
}

// ✅ Cohere with chat API
async function tryCohere(prompt: string): Promise<string | null> {
  try {
    const response = await cohere.chat({
      model: "command-r-plus", // Updated to use available model
      message: prompt,
      maxTokens: 1000, // Add token limit
      temperature: 0.3, // Add temperature for consistent responses
    });

    const text = response.text?.trim();
    return text || null;
  } catch (err) {
    console.error("⚠️ Cohere failed:", err);
    // Try with a different model if command-r-plus fails
    try {
      const fallbackResponse = await cohere.chat({
        model: "command", // Fallback to basic command model
        message: prompt,
        maxTokens: 1000,
        temperature: 0.3,
      });
      return fallbackResponse.text?.trim() || null;
    } catch (fallbackErr) {
      console.error("⚠️ Cohere fallback also failed:", fallbackErr);
      return null;
    }
  }
}

// ✅ Hugging Face
async function tryHF(prompt: string): Promise<string | null> {
  try {
    const res = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!res.ok) {
      console.error("⚠️ HF API error:", res.status, res.statusText);
      return null;
    }

    const text = await res.text();
    if (!text || text === "Not Found") {
      return null;
    }

    const data = JSON.parse(text);

    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text.trim();
    }

    if (data?.error) {
      console.error("⚠️ Hugging Face error:", data.error);
    }

    return null;
  } catch (err) {
    console.error("⚠️ Hugging Face failed:", err);
    return null;
  }
}

// ✅ Unified entry point with fallback
export async function askAI(prompt: string): Promise<string> {
  // Try Gemini first (more reliable)
  const geminiRes = await tryGemini(prompt);
  if (geminiRes) return geminiRes;

  // Try Cohere as backup
  const cohereRes = await tryCohere(prompt);
  if (cohereRes) return cohereRes;

  // Try Hugging Face as last resort
  const hfRes = await tryHF(prompt);
  if (hfRes) return hfRes;

  // Fallback analysis for portfolio
  if (prompt.includes("portfolio")) {
    return `Portfolio Analysis:

✅ Diversification: Your portfolio shows exposure to Indian markets. Consider spreading across different sectors like IT, Banking, FMCG, and Pharma.

⚠️ Risk Assessment: Indian stocks can be volatile. Monitor market conditions and regulatory changes.

📈 Growth Opportunities: Focus on fundamentally strong companies with good management and consistent earnings growth.

💡 Recommendations:
- Review portfolio quarterly
- Maintain 10-15% cash for opportunities
- Consider SIP investments for rupee cost averaging
- Stay updated with company quarterly results`;
  }

  return "⚠️ AI analysis temporarily unavailable. Please try again later.";
}
