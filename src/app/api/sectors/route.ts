import { NextResponse, type NextRequest } from 'next/server';
import axios from 'axios';

const POLYGON_API_KEY = process.env.POLYGON_API_KEY || 'demo';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sector = searchParams.get('sector');

  if (!sector) {
    return NextResponse.json({ error: 'Sector is required' }, { status: 400 });
  }

  try {
    // Map sectors to search terms for better filtering
    const sectorSearchTerms: { [key: string]: string[] } = {
      'Information Technology': ['technology', 'software', 'computer', 'internet', 'tech'],
      'Financial Services': ['bank', 'financial', 'insurance', 'investment', 'credit'],
      'Energy': ['oil', 'gas', 'energy', 'petroleum', 'utilities'],
      'Healthcare': ['pharmaceutical', 'medical', 'health', 'biotech', 'drug'],
      'Consumer Staples': ['food', 'beverage', 'retail', 'consumer', 'household'],
      'Industrials': ['manufacturing', 'industrial', 'construction', 'machinery'],
      'Automobiles and Auto Components': ['automotive', 'auto', 'vehicle', 'motor'],
      'Materials': ['materials', 'mining', 'steel', 'chemical', 'metals'],
      'Real Estate': ['real estate', 'property', 'reit', 'housing'],
      'Utilities': ['utilities', 'electric', 'water', 'power', 'gas']
    };

    const searchTerms = sectorSearchTerms[sector] || [sector.toLowerCase()];
    
    // Search with sector-specific terms
    const response = await axios.get(
      `https://api.polygon.io/v3/reference/tickers?search=${searchTerms[0]}&market=stocks&active=true&limit=100&apikey=${POLYGON_API_KEY}`
    );

    const allStocks = response.data.results || [];
    
    // Filter stocks by multiple sector terms
    const sectorStocks = allStocks.filter((stock: any) => {
      const stockInfo = `${stock.name} ${stock.sic_description} ${stock.description}`.toLowerCase();
      return searchTerms.some(term => stockInfo.includes(term));
    });

    const stocks = sectorStocks.slice(0, 70).map((stock: any) => ({
      symbol: stock.ticker,
      displaySymbol: stock.ticker,
      description: stock.name || stock.description || stock.ticker,
      type: stock.type || 'Common Stock',
      currency: stock.currency_name || 'USD',
      sector: stock.sic_description || 'Unknown',
      marketCap: stock.market_cap,
      exchange: stock.primary_exchange
    }));

    return NextResponse.json({ stocks });

  } catch (error: any) {
    console.error('Polygon.io API error:', error.response?.data || error.message);
    
    return NextResponse.json(
      { error: 'Failed to fetch dynamic stock data from Polygon.io' },
      { status: 500 }
    );
  }
}