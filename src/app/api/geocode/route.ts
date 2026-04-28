import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    
    if (!city) {
      return NextResponse.json(
        { error: 'City parameter required' },
        { status: 400 }
      );
    }

    // Nominatim requires a descriptive User-Agent
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'SmartSupplyChainOptimizer/1.0 (Logistics Risk Analysis Platform)'
        }
      }
    );

    if (!response.ok) {
        throw new Error(`Nominatim API returned status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: `Coordinate resolution failed for: "${city}"` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name
    });

  } catch (error: any) {
    console.error('Geocoding Backend Error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
