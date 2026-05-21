'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Info, ArrowRight, TrendingDown } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useMemo } from 'react'

interface JourneyEdge {
  origem: string
  destino: string
  id_origem: string
  id_destino: string
  contagem: number
  passo: number
  type?: string
}

interface JourneyStepsCardProps {
  data: JourneyEdge[]
}

export function JourneyStepsCard({ data }: JourneyStepsCardProps) {

  /*
   |-------------------------------------------------------------------------- 
   | NORMALIZA NOMES
   |-------------------------------------------------------------------------- 
   */
  const clean = (text: string) =>
    text.replace(/\[\d+\]/g, '').trim()

  /*
   |-------------------------------------------------------------------------- 
   | AGREGAÇÃO DE SAÍDAS (DROP-OFF)
   |-------------------------------------------------------------------------- 
   */
  const {
    sortedSteps,
    topBlocks,
    dropRanking
  } = useMemo(() => {

    const exitMap: Record<string, number> = {}

    data.forEach((item) => {
      const isExit =
        item.type === 'exit' ||
        item.destino.toLowerCase().includes('#exit')

      if (isExit) {
        const origem = clean(item.origem)
        exitMap[origem] =
          (exitMap[origem] || 0) + item.contagem
      }
    })

    /*
     |--------------------------------------------------
     | TOP BLOCOS MAIS USADOS (AZUL)
     |--------------------------------------------------
     */
    const blockUsage: Record<string, number> = {}

    data.forEach((item) => {
      const origem = clean(item.origem)
      blockUsage[origem] =
        (blockUsage[origem] || 0) + item.contagem
    })

    const topBlocks = Object.entries(blockUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name)

    /*
     |--------------------------------------------------
     | RANKING DE ABANDONO
     |--------------------------------------------------
     */
    const dropRanking = Object.entries(exitMap)
      .filter(([blockName]) => blockName !== '#exit' && blockName !== '#others') // 👈 AQUI
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([blockName, total], index) => ({
        rank: index + 1,
        blockName,
        totalEvents: total
      }))

    /*
     |--------------------------------------------------
     | ORDENAÇÃO + FILTRO (#exit como origem)
     |--------------------------------------------------
     */
    const sortedSteps = [...data]
      .map((item) => ({
        ...item,
        origem: clean(item.origem),
        destino: clean(item.destino),
        isExit:
          item.type === 'exit' ||
          item.destino.toLowerCase().includes('#exit'),
        dropCount: exitMap[clean(item.origem)] || 0
      }))
      .filter((item) => item.origem !== '#exit')
      .filter((item) => item.origem !== '#others')
      .sort((a, b) => a.passo - b.passo || b.contagem - a.contagem)

    return { sortedSteps, topBlocks, dropRanking }

  }, [data])

  /*
   |-------------------------------------------------------------------------- 
   | ESTILOS
   |-------------------------------------------------------------------------- 
   */
  const getStyle = (name: string, isExit: boolean) => {
    if (isExit)
      return "bg-orange-500 text-white font-bold border-orange-500"

    if (topBlocks.includes(name))
      return "bg-blue-100 text-blue-800 border-blue-200"

    return "bg-slate-200 text-slate-700 border-slate-300"
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold text-foreground">
            Jornada Detalhada
          </CardTitle>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Azul: principais blocos | Cinza: outros | Laranja: abandono
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent>

        {/* 🔹 TABELA PRINCIPAL */}
        <div className="h-[420px] overflow-y-auto border rounded-md">
          <table className="w-full">
            <thead className="sticky top-0 bg-secondary z-10">
              <tr>
                <th className="text-left py-3 px-3 text-xs font-bold text-muted-foreground">Passo</th>
                <th className="text-left py-3 px-3 text-xs font-bold text-muted-foreground">Fluxo</th>
                <th className="text-right py-3 px-3 text-xs font-bold text-muted-foreground">Volume</th>
                <th className="text-right py-3 px-3 text-xs font-bold text-muted-foreground">Abandono</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {sortedSteps.map((step, idx) => (
                <tr key={idx} className="hover:bg-secondary/50">

                  <td className="py-3 px-3 text-sm">
                    {step.passo}
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2 flex-wrap">

                      <span className={`text-xs px-2 py-1 rounded border ${getStyle(step.origem, false)}`}>
                        {step.origem}
                      </span>

                      <ArrowRight className="h-4 w-4 text-muted-foreground" />

                      <span className={`text-xs px-2 py-1 rounded border ${getStyle(step.destino, step.isExit)}`}>
                        {step.isExit ? 'SAÍDA' : step.destino}
                      </span>

                    </div>
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-semibold">
                    {step.contagem}
                  </td>

                  <td className="py-3 px-3 text-right">
                    {step.dropCount > 0 && (
                      <div className="flex items-center justify-end gap-1 text-orange-600 font-semibold">
                        <TrendingDown className="h-4 w-4" />
                        {step.dropCount}
                      </div>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 🔥 RANKING DE ABANDONO */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Blocos com mais abandono
          </h3>

          <div className="overflow-x-auto border rounded-md">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-xs font-bold text-muted-foreground">
                    Nome do bloco
                  </th>
                  <th className="text-right py-3 px-2 text-xs font-bold text-muted-foreground">
                    Total de abandonos
                  </th>
                </tr>
              </thead>

              <tbody>
                {dropRanking.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-6 text-center text-muted-foreground text-sm">
                      Nenhum abandono encontrado
                    </td>
                  </tr>
                ) : (
                  dropRanking.map((block) => (
                    <tr
                      key={block.rank}
                      className="border-b border-border/50 hover:bg-secondary/30"
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-orange-500/20 text-orange-600 text-xs font-medium">
                            {block.rank}º
                          </span>
                          <span className="text-sm text-foreground">
                            {block.blockName}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-2 text-right text-sm font-semibold text-orange-600">
                        {block.totalEvents}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}