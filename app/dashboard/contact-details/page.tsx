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
  User
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
          <div className="overflow-hidden rounded-xl border">
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
                className="px-3 py-2 rounded-xl border bg-primary/10 text-sm"
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

        <div className="flex items-center gap-2">
          <Ticket className="h-4 w-4" />

          <span className="font-medium">
            Ticket #{content.sequentialId}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">

          <div>
            <p className="text-muted-foreground">Status</p>
            <p>{content.status || '—'}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Equipe</p>
            <p>{content.team || '—'}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Provider</p>
            <p>{content.provider || '—'}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Prioridade</p>
            <p>{content.priority || '—'}</p>
          </div>
        </div>

        {content.customerInput?.value && (
          <div className="pt-2 border-t">

            <p className="text-xs text-muted-foreground mb-1">
              Resposta do cliente
            </p>

            <div className="bg-background rounded-lg p-2 text-sm">
              {content.customerInput.value}
            </div>
          </div>
        )}
      </div>
    )
  }

  // =====================================================
  // INTERACTIVE WHATSAPP
  // =====================================================

  const renderInteractiveMessage = (content: any) => {

    const interactive = content?.interactive

    if (!interactive) return null

    // =====================================================
    // BOTÕES
    // =====================================================

    if (interactive.type === 'button') {

      return (
        <div className="space-y-4">

          {/* Texto */}
          {interactive.body?.text && (
            <div className="text-sm whitespace-pre-wrap leading-relaxed">
              {interactive.body.text}
            </div>
          )}

          {/* Footer */}
          {interactive.footer?.text && (
            <div className="text-xs text-muted-foreground border-t pt-2">
              {interactive.footer.text}
            </div>
          )}

          {/* Botões */}
          {interactive.action?.buttons?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">

              {interactive.action.buttons.map((btn: any, idx: number) => (
                <div
                  key={idx}
                  className="px-3 py-2 rounded-xl border bg-primary/10 text-sm"
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
    // LISTA
    // =====================================================

    if (interactive.type === 'list') {

      return (
        <div className="space-y-4">

          {/* Texto */}
          {interactive.body?.text && (
            <div className="text-sm whitespace-pre-wrap leading-relaxed">
              {interactive.body.text}
            </div>
          )}

          {/* Botão principal */}
          {interactive.action?.button && (
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs bg-primary/10">
              {interactive.action.button}
            </div>
          )}

          {/* Opções */}
          <div className="space-y-2 pt-2">

            {interactive.action?.sections?.map(
              (section: any, sectionIdx: number) => (

                <div
                  key={sectionIdx}
                  className="space-y-2"
                >

                  {/* Título da seção */}
                  {section.title && (
                    <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                      {section.title}
                    </div>
                  )}

                  {/* Rows */}
                  {section.rows?.map((row: any, rowIdx: number) => (
                    <div
                      key={rowIdx}
                      className="rounded-xl border bg-primary/5 px-4 py-3"
                    >

                      <div className="font-medium text-sm">
                        {row.title}
                      </div>

                      {row.description && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {row.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Footer */}
          {interactive.footer?.text && (
            <div className="text-xs text-muted-foreground border-t pt-2">
              {interactive.footer.text}
            </div>
          )}
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
      <div className="space-y-4">

        {/* Badge */}
        <div className="inline-flex items-center rounded-full border px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
          Template WhatsApp
        </div>

        {/* Texto */}
        <div className="text-sm whitespace-pre-wrap leading-relaxed">
          {text}
        </div>

        {/* Botões */}
        {buttonsComponent?.buttons?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">

            {buttonsComponent.buttons.map((button: any, idx: number) => (
              <div
                key={idx}
                className="px-3 py-2 rounded-xl border bg-primary/10 text-sm"
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
      <div className="space-y-4">

        {/* Resposta */}
        <div>

          <p className="text-xs text-muted-foreground mb-1">
            Resposta selecionada
          </p>

          <div className="rounded-xl border bg-background p-3 text-sm">
            {content?.replied?.value}
          </div>
        </div>

        {/* Mensagem original */}
        {content?.inReplyTo?.value && (
          <div className="rounded-xl border bg-muted/40 p-3">

            <p className="text-xs text-muted-foreground mb-2">
              Mensagem original
            </p>

            {renderMessageContent({
              type: content.inReplyTo.type,
              content: content.inReplyTo.value
            })}
          </div>
        )}
      </div>
    )
  }

  // =====================================================
  // RENDER MESSAGE
  // =====================================================

  const renderMessageContent = (msg: any) => {

    // TEXTO
    if (msg.type === 'text/plain') {
      return (
        <p className="text-sm whitespace-pre-wrap break-words">
          {msg.content}
        </p>
      )
    }

    // TICKET
    if (msg.type === 'application/vnd.iris.ticket+json') {
      return renderTicket(msg.content)
    }

    // REPLY
    if (msg.type === 'application/vnd.lime.reply+json') {
      return renderReplyMessage(msg.content)
    }

    // INTERACTIVE
    if (
      msg.content?.interactive?.type === 'button'
    ) {
      return renderInteractiveMessage(msg.content)
    }

    // TEMPLATE
    if (
      msg.content?.template ||
      msg.content?.templateContent
    ) {
      return renderTemplateMessage(msg.content)
    }

    // RICH CARD
    if (
      msg.content?.richCard ||
      msg.content?.richCard?.standaloneCard
    ) {
      return renderRichCard(msg.content)
    }

    // IMAGEM
    if (
      typeof msg.content === 'object' &&
      msg.content?.media?.contentInfo?.fileUrl
    ) {
      return (
        <img
          src={msg.content.media.contentInfo.fileUrl}
          alt="Media"
          className="rounded-xl border max-h-[320px]"
        />
      )
    }

    // FALLBACK
    return (
      <pre className="text-xs overflow-auto rounded-xl bg-black/5 border p-4">
        {JSON.stringify(msg.content, null, 2)}
      </pre>
    )
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    )
  }

  // =====================================================
  // ERRO
  // =====================================================

  if (!data) {
    return (
      <div className="p-10 text-center">
        Não foi possível carregar os dados deste contato.
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
          <Card className="flex flex-col min-h-0 flex-1 shadow-sm">

            <CardHeader className="pb-4">
              <CardTitle>Dados Principais</CardTitle>
            </CardHeader>

            <CardContent className="overflow-y-auto space-y-4 min-h-0">

              {Object.entries(mainInfo).map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-xl border bg-background p-3"
                >
                  <p className="text-xs text-muted-foreground mb-1">
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
          <Card className="flex flex-col min-h-0 flex-1 shadow-sm">

            <CardHeader className="pb-4">
              <CardTitle>Extras</CardTitle>
            </CardHeader>

            <CardContent className="overflow-y-auto space-y-4 min-h-0">

              {extras && Object.entries(extras).length > 0 ? (

                Object.entries(extras).map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-xl border bg-background p-3"
                  >
                    <p className="text-xs text-muted-foreground mb-1">
                      {formatLabel(key)}
                    </p>

                    <p className="font-medium break-all text-sm">
                      {renderValue(value)}
                    </p>
                  </div>
                ))

              ) : (

                <div className="text-sm text-muted-foreground">
                  Nenhum extra encontrado
                </div>

              )}
            </CardContent>
          </Card>
        </div>

        {/* HISTÓRICO */}
        <Card className="md:col-span-2 flex flex-col h-full min-h-0 shadow-sm">

          <CardHeader className="border-b">

            <div className="flex items-center justify-between">

              <CardTitle>
                Histórico de Mensagens
              </CardTitle>

              <div className="text-xs text-muted-foreground">
                {data.threads?.length || 0} mensagens
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto min-h-0 p-6">

            <div className="flex flex-col gap-4">

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
                        ? 'bg-secondary'
                        : 'bg-background'
                      }`}
                  >

                    {/* Header */}
                    <div className="flex items-center gap-2 mb-3">

                      <div className="p-1.5 rounded-full bg-primary/10">

                        {msg.direction === 'received' ? (
                          <User className="h-3.5 w-3.5" />
                        ) : (
                          <Bot className="h-3.5 w-3.5" />
                        )}
                      </div>

                      <div className="flex flex-col">

                        <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
                          {msg.direction === 'received'
                            ? 'Cliente'
                            : 'Bot'}
                        </span>

                        <span className="text-[10px] text-muted-foreground">
                          {msg.type}
                        </span>
                      </div>

                      <div className="ml-auto text-[10px] opacity-50 whitespace-nowrap">
                        {new Date(msg.date).toLocaleString()}
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
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      }
    >
      <ContactDetailsContent />
    </Suspense>
  )
}