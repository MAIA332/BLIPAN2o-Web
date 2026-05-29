// app/api/insight-journey/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { sortedSteps, dropRanking } = await request.json()

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

    // 2. Montar o Prompt focando nos seus dois objetivos
    const prompt = `Você é um analista de dados e UX especialista em fluxos de chatbots.
    Analise os seguintes dados extraídos de uma jornada de usuários:
    
    1. Passos da Jornada (Origem -> Destino | Volume | Abandonos): ${JSON.stringify(sortedSteps)}
    2. Top Blocos com Abandono: ${JSON.stringify(dropRanking)}
    
    Por favor, forneça uma análise estruturada em duas partes:
    
    PARTE 1: Fluidez do Fluxo
    - Avalie a saúde da jornada.
    - Identifique gargalos, anomalias ou possíveis loops de repetição de transbordo/pesquisa (atente-se a padrões onde o usuário fica preso indo e voltando entre os mesmos blocos).
    - Sugira pontos de melhoria no fluxo.
    
    PARTE 2: Análise de Abandonos (Drop-offs)
    - Olhando para os blocos com maior abandono, elabore hipóteses lógicas do porquê os usuários estão saindo do fluxo nesses momentos específicos.
    
    Retorne a resposta em linguagem simples, direta e formatada para fácil leitura (pode usar quebras de linha, mas evite markdown complexo).`

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
      throw new Error('Falha ao gerar o insight da jornada')
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
    console.error("Erro na API de Insight de Jornada:", error)
    return NextResponse.json(
      { error: 'Não foi possível gerar a análise da jornada neste momento.' }, 
      { status: 500 }
    )
  }
}