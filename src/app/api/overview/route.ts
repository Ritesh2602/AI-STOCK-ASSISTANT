// src/app/api/overview/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${process.env.FINNHUB_API_KEY}`);
    const news = await res.json();

    return NextResponse.json({ success: true, news });
  } catch (err) {
    console.error("⚠️ Overview API error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch market news" }, { status: 500 });
  }
}
