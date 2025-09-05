import { NextResponse } from "next/server";
import { askAI } from "@/lib/ai";
import { connectDB } from "@/lib/mongo";
import Portfolio from "@/models/Portfolio";
import jwt from "jsonwebtoken";

// GET - Retrieve user's portfolio
export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    await connectDB();

    const portfolio = await Portfolio.find({ userId: decoded.userId });
    return NextResponse.json({ stocks: portfolio });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 });
  }
}

// POST - Save portfolio and get AI analysis
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = req.headers.get("authorization")?.replace("Bearer ", "");

    if (!body.stocks || !Array.isArray(body.stocks)) {
      return NextResponse.json(
        { error: "Invalid format. Expected { stocks: [{ name, quantity }] }" },
        { status: 400 }
      );
    }

    // Save to database if user is logged in
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        await connectDB();

        // Clear existing portfolio
        await Portfolio.deleteMany({ userId: decoded.userId });

        // Save new portfolio
        const portfolioItems = body.stocks.map((stock: any) => ({
          userId: decoded.userId,
          stockSymbol: stock.name,
          quantity: stock.quantity,
          averagePrice: 0 // Default value
        }));

        await Portfolio.insertMany(portfolioItems);
      } catch (dbErr) {
        console.error("Database error:", dbErr);
      }
    }

    // Convert stock list into a readable string
    const portfolioText = body.stocks
      .map((s: { name: string; quantity: number }) => `${s.quantity} shares of ${s.name}`)
      .join(", ");

    // AI prompt for Indian stock analysis
    const prompt = `Analyze this Indian stock portfolio: ${portfolioText}.
    
    Provide analysis considering:
    - Indian market conditions and sectors
    - NSE/BSE performance trends
    - Rupee volatility impact
    - Regulatory changes in India
    - Sectoral diversification within Indian markets
    - Risk assessment for Indian equities
    - Growth opportunities in Indian economy
    
    Give specific recommendations for Indian stock investors.`;

    // Call AI helper
    const aiResponse = await askAI(prompt);

    return NextResponse.json({ analysis: aiResponse || "No analysis generated." });
  } catch (err) {
    console.error("❌ Analyze Portfolio API failed:", err);
    return NextResponse.json({ error: "Server error analyzing portfolio." }, { status: 500 });
  }
}
