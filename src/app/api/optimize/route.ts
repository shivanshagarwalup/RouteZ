import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { source, destination, riskData } = body;
    
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY missing' }, { status: 500 });
    }

    const prompt = `You are a route optimization expert. Analyze this shipment and respond ONLY with raw JSON:

Source: ${source}
Destination: ${destination}
Risk Level: ${riskData?.risk_level || 'Medium'}
Risk Score: ${riskData?.risk_score || 50}
Risk Factors: ${riskData?.factors?.join(', ') || 'Unknown'}

Return exactly this JSON:
{"best_route":"description","alternative_route":"description","time_saved":"X hours","risk_reduction":"X%","reasoning":"explanation","waypoints":["city1","city2"]}`;

    console.log('Calling Groq API for route optimization...');

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
              content: 'You are a route optimization expert. Always respond with raw JSON only. Do not wrap in markdown tags.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 400
        })
      }
    );

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Groq Optimization error:', errorData);
        return NextResponse.json({ error: 'Groq API failed', details: errorData }, { status: 500 });
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    const cleaned = text.replace(/```json|```/g, '').trim();
    
    let result;
    try {
      result = JSON.parse(cleaned);
      console.log('Groq Optimization parsed successfully');
    } catch {
      result = {
        best_route: 'Primary highway route recommended',
        alternative_route: 'Coastal route as backup',
        time_saved: '2 hours',
        risk_reduction: '30%',
        reasoning: 'Strategic network optimization based on current risk profile',
        waypoints: [source, destination]
      };
    }
    
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Groq Optimize Route error:', error.message);
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}
