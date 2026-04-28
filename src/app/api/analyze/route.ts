import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { source, destination, srcWeather, dstWeather, distance, shipmentType } = body;
    
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      console.error('Groq API Error: GROQ_API_KEY not found');
      return NextResponse.json(
        { error: 'GROQ_API_KEY not found' }, 
        { status: 500 }
      );
    }

    const formatWeather = (w: any) => {
      if (!w) return 'Data unavailable';
      if (typeof w === 'string') return w;
      return `${w.condition}, ${w.temperature}°C (Feels like ${w.feelsLike}°C), Wind: ${w.windSpeed}km/h, Hum: ${w.humidity}%, Vis: ${w.visibility}km`;
    };

    const effectiveDstWeather = dstWeather || srcWeather;
    const srcDesc = formatWeather(srcWeather);
    const dstDesc = formatWeather(effectiveDstWeather);
    const tempDelta = srcWeather && effectiveDstWeather 
      ? Math.abs(srcWeather.temperature - effectiveDstWeather.temperature)
      : 0;

    const prompt = `You are a logistics risk analyst. Analyze this road shipment and respond ONLY with a raw JSON object. No markdown, no backticks, no explanation:

Source: ${source} (Weather: ${srcDesc})
Destination: ${destination} (Weather: ${dstDesc})
Thermal Gradient: ${tempDelta}°C difference
Actual Road Distance: ${distance} km
Shipment Type: ${shipmentType}

Strict Severity Protocol:
1. Clear/Cloudy: Multiplier 1.0x (Baseline)
2. Rain/Drizzle/Mist: Multiplier 1.2x (+15-20 risk points)
3. Storm/Snow/Ice: Multiplier 1.5x (+35-50 risk points)
4. Wind > 45km/h: Add high-speed structural risk factor.
5. Temp Delta > 18°C: Add thermal cargo integrity risk.

Return exactly this JSON structure:
{"risk_level":"Low" | "Medium" | "High","risk_score":number,"factors":string[],"recommendation":"recommendation here","estimated_delay":"range here","confidence":number}`;

    console.log('Calling Groq AI for Deep Environmental Analysis...');

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a logistics risk analyst. Always respond with raw JSON only. Primary focus: Weather severity impact on road transit.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 500
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API failure:', JSON.stringify(errorData));
      return NextResponse.json({ error: 'Groq API failed', details: errorData }, { status: 500 });
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    const cleaned = text.replace(/```json|```/g, '').trim();
    
    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      result = {
        risk_level: 'Medium',
        risk_score: 50,
        factors: ['Environmental analysis parsing variability', 'Manual review of thermal delta recommended'],
        recommendation: 'Strategic analysis link variable. Proceed with caution.',
        estimated_delay: '1-2 hours',
        confidence: 60
      };
    }
    
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Analyze Route critical failure:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
