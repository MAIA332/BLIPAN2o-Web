// app/api/blip/an/campaign-report/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
  const authHeader = request.headers.get('Authorization');
  const body = await request.json();

  try {
    const response = await fetch(`${backendUrl}/blip/an/campaign-report`, {
      method: 'POST',
      headers: { 
        'Authorization': authHeader || '',
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Erro no proxy /blip/an/campaign-report:", error);
    return NextResponse.json({ message: 'Erro ao conectar ao servidor de dados' }, { status: 500 });
  }
}