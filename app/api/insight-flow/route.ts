import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { flowData, totalTransitions } = await request.json()

    // 1. Autenticação na Mindy API
    const authRes = await fetch(`${process.env.MINDYAPIURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.MINDYUSER,
        password: process.env.PASS
      })
    })

    if (!authRes.ok) throw new Error('Falha na autenticação da IA Mindy')

    const authData = await authRes.json()
    const token = authData.token

    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1'

    // 2. Montar o Prompt focado no fluxo direcional
    const prompt = `Você é um analista de UX e Engenheiro de Dados especialista em fluxos conversacionais (chatbots).
    Analise os dados abaixo, que representam as origens e para onde os usuários mais fluem dentro de um bot.
    
    Total de Transições no período: ${totalTransitions}
    Top Caminhos do Fluxo: ${JSON.stringify(flowData)}
    
    Forneça uma análise estruturada contendo:
    
    PARTE 1: O "Happy Path" (Caminho Feliz)
    - Quais são os blocos que mais concentram tráfego e para onde eles estão enviando os usuários? Este é o fluxo principal esperado?
    
    PARTE 2: Gargalos e Fugas
    - Identifique padrões anormais. Muitos usuários indo para blocos de "Saída" precocemente? Muitos caindo em blocos de "Outros", "Default" ou "Erro"?
    
    PARTE 3: Recomendação
    - Sugira 1 ou 2 ações baseadas nos dados para otimizar o roteamento desse fluxo.
    
    Responda de forma direta, clara e formatada com quebras de linha e tópicos. Evite termos excessivamente técnicos, foque no valor de negócio.`

    // 3. Chamada para o Chat da Mindy
    const chatRes = await fetch(`${process.env.MINDYAPIURL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ip, slug: process.env.MINDYSLUG, message: prompt })
    })

    if (!chatRes.ok) throw new Error('Falha ao gerar o insight de fluxo')

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
    console.error("Erro na API de Insight de Fluxo:", error)
    return NextResponse.json(
      { error: 'Não foi possível gerar a análise do fluxo neste momento.' }, 
      { status: 500 }
    )
  }
}