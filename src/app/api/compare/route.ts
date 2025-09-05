import { NextResponse } from 'next/server';
import { fetchStockDataForAI } from '@/lib/stocks';
import { askAI } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const { stockA, stockB } = await req.json();

    if (!stockA || !stockB) {
      return NextResponse.json(
        { error: 'Two stock symbols are required.' },
        { status: 400 }
      );
    }

    // Fetch data for both stocks concurrently
    const results = await Promise.allSettled([
      fetchStockDataForAI(stockA),
      fetchStockDataForAI(stockB),
    ]);

    const dataA = results[0].status === 'fulfilled' ? results[0].value : null;
    const dataB = results[1].status === 'fulfilled' ? results[1].value : null;

    // If either stock fails to fetch, return a clear error.
    if (!dataA || !dataB) {
      const errorA =
        results[0].status === 'rejected' ? results[0].reason.message : null;
      const errorB =
        results[1].status === 'rejected' ? results[1].reason.message : null;

      let errorMessage = 'Failed to fetch data for one or more stocks.';
      if (errorA) errorMessage = errorA;
      if (errorB) errorMessage = errorB;
      if (errorA && errorB)
        errorMessage = `Could not fetch data for either stock. Error for ${stockA}: ${errorA}. Error for ${stockB}: ${errorB}`;

      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }

    // Create a detailed prompt for the AI
    const prompt = `
      As a senior financial analyst, provide a concise comparison between two stocks: ${dataA.profile.name} (${stockA}) and ${dataB.profile.name} (${stockB}).

      Here is the latest data for each:

      **${stockA} (${dataA.profile.name})**
      - Current Price: ${dataA.quote.c} ${dataA.profile.currency}
      - Day's High: ${dataA.quote.h}
      - Day's Low: ${dataA.quote.l}
      - Previous Close: ${dataA.quote.pc}
      - Market Capitalization: ${dataA.profile.marketCapitalization} million ${dataA.profile.currency}
      - Industry: ${dataA.profile.finnhubIndustry}

      **${stockB} (${dataB.profile.name})**
      - Current Price: ${dataB.quote.c} ${dataB.profile.currency}
      - Day's High: ${dataB.quote.h}
      - Day's Low: ${dataB.quote.l}
      - Previous Close: ${dataB.quote.pc}
      - Market Capitalization: ${dataB.profile.marketCapitalization} million ${dataB.profile.currency}
      - Industry: ${dataB.profile.finnhubIndustry}

      Based on this snapshot, analyze their current valuation, market position, and which might be a better investment for a risk-averse investor. Keep the analysis to three short paragraphs.
    `;

    const aiResponse = await askAI(prompt);

    return NextResponse.json({
      response: aiResponse,
      details: { [stockA]: dataA, [stockB]: dataB },
    });
  } catch (error: any) {
    console.error('Error in /api/compare:', error.message);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred during comparison.' },
      { status: 500 }
    );
  }
}