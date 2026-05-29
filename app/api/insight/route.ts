// app/api/insight/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { blockName, chartData } = await request.json()

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

    // Pegar o IP do request (padrão em Next.js)
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1'

    // Montar o Prompt com os dados reais
    const prompt = `Analise os seguintes inputs de usuários recebidos no bloco "${blockName}" de um fluxo de chatbot. 
    Dados dos inputs (Ação : Quantidade): ${JSON.stringify(chartData)}. 
    Aja como um analista de dados. Gere um resumo em linguagem simples mas detalhada explicando o que esses dados significam, quais os principais comportamentos, e como os usuários estão interagindo com este bloco. Retorne apenas o texto da explicação de forma direta, sem tags markdown pesadas.`

    // 2. Chamada para o Chat da Mindy
    const chatRes = await fetch(`${process.env.MINDYAPIURL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Presumindo envio de token via Bearer
      },
      body: JSON.stringify({
        ip: ip,
        slug: process.env.MINDYSLUG,
        message: prompt
      })
    })

    if (!chatRes.ok) {
      throw new Error('Falha ao gerar o insight')
    }

    const chatDataResponse = await chatRes.json()
    
    // Como a Mindy pode retornar um JSON em formato de string (como mostrado no seu exemplo),
    // tentamos fazer o parse para extrair a explicação caso o seu Slug tenha uma formatação travada.
    let finalInsight = chatDataResponse
    try {
      if (typeof chatDataResponse === 'string') {
        const parsed = JSON.parse(chatDataResponse)
        finalInsight = parsed.explicacao || parsed.veredicto || chatDataResponse
      }
    } catch (e) {
      // Se não for JSON, usamos a string bruta retornada
      finalInsight = chatDataResponse
    }

    return NextResponse.json({ insight: finalInsight })

  } catch (error) {
    console.error("Erro na API de Insight:", error)
    return NextResponse.json(
      { error: 'Não foi possível gerar o insight neste momento.' }, 
      { status: 500 }
    )
  }
}