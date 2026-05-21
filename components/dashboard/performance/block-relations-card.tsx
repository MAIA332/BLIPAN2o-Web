'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Info } from 'lucide-react'
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface BlockRelation {
  source: string
  target: string
  value: number
}

interface BlockRelationsCardProps {
  relations: BlockRelation[]
  blocks: string[]
}

export function BlockRelationsCard({ relations, blocks }: BlockRelationsCardProps) {
  // Helpers para classificação visual
  const getBlockStyle = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('#exit')) return { color: 'bg-orange-100 border-orange-500 text-orange-900', label: 'Saída' };
    if (lowerName.includes('outros') || lowerName.includes('default')) return { color: 'bg-slate-200 border-slate-500 text-slate-700', label: 'Outros' };
    return { color: 'bg-blue-100 border-blue-500 text-blue-900', label: 'Fluxo Principal' };
  };

  const flowData = useMemo(() => {
    return relations.reduce((acc, rel) => {
      if (!acc[rel.source]) acc[rel.source] = [];
      acc[rel.source].push(rel);
      return acc;
    }, {} as Record<string, BlockRelation[]>);
  }, [relations]);

  const maxValue = Math.max(...relations.map((r) => r.value), 1);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold text-foreground">Fluxo de Navegação</CardTitle>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                <TooltipContent className="max-w-sm p-4">
                  <p className="font-semibold mb-2">Entendendo o Fluxo:</p>
                  <ul className="space-y-1 text-xs">
                    <li><span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1"></span> <b>Azul:</b> Blocos principais do fluxo (Builder).</li>
                    <li><span className="inline-block w-2 h-2 rounded-full bg-slate-500 mr-1"></span> <b>Cinza:</b> Blocos de suporte ou baixo volume ("Outros").</li>
                    <li><span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-1"></span> <b>Laranja:</b> Pontos de Saída (onde o usuário encerrou a conversa).</li>
                  </ul>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Este gráfico mostra como os clientes se movem entre os blocos. A espessura das linhas representa a quantidade de pessoas que seguiram aquele caminho.
        </p>

        {/* Legend */}
        <div className="flex gap-4 mb-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-100 border border-blue-500"/> Fluxo Principal</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-slate-200 border border-slate-500"/> Outros</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-orange-100 border border-orange-500"/> Saída</span>
        </div>

        {/* Flow diagram com Scroll Y e X */}
        <div className="bg-secondary/20 rounded-lg p-6 overflow-auto max-h-[400px]">
          <div className="flex flex-col gap-6 min-w-[600px]">
            {Object.entries(flowData).map(([source, targets]) => {
              const sourceStyle = getBlockStyle(source);
              return (
                <div key={source} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-40">
                    <div className={`border rounded-lg p-3 text-center shadow-sm text-xs font-medium truncate ${sourceStyle.color}`}>
                      {source.replace(/\[\d+\]/g, '')}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-3">
                    {targets.map((rel, idx) => {
                      const targetStyle = getBlockStyle(rel.target);
                      const width = Math.max(2, (rel.value / maxValue) * 6);
                      const opacity = 0.4 + (rel.value / maxValue) * 0.6;
                      
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="flex-1 flex items-center">
                            <div className="h-px flex-1" style={{ height: `${width}px`, backgroundColor: `rgba(156, 163, 175, ${opacity})` }} />
                            <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-t-transparent border-b-transparent border-l-slate-400" />
                          </div>
                          
                          <div className="flex-shrink-0 w-40">
                            <div className={`border rounded-lg p-2 text-center shadow-sm text-xs truncate ${targetStyle.color}`}>
                              <span className="block font-medium truncate">{rel.target.replace(/\[\d+\]/g, '')}</span>
                              <span className="text-[10px] opacity-80">{rel.value} pessoas</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <span className="text-xl font-bold">{blocks.length}</span>
            <p className="text-xs text-muted-foreground">Blocos</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <span className="text-xl font-bold">{relations.length}</span>
            <p className="text-xs text-muted-foreground">Conexões</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <span className="text-xl font-bold">{relations.reduce((acc, r) => acc + r.value, 0)}</span>
            <p className="text-xs text-muted-foreground">Total Transições</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}