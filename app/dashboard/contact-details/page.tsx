'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

import {
  Loader2,
  Ticket,
  Bot,
  User,
  Paperclip,
  Image as ImageIcon
} from 'lucide-react'

function ContactDetailsContent() {

  const searchParams = useSearchParams()

  const identity = searchParams.get('identity')
  const branchId = searchParams.get('branchId')

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // =====================================================
  // FETCH
  // =====================================================
  useEffect(() => {

    if (!identity || !branchId) return

    const fetchData = async () => {

      const token = localStorage.getItem('access_token')

      try {

        const res = await fetch('/api/blip/an/contact-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            branch_id: branchId,
            contact_identity: identity
          })
        })

        const result = await res.json()

        if (result.success) {
          setData(result.data)
        } else {
          console.error('Erro na API:', result.message)
        }

      } catch (e) {
        console.error('Erro ao carregar detalhes:', e)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

  }, [identity, branchId])

  // =====================================================
  // HELPERS
  // =====================================================

  const formatLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  }

  const renderValue = (value: any) => {

    if (value === null || value === undefined) {
      return 'N/A'
    }

    if (typeof value === 'boolean') {
      return value ? 'Sim' : 'Não'
    }

    if (typeof value === 'object') {
      return JSON.stringify(value)
    }

    return String(value)
  }

  // =====================================================
  // MEDIA LINK (Imagens, Vídeos, Stickers, Arquivos)
  // =====================================================
  const renderMediaLink = (content: any) => {
    const uri = content?.uri
    const mimeType = content?.type || ''
    const text = content?.text || ''

    if (!uri) return null

    return (
      <div className="space-y-2">
        {/* Renderiza a Mídia baseada no tipo */}
        {(mimeType.startsWith('image/') || mimeType.startsWith('sticker/')) ? (
          <img
            src={uri}
            alt="Media"
            className="rounded-xl border max-h-[320px] object-cover bg-black/5 dark:bg-white/5"
          />
        ) : mimeType.startsWith('video/') ? (
          <video
            src={uri}
            controls
            className="rounded-xl border max-h-[320px] bg-black/90 w-full"
          />
        ) : mimeType.startsWith('audio/') ? (
          <audio 
            src={uri} 
            controls 
            className="w-full max-w-[250px]" 
          />
        ) : (
          <a
            href={uri}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:underline text-sm p-3 rounded-lg bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 break-all"
          >
            <Paperclip className="h-4 w-4 shrink-0" />
            <span>{content?.title || 'Baixar Arquivo Anexo'}</span>
          </a>
        )}

        {/* Legenda (Se existir) */}
        {text && (
          <p className="text-sm text-foreground/90 whitespace-pre-wrap mt-2">
            {text}
          </p>
        )}
      </div>
    )
  }

  // =====================================================
  // LIME SELECT (Menus Clássicos Blip)
  // =====================================================
  const renderLimeSelect = (content: any) => {
    return (
      <div className="space-y-3">
        {content?.text && (
          <div className="text-sm whitespace-pre-wrap leading-relaxed">
            {content.text}
          </div>
        )}
        
        {content?.options?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {content.options.map((opt: any, idx: number) => (
              <div
                key={idx}
                className="px-3 py-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300 text-xs font-semibold cursor-default"
              >
                {opt?.text || opt?.value?.text || opt?.label || 'Opção'}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // =====================================================
  // RICH CARD
  // =====================================================

  const renderRichCard = (content: any) => {

    const card =
      content?.richCard?.standaloneCard?.cardContent

    if (!card) return null

    return (
      <div className="space-y-4">

        {/* Imagem */}
        {card?.media?.contentInfo?.fileUrl && (
          <div className="overflow-hidden rounded-xl border border-border">
            <img
              src={card.media.contentInfo.fileUrl}
              alt="Media"
              className="w-full max-h-[320px] object-cover"
            />
          </div>
        )}

        {/* Texto */}
        {card.description && (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {card.description}
          </p>
        )}

        {/* Sugestões */}
        {card.suggestions?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">

            {card.suggestions.map((s: any, idx: number) => (
              <div
                key={idx}
                className="px-3 py-2 rounded-xl border border-border bg-primary/10 text-sm"
              >
                {s.reply?.text}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // =====================================================
  // TICKET
  // =====================================================

  const renderTicket = (content: any) => {

    return (
      <div className="space-y-3">

        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Ticket className="h-4 w-4" />
          <span className="font-semibold text-sm">
            Ticket #{content.sequentialId}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Status</p>
            <p className="font-medium">{content.status || '—'}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Equipe</p>
            <p className="font-medium">{content.team || '—'}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Provider</p>
            <p className="font-medium">{content.provider || '—'}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Prioridade</p>
            <p className="font-medium">{content.priority || '—'}</p>
          </div>
        </div>

        {content.customerInput?.value && (
          <div className="pt-3 mt-3 border-t border-border">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1.5">
              Resposta do cliente
            </p>
            <div className="bg-background/50 rounded-lg p-3 text-sm italic border shadow-sm">
              "{content.customerInput.value}"
            </div>
          </div>
        )}
      </div>
    )
  }

  // =====================================================
  // INTERACTIVE WHATSAPP (Lists & Buttons)
  // =====================================================

  const renderInteractiveMessage = (content: any) => {

    const interactive = content?.interactive

    if (!interactive) return null

    // =====================================================
    // BOTÕES
    // =====================================================
    if (interactive.type === 'button') {
      return (
        <div className="space-y-3">
          {interactive.body?.text && (
            <div className="text-sm whitespace-pre-wrap leading-relaxed">
              {interactive.body.text}
            </div>
          )}

          {interactive.footer?.text && (
            <div className="text-xs text-muted-foreground">
              {interactive.footer.text}
            </div>
          )}

          {interactive.action?.buttons?.length > 0 && (
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              {interactive.action.buttons.map((btn: any, idx: number) => (
                <div
                  key={idx}
                  className="px-4 py-2 text-center rounded-xl border border-sky-500/30 bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 text-sm font-semibold"
                >
                  {btn.reply?.title}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    // =====================================================
    // LISTA (Menus)
    // =====================================================
    if (interactive.type === 'list') {
      return (
        <div className="space-y-4">
          {interactive.body?.text && (
            <div className="text-sm whitespace-pre-wrap leading-relaxed">
              {interactive.body.text}
            </div>
          )}

          {interactive.footer?.text && (
            <div className="text-xs text-muted-foreground">
              {interactive.footer.text}
            </div>
          )}

          {interactive.action?.button && (
            <div className="inline-flex w-full items-center justify-center rounded-xl border border-indigo-500/40 px-4 py-2.5 text-sm bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold mb-2">
              {interactive.action.button}
            </div>
          )}

          <div className="space-y-3 pt-2">
            {interactive.action?.sections?.map(
              (section: any, sectionIdx: number) => (
                <div key={sectionIdx} className="space-y-2">
                  {section.title && (
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-bold px-1">
                      {section.title}
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    {section.rows?.map((row: any, rowIdx: number) => (
                      <div
                        key={rowIdx}
                        className="rounded-lg border border-border bg-background/50 shadow-sm px-4 py-3"
                      >
                        <div className="font-semibold text-sm text-foreground">
                          {row.title}
                        </div>
                        {row.description && (
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {row.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )
    }

    return null
  }

  // =====================================================
  // TEMPLATE WHATSAPP
  // =====================================================

  const renderTemplateMessage = (content: any) => {

    const bodyComponent =
      content?.templateContent?.components?.find(
        (c: any) => c.type === 'BODY'
      )

    const buttonsComponent =
      content?.templateContent?.components?.find(
        (c: any) => c.type === 'BUTTONS'
      )

    let text = bodyComponent?.text || ''

    const params =
      content?.template?.components?.[0]?.parameters || []

    params.forEach((param: any, idx: number) => {
      text = text.replace(`{{${idx + 1}}}`, param.text)
    })

    return (
      <div className="space-y-3">
        <div className="inline-flex items-center rounded-full border border-orange-500/30 px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30">
          Template WhatsApp
        </div>

        <div className="text-sm whitespace-pre-wrap leading-relaxed">
          {text}
        </div>

        {buttonsComponent?.buttons?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            {buttonsComponent.buttons.map((button: any, idx: number) => (
              <div
                key={idx}
                className="px-3 py-1.5 rounded-xl border border-border bg-primary/5 text-sm font-medium"
              >
                {button.text}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // =====================================================
  // REPLY WHATSAPP
  // =====================================================

  const renderReplyMessage = (content: any) => {

    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
          <p className="text-[11px] uppercase tracking-wider font-bold text-primary/70 mb-1.5">
            Resposta Original
          </p>
          {renderMessageContent({
            type: content?.inReplyTo?.type,
            content: content?.inReplyTo?.value
          })}
        </div>
        
        <div className="pl-2 border-l-2 border-primary/40">
          <div className="text-sm whitespace-pre-wrap">
            {content?.replied?.value}
          </div>
        </div>
      </div>
    )
  }

  // =====================================================
  // RENDER MESSAGE CENTRAL
  // =====================================================

  const renderMessageContent = (msg: any) => {
    
    // 1. Muitas vezes APIs enviam JSON stringificado em vez de objetos nativos
    // Tenta fazer o Parse com segurança para rotear corretamente
    let parsedContent = msg.content
    
    if (typeof parsedContent === 'string' && (msg.type === 'application/json' || parsedContent.trim().startsWith('{'))) {
      try {
        parsedContent = JSON.parse(parsedContent)
      } catch (e) {
        // Falha silenciosa, processa como string pura abaixo
      }
    }

    // TEXTO
    if (msg.type === 'text/plain' && typeof parsedContent === 'string') {
      return (
        <p className="text-sm whitespace-pre-wrap break-words">
          {parsedContent}
        </p>
      )
    }

    // TICKET
    if (msg.type === 'application/vnd.iris.ticket+json' || parsedContent?.sequentialId) {
      return renderTicket(parsedContent)
    }

    // REPLY
    if (msg.type === 'application/vnd.lime.reply+json' || parsedContent?.replied) {
      return renderReplyMessage(parsedContent)
    }

    // INTERACTIVE (Cloud API)
    // Aqui foi removida a trava restrita 'button' que impedia a visualização de listas
    if (parsedContent?.interactive || parsedContent?.type === 'interactive') {
      return renderInteractiveMessage(parsedContent)
    }

    // TEMPLATE
    if (parsedContent?.template || parsedContent?.templateContent) {
      return renderTemplateMessage(parsedContent)
    }

    // MÍDIA LINK (Imagens, Vídeos, Stickers Blip)
    if (msg.type === 'application/vnd.lime.media-link+json' || parsedContent?.uri) {
      return renderMediaLink(parsedContent)
    }

    // MÍDIA LEGADA OU QUICK REPLIES BLIP (Lime Select)
    if (msg.type === 'application/vnd.lime.select+json' || parsedContent?.options) {
      return renderLimeSelect(parsedContent)
    }

    // RICH CARD
    if (parsedContent?.richCard || parsedContent?.richCard?.standaloneCard) {
      return renderRichCard(parsedContent)
    }

    // FALLBACK SEGURO
    return (
      <div className="space-y-2">
        <span className="text-[10px] text-rose-500 uppercase font-semibold">Tipo não renderizado nativamente</span>
        <pre className="text-xs overflow-auto max-w-full rounded-xl bg-black/5 dark:bg-white/5 border p-4 text-foreground/80">
          {typeof parsedContent === 'object' ? JSON.stringify(parsedContent, null, 2) : String(parsedContent)}
        </pre>
      </div>
    )
  }

  // =====================================================
  // LOADING & ERROR
  // =====================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-muted/30">
        <Loader2 className="animate-spin h-10 w-10 text-primary/50" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div className="p-8 text-center bg-background rounded-2xl shadow-sm border">
          Não foi possível carregar os dados deste contato.
        </div>
      </div>
    )
  }

  const { contact_info } = data
  const { extras, ...mainInfo } = contact_info

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="h-screen overflow-hidden p-6 bg-muted/30">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">

        {/* ESQUERDA */}
        <div className="md:col-span-1 flex flex-col gap-6 h-full min-h-0">

          {/* Dados principais */}
          <Card className="flex flex-col min-h-0 flex-1 shadow-sm border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Dados Principais</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto space-y-3 min-h-0">
              {Object.entries(mainInfo).map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-xl border border-border bg-background p-3 shadow-sm"
                >
                  <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wider font-medium">
                    {formatLabel(key)}
                  </p>
                  <p className="font-medium break-all text-sm">
                    {renderValue(value)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Extras */}
          <Card className="flex flex-col min-h-0 flex-1 shadow-sm border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Extras</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto space-y-3 min-h-0">
              {extras && Object.entries(extras).length > 0 ? (
                Object.entries(extras).map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-xl border border-border bg-background p-3 shadow-sm"
                  >
                    <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wider font-medium">
                      {formatLabel(key)}
                    </p>
                    <p className="font-medium break-all text-sm">
                      {renderValue(value)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-6">
                  Nenhum extra encontrado.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* HISTÓRICO */}
        <Card className="md:col-span-2 flex flex-col h-full min-h-0 shadow-sm border-border">

          <CardHeader className="border-b border-border bg-background/95 backdrop-blur z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Histórico de Mensagens
              </CardTitle>
              <div className="px-3 py-1 bg-primary/10 text-primary font-semibold rounded-full text-xs">
                {data.threads?.length || 0} mensagens
              </div>
            </div>
          </CardHeader>

          {/* AQUI ESTAVA O PROBLEMA: Alterado bg-slate-50 e bg-slate-900/20 para bg-muted/30 */}
          <CardContent className="flex-1 overflow-y-auto min-h-0 p-6 bg-muted/30">

            <div className="flex flex-col gap-5">

              {data.threads.map((msg: any, i: number) => (

                <div
                  key={msg.id || i}
                  className={`w-full flex ${msg.direction === 'received'
                      ? 'justify-end'
                      : 'justify-start'
                    }`}
                >

                  <div
                    className={`rounded-2xl p-4 max-w-[85%] border shadow-sm ${msg.direction === 'received'
                        ? 'bg-indigo-50/70 border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20' // Suavizado no dark mode
                        : 'bg-card border-border' // Usando card no lugar de background para destacar sutilmente do fundo
                      }`}
                  >

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3 border-b pb-2 border-border/50">

                      <div className={`p-1.5 rounded-full ${msg.direction === 'received' ? 'bg-indigo-200/50 dark:bg-indigo-800/50' : 'bg-primary/10'}`}>
                        {msg.direction === 'received' ? (
                          <User className="h-3.5 w-3.5 text-indigo-700 dark:text-indigo-300" />
                        ) : (
                          <Bot className="h-3.5 w-3.5 text-primary" />
                        )}
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[11px] uppercase tracking-wide text-foreground/80 font-bold">
                          {msg.direction === 'received'
                            ? 'Cliente'
                            : 'Bot'}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                          {msg.type}
                        </span>
                      </div>

                      <div className="ml-auto text-[10px] text-muted-foreground/80 font-medium whitespace-nowrap bg-background/50 px-2 py-0.5 rounded-md">
                        {new Date(msg.date).toLocaleString('pt-BR')}
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="space-y-3">
                      {renderMessageContent(msg)}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// =====================================================
// PAGE EXPORT
// =====================================================

export default function ContactDetailsPage() {

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen w-full bg-muted/30">
          <Loader2 className="animate-spin h-10 w-10 text-primary/50" />
        </div>
      }
    >
      <ContactDetailsContent />
    </Suspense>
  )
}