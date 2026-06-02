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

    if (!authRes.ok) throw new Error('Falha na autenticação da IA Mindy')
    const authData = await authRes.json()
    const token = authData.token

    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1'

    // ==========================================
    // PROMPT OTIMIZADO (ESTRUTURA RAG / FALHAS)
    // ==========================================
    const prompt = `
[PAPEL]
Você é um Arquiteto de Soluções Conversacionais focado em auditoria de fluxos, transbordos e retenção.

[CONTEXTO DE DADOS]
Abaixo estão os logs exatos extraídos do roteador do bot:
- Matriz de Transições (Origem -> Destino | Volume | Abandonos): ${JSON.stringify(sortedSteps)}
- Top Blocos com Abandono Silencioso: ${JSON.stringify(dropRanking)}

[TAREFA E FOCO (DIAGNÓSTICO DE FALHAS)]
Avalie EXCLUSIVAMENTE os dados fornecidos para identificar onde o bot falha em reter ou guiar o usuário. Ignore caminhos saudáveis e concentre sua análise em:

1. Loops de Frustração: Identifique padrões onde o usuário fica preso indo e voltando entre os mesmos blocos (ex: Menu -> Erro -> Menu).
2. Quedas em Exceções/Fallback: Quais passos estão engatilhando as mensagens de erro ou de "não entendi" com maior frequência?
3. Abandono Abrupto (Drop-offs): Analisando o ranking de abandonos, elabore hipóteses causais lógicas: por que o usuário desiste nesses blocos específicos? É um formulário longo? É uma quebra de expectativa?
4. Pressão de Transbordo (Handoff): Verifique se há picos de redirecionamento direto para atendimento humano (desk).

[FORMATO DE SAÍDA]
Apresente um relatório de "Análise de Gargalos". Seja incisivo, analítico e proponha melhorias arquiteturais simples para estancar a perda de usuários. Use listas. Evite markdown excessivo.
`;

    // 3. Chamada para o Chat da Mindy
    const chatRes = await fetch(`${process.env.MINDYAPIURL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ip, slug: process.env.MINDYSLUG, message: prompt })
    })

    if (!chatRes.ok) throw new Error('Falha ao gerar o insight da jornada')

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