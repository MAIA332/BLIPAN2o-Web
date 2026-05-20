'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Info, Download, ExternalLink } from 'lucide-react'
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
}

interface RecurrenceData {
  recurrenceRate: number
  uniqueRecurrentContacts: number
  topRecurrentContacts: RecurrentContact[]
}

interface RecurrenceCardProps {
  data: RecurrenceData
}

export function RecurrenceCard({ data }: RecurrenceCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left side - rates */}
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
            <p className="text-sm text-muted-foreground mb-4">
              Total de contatos únicos que interagiram com seu chatbot 2 ou mais vezes em intervalos de 24h
            </p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-foreground">{data.uniqueRecurrentContacts}</span>
              <span className="text-sm text-muted-foreground">-</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right side - table */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold text-foreground">
              Contatos com mais recorrência
            </CardTitle>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Contatos que mais interagiram</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Download className="h-4 w-4 text-muted-foreground" />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Saiba quem são os contatos que mais vezes interagiram com seu chatbot no período selecionado
          </p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Nome</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Recorrência</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Telefone</th>
                  <th className="py-3 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {data.topRecurrentContacts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground text-sm">
                      Nenhum contato recorrente encontrado
                    </td>
                  </tr>
                ) : (
                  data.topRecurrentContacts.map((contact) => (
                    <tr key={contact.rank} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center h-7 w-7 rounded-full bg-chart-1/20 text-chart-1 text-xs font-medium">
                            {contact.rank}º
                          </span>
                          <span className="text-sm text-foreground truncate max-w-[150px]">{contact.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="text-sm text-foreground">{contact.recurrence}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm text-foreground font-mono">{contact.phone}</span>
                      </td>
                      <td className="py-3 px-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
