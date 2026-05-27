'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Info, Download, ExternalLink, Loader2 } from 'lucide-react'
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface RecurrentContact {
  rank: number
  name: string
  recurrence: number
  phone: string
  identity?: string
}

interface RecurrenceData {
  recurrenceRate: number
  uniqueRecurrentContacts: number
  topRecurrentContacts: RecurrentContact[]
}

interface RecurrenceCardProps {
  data: RecurrenceData
  branchId: string
}

export function RecurrenceCard({ data, branchId }: RecurrenceCardProps) {
  // Filtra contatos com recorrência > 0
  const validContacts = data.topRecurrentContacts.filter(c => c.recurrence > 0)

  const [contacts, setContacts] = useState<RecurrentContact[]>(validContacts)
  const [loadingContacts, setLoadingContacts] = useState<Set<string>>(new Set())

  // Ref para rastrear identidades que já foram consultadas
  const fetchedIdentities = useRef<Set<string>>(new Set())

  useEffect(() => {
    setContacts(validContacts)

    const fetchMissingNames = async () => {
      const token = localStorage.getItem('access_token') || ''

      const updatedContacts = await Promise.all(
        validContacts.map(async (contact) => {

          if (
            contact.name !== 'Desconhecido' ||
            !contact.identity ||
            fetchedIdentities.current.has(contact.identity)
          ) {
            return contact
          }

          fetchedIdentities.current.add(contact.identity)

          // adiciona loading individual
          setLoadingContacts(prev => {
            const next = new Set(prev)
            next.add(contact.identity!)
            return next
          })

          try {
            const res = await fetch('/api/blip/an/contact-view', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                branch_id: branchId,
                contact_identity: contact.identity
              })
            })

            const result = await res.json()

            if (result.success && result.data?.contact_info) {
              const info = result.data.contact_info

              let foundName = info.name

              if (!foundName && info.extras) {
                const keys = Object.keys(info.extras)

                const targetKeys = [
                  'nome',
                  'name',
                  'contactname',
                  'contact_name'
                ]

                const matchedKey = keys.find(k =>
                  targetKeys.includes(k.toLowerCase())
                )

                if (matchedKey) {
                  foundName = info.extras[matchedKey]
                }
              }

              if (foundName) {
                return {
                  ...contact,
                  name: foundName
                }
              }
            }
          } catch (error) {
            console.error(
              `Erro ao buscar nome para ${contact.identity}:`,
              error
            )
          } finally {

            // remove loading individual
            setLoadingContacts(prev => {
              const next = new Set(prev)
              next.delete(contact.identity!)
              return next
            })
          }

          return contact
        })
      )

      setContacts(updatedContacts)
    }

    if (validContacts.some(c => c.name === 'Desconhecido')) {
      fetchMissingNames()
    }

  }, [data, branchId])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Taxa de recorrência</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Taxa de contatos únicos que interagiram com seu chatbot 2 ou mais vezes em intervalos de 24h
            </p>
            <span className="text-3xl font-bold text-foreground">{data.recurrenceRate}%</span>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Contatos únicos recorrentes</h3>
            <span className="text-3xl font-bold text-foreground">{data.uniqueRecurrentContacts}</span>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold text-foreground">Contatos com mais recorrência</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto overflow-y-auto max-h-[300px] border rounded-md">
            <table className="w-full relative">
              <thead className="sticky top-0 bg-secondary z-10">
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Nome</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Recorrência</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Telefone</th>
                  <th className="py-3 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact, index) => (
                  <tr key={contact.identity || index} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="py-3 px-2">
                      <span className="text-sm text-foreground">
                        {contact.identity && loadingContacts.has(contact.identity) ? (
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Buscando...
                          </span>
                        ) : (
                          contact.name
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">{contact.recurrence}</td>
                    <td className="py-3 px-2 font-mono text-sm">{contact.phone}</td>
                    <td className="py-3 px-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          const url = `/dashboard/contact-details?identity=${encodeURIComponent(contact.identity || '')}&branchId=${branchId}`;
                          window.open(url, '_blank');
                        }}
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}