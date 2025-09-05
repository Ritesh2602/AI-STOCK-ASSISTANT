import { NextResponse } from "next/server";
import { askAI } from "@/lib/ai"; // wrapper for OpenAI/HuggingFace/Cohere etc.

export async function POST(req: Request) {
  try {
    const { stock } = await req.json();

    const prompt = `Analyze the investment risk of stock ${stock}. 
    Consider factors like volatility, price stability, possible downside, 
    and overall risk profile for a medium-term investor. 
    Provide the answer in plain language.`;

    const analysis = await askAI(prompt);
    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("❌ Risk API error:", err);
    return NextResponse.json(
      { error: "Failed to analyze risk" },
      { status: 500 }
    );
  }
}
