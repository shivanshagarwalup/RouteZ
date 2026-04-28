import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    
    if (!city) {
      return NextResponse.json(
        { error: 'City required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Weather fetch failed' },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6),
      condition: data.weather[0].description,
      icon: data.weather[0].icon,
      visibility: Math.round(data.visibility / 1000),
      pressure: data.main.pressure,
      updatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
