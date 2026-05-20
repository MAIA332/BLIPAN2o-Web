'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Info } from 'lucide-react'
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface BlockEvent {
  rank: number
  blockName: string
  totalEvents: number
}

interface BlocksCardProps {
  title: string
  description: string
  linkText: string
  blocks: BlockEvent[]
}

export function BlocksCard({ title, description, linkText, blocks }: BlocksCardProps) {
  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold text-foreground">
            {title}
          </CardTitle>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{title}</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {description}{' '}
          <a href="#" className="text-primary hover:underline">
            {linkText}
          </a>
        </p>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Nome do bloco</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Total de eventos</th>
              </tr>
            </thead>
            <tbody>
              {blocks.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-8 text-center text-muted-foreground text-sm">
                    Nenhum evento encontrado
                  </td>
                </tr>
              ) : (
                blocks.map((block) => (
                  <tr key={block.rank} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-chart-1/20 text-chart-1 text-xs font-medium">
                          {block.rank}º
                        </span>
                        <span className="text-sm text-foreground">{block.blockName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className="text-sm text-foreground">{block.totalEvents}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
