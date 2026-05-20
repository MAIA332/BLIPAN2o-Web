import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;

  // No seu route.ts
  try {
    console.log("Tentando conectar ao backend:", `${backendUrl}/auth/login`);
    const response = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text(); // Captura o erro real do servidor
      console.error("Erro do Backend:", errorText);
      return NextResponse.json({ message: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Erro no Proxy:", error.message); // Verifique o log do terminal!
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}