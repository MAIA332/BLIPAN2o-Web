import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
  const authHeader = request.headers.get('Authorization');
  const body = await request.json();

  try {
    // 1. Redireciona para o endpoint correto no backend FastAPI
    const response = await fetch(`${backendUrl}/blip/an/contact-view`, {
      method: 'POST',
      headers: { 
        'Authorization': authHeader || '',
        'Content-Type': 'application/json' 
      },
      // 2. Repassa o body exatamente como recebido (espera branch_id e contact_identity)
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    // 3. Retorna a resposta para o frontend mantendo o status code da API
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Erro no proxy /blip/an/contact-view:", error);
    return NextResponse.json(
      { success: false, message: 'Erro ao conectar ao servidor de dados' }, 
      { status: 500 }
    );
  }
}