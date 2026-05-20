// app/api/users/me/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
  const authHeader = request.headers.get('Authorization');

  try {
    const response = await fetch(`${backendUrl}/users/me`, {
      method: 'GET',
      headers: { 
        'Authorization': authHeader || '',
        'Content-Type': 'application/json' 
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao buscar perfil no backend' }, { status: 500 });
  }
}