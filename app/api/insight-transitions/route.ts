// app/api/insight-transitions/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { transitions } = await request.json()

    // 1. Autenticação na Mindy API
    const authRes = await fetch(`${process.env.MINDYAPIURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.MINDYUSER,
        password: process.env.PASS
      })
    })

    if (!authRes.ok) {
      throw new Error('Falha na autenticação da IA Mindy')
    }

    const authData = await authRes.json()
    const token = authData.token

    // Pegar o IP do request
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1'

    // 2. Montar o Prompt focado nas probabilidades
    const prompt = `Você é um analista de dados e especialista em UX conversacional.
    Analise os seguintes dados que representam a Probabilidade de Transição entre blocos de um chatbot:
    
    Dados (Origem -> Destino | Probabilidade): ${JSON.stringify(transitions)}
    
    Por favor, forneça uma análise estruturada em duas partes:
    
    PARTE 1: Compreensão do Comportamento
    - Explique de forma simples o que esses dados representam no contexto da jornada do usuário.
    - Destaque quais são os caminhos mais fortes (maior probabilidade de transição de um bloco para outro).
    
    PARTE 2: Insights e Alertas
    - Identifique possíveis "armadilhas" (loops) ou caminhos que indicam confusão do usuário, baseando-se em altas probabilidades de transição para blocos de erro/exceção/transbordo.
    - Sugira pontos de atenção ou melhorias no desenho desse fluxo.
    
    Retorne a resposta em linguagem simples, direta e formatada para fácil leitura (use quebras de linha, listas com -, mas evite markdown complexo).`

    // 3. Chamada para o Chat da Mindy
    const chatRes = await fetch(`${process.env.MINDYAPIURL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ip: ip,
        slug: process.env.MINDYSLUG,
        message: prompt
      })
    })

    if (!chatRes.ok) {
      throw new Error('Falha ao gerar o insight de transições')
    }

    const chatDataResponse = await chatRes.json()
    
    let finalInsight = chatDataResponse
    try {
      if (typeof chatDataResponse === 'string') {
        const parsed = JSON.parse(chatDataResponse)
        finalInsight = parsed.explicacao || parsed.veredicto || chatDataResponse
      }
    } catch (e) {
      finalInsight = chatDataResponse
    }

    return NextResponse.json({ insight: finalInsight })

  } catch (error) {
    console.error("Erro na API de Insight de Transições:", error)
    return NextResponse.json(
      { error: 'Não foi possível gerar a análise de transições neste momento.' }, 
      { status: 500 }
    )
  }
}