// app/api/insight-messages/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { contactId, messages } = await request.json()
    const last100Messages = Array.isArray(messages) ? messages.slice(0, 100) : []

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
Você é um Auditor de Qualidade de Customer Experience (CX QA) inspecionando logs de atendimento.

[CONTEXTO DE DADOS]
- Identificador do Contato: ${contactId || 'Cliente'}
- Histórico Conversacional (últimas interações): ${JSON.stringify(last100Messages)}

[TAREFA E FOCO DE AUDITORIA]
Faça a leitura do histórico e aja como um investigador procurando falhas no atendimento automatizado. Responda focando nos seguintes pontos:

1. Limitações do Bot: Onde exatamente o bot não conseguiu ajudar o usuário? Houve mensagens repetitivas ou respostas genéricas fora de contexto?
2. Atrito e Sentimento: Houve mudança no tom do usuário? (ex: respostas curtas, uso de letras maiúsculas, repetição da mesma pergunta indicando frustração).
3. Causa Raiz do Problema: O problema real do cliente foi resolvido pela automação ou ele precisou do atendimento humano por incapacidade técnica do fluxo?
4. Resumo Acionável para a Operação: O que o atendente humano que assumir este ticket precisa saber IMEDIATAMENTE para não irritar o cliente ainda mais?

[FORMATO DE SAÍDA]
Retorne um sumário executivo de auditoria. Seja extremamente direto. Use negrito para destacar os momentos exatos de falha. Não utilize formatação markdown complexa além de títulos simples e listas.
`;

    const chatRes = await fetch(`${process.env.MINDYAPIURL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ip, slug: process.env.MINDYSLUG, message: prompt })
    })

    if (!chatRes.ok) throw new Error('Falha ao gerar o insight')

    const chatDataResponse = await chatRes.json()
    
    let finalInsight = chatDataResponse
    try {
      if (typeof chatDataResponse === 'string') {
        const parsed = JSON.parse(chatDataResponse)
        finalInsight = parsed.explicacao || parsed.veredicto || parsed.resumo || chatDataResponse
      }
    } catch (e) {
      finalInsight = chatDataResponse
    }

    return NextResponse.json({ insight: finalInsight })

  } catch (error) {
    console.error("Erro na API de Insight de Mensagens:", error)
    return NextResponse.json(
      { error: 'Não foi possível gerar o insight do histórico neste momento.' }, 
      { status: 500 }
    )
  }
}