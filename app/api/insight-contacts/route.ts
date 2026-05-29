// app/api/insight-contacts/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const metrics = await request.json()

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
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'

    // 2. Montar o Prompt focando em engajamento e comportamento
    const prompt = `Você é um Cientista de Dados e UX focado em Chatbots.
    Analise as seguintes métricas globais de contatos deste bot:
    
    Dados de Engajamento:
    - Total de Contatos: ${metrics.totalContacts}
    - Interagiram: ${metrics.withInteraction} (${metrics.interactionRate}%)
    - Não Responderam (Rejeição): ${metrics.noResponse} (${metrics.rejectionRate}%)
    - Taxa de Recorrência (Voltaram ao bot): ${metrics.recurrenceRate || 0}%
    
    Esforço de Conversa (O bot fala sozinho?):
    - Mensagens enviadas pelo Bot: ${metrics.totalSent || 'N/A'}
    - Mensagens recebidas do Usuário: ${metrics.totalReceived || 'N/A'}
    
    Por favor, faça uma análise abrangente, estruturada e criativa dividida em:
    
    ### 1. Diagnóstico de Engajamento
    Avalie a relação entre rejeição e interação. O volume de pessoas ignorando o bot é alarmante ou aceitável?
    
    ### 2. Esforço e Recorrência
    Analise a proporção de mensagens (enviadas vs recebidas) e se a taxa de recorrência indica que o chatbot resolve os problemas ou se os usuários evitam voltar.
    
    ### 3. Insights Acionáveis
    Forneça 3 ideias criativas e práticas para tentar reverter contatos sem resposta em contatos com interação.
    
    Formate o texto usando Markdown simples. Seja direto e analítico.`

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

    if (!chatRes.ok) throw new Error('Falha ao gerar o insight de contatos')

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
    console.error("Erro na API de Insight de Contatos:", error)
    return NextResponse.json(
      { error: 'Não foi possível gerar a análise neste momento.' }, 
      { status: 500 }
    )
  }
}