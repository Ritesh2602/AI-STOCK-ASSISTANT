import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET(
  req: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = decodeURIComponent(params.symbol);

    // Parse query (timeframe TF: 1M, 6M, 1Y)
    const { searchParams } = new URL(req.url);
    const tf = searchParams.get("tf") || "6M";

    // Compute period1 based on TF
    const today = new Date();
    let period1 = new Date();
    if (tf === "1M") period1.setMonth(today.getMonth() - 1);
    else if (tf === "6M") period1.setMonth(today.getMonth() - 6);
    else if (tf === "1Y") period1.setFullYear(today.getFullYear() - 1);

    // Fetch historical data
    const result = await yahooFinance.historical(symbol, {
      period1,
      interval: "1d",
    });

    const prices = result.map((d: any) => ({
      date: d.date.toISOString().split("T")[0],
      close: d.close,
    }));

    return NextResponse.json({ symbol, tf, prices });
  } catch (err) {
    console.error("❌ Stock API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}
