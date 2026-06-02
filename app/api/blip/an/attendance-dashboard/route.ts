import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Extrai os dados do body enviados pelo Hook do React
    const body = await request.json();
    const { branch_id, startDate, endDate } = body;

    // 2. Validação simples no BFF
    if (!branch_id || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: 'Parâmetros ausentes. Envie branch_id, startDate e endDate.' },
        { status: 400 }
      );
    }

    // 3. Repassa o Token de Autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Token de autorização ausente.' },
        { status: 401 }
      );
    }

    // 4. Define a URL do backend Python (Ajuste a variável de ambiente conforme seu projeto)
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8000';
    
    // 5. Faz o Proxy (Ponte) enviando a requisição para o FastAPI
    const response = await fetch(`${backendUrl}/blip/an/attendance-dashboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader, // Repassa o Bearer token
      },
      body: JSON.stringify({ branch_id, startDate, endDate }),
    });

    // Se o backend Python retornar 404
    if (response.status === 404) {
      return NextResponse.json(
        { success: false, message: 'A rota não foi encontrada no servidor backend Python (404).' },
        { status: 404 }
      );
    }

    // 6. Retorna a resposta exata do Python para o Frontend
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || 'Erro ao processar requisição no backend Python', 
          error: data.error 
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error('[Next.js] Erro na rota /api/blip/an/attendance-dashboard:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno no servidor Frontend (Next.js Proxy).', error: error.message },
      { status: 500 }
    );
  }
}