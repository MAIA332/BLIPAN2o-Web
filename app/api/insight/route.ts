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
Você é um Analista de Dados e Especialista em Treinamento de IA (NLP QA) focado em melhorar chatbots.

[CONTEXTO DE DADOS]
- Bloco analisado: "${blockName}"
- Inputs recebidos (Mensagem do Usuário : Frequência): ${JSON.stringify(chartData)}

[TAREFA]
Utilizando EXCLUSIVAMENTE o [CONTEXTO DE DADOS] fornecido, audite o comportamento dos usuários neste bloco específico. 

[FOCO DE ATENÇÃO (CRÍTICO)]
Seu foco principal não é o caminho feliz, mas sim as FALHAS. Analise os dados para descobrir:
1. Intenções Inesperadas: O que os usuários estão digitando que provavelmente o bot não foi treinado para entender neste momento?
2. Falsos Positivos/Erros de UX: Existem inputs que indicam frustração, sarcasmo, ou tentativas de pedir "atendente humano"?
3. Padrões de Ruído: Existem erros de digitação comuns, gírias ou ambiguidades que podem estar quebrando o fluxo?

[FORMATO DE SAÍDA]
Gere um diagnóstico direto e acionável em linguagem simples. Use marcadores (bullet points) para listar os principais pontos de atrito identificados. Não use formatação markdown complexa (apenas negrito e listas simples).
`;

    // 2. Chamada para o Chat da Mindy
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
        finalInsight = parsed.explicacao || parsed.veredicto || chatDataResponse
      }
    } catch (e) {
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