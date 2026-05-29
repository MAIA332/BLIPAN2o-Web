'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Info, ArrowRight, TrendingDown, Sparkles, Loader2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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

/*
 |-------------------------------------------------------------------------- 
 | PARSER DE MARKDOWN CUSTOMIZADO
 |-------------------------------------------------------------------------- 
 | Transforma tags básicas (###, **, -, 1.) em HTML estilizado com Tailwind
 */
const renderMarkdown = (text: string) => {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let currentList: any[] = [];
  let listType = ''; 

  const flushList = () => {
    if (currentList.length > 0) {
      if (listType === 'ol') {
        elements.push(<ol key={`ol-${elements.length}`} className="list-decimal pl-5 mb-4 space-y-2">{currentList}</ol>);
      } else {
        elements.push(<ul key={`ul-${elements.length}`} className="list-disc pl-5 mb-4 space-y-2">{currentList}</ul>);
      }
      currentList = [];
      listType = '';
    }
  };

  const processInline = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-indigo-900 dark:text-indigo-200">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={i} className="text-base font-bold text-indigo-900 dark:text-indigo-300 mt-6 mb-3">
          {processInline(line.replace('### ', ''))}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={i} className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mt-6 mb-3">
          {processInline(line.replace('## ', ''))}
        </h2>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      currentList.push(
        <li key={i} className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {processInline(line.substring(2))}
        </li>
      );
    } else if (line.match(/^\d+\.\s/)) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      currentList.push(
        <li key={i} className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {processInline(line.replace(/^\d+\.\s/, ''))}
        </li>
      );
    } else if (line === '') {
      flushList();
    } else {
      flushList();
      elements.push(
        <p key={i} className="mb-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {processInline(line)}
        </p>
      );
    }
  }
  flushList();

  return elements;
};

export function JourneyStepsCard({ data }: JourneyStepsCardProps) {
  
  // Estados da IA e da Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false)
  const [insight, setInsight] = useState<string | null>(null)

  /*
   |-------------------------------------------------------------------------- 
   | NORMALIZA NOMES
   |-------------------------------------------------------------------------- 
   */
  const clean = (text: string) => text.replace(/\[\d+\]/g, '').trim()

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
        exitMap[origem] = (exitMap[origem] || 0) + item.contagem
      }
    })

    const blockUsage: Record<string, number> = {}

    data.forEach((item) => {
      const origem = clean(item.origem)
      blockUsage[origem] = (blockUsage[origem] || 0) + item.contagem
    })

    const topBlocks = Object.entries(blockUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name)

    const dropRanking = Object.entries(exitMap)
      .filter(([blockName]) => blockName !== '#exit' && blockName !== '#others')
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([blockName, total], index) => ({
        rank: index + 1,
        blockName,
        totalEvents: total
      }))

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
   | GERADOR DE INSIGHTS
   |-------------------------------------------------------------------------- 
   */
  const handleGenerateInsight = async () => {
    if (sortedSteps.length === 0) return;
    
    setIsModalOpen(true); // Abre a modal imediatamente
    
    // Se já gerou, não gera de novo ao reabrir a modal
    if (insight) return;

    setIsGeneratingInsight(true);

    try {
      const response = await fetch('/api/insight-journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sortedSteps: sortedSteps.map(s => ({ step: s.passo, from: s.origem, to: s.destino, vol: s.contagem, drop: s.dropCount })), 
          dropRanking 
        })
      });

      if (!response.ok) throw new Error('Erro ao buscar insight');
      
      const responseData = await response.json();
      setInsight(responseData.insight);
    } catch (error) {
      console.error(error);
      setInsight("Desculpe, ocorreu um erro ao gerar a análise da jornada. Tente novamente.");
    } finally {
      setIsGeneratingInsight(false);
    }
  };


  /*
   |-------------------------------------------------------------------------- 
   | ESTILOS
   |-------------------------------------------------------------------------- 
   */
  const getStyle = (name: string, isExit: boolean) => {
    if (isExit)
      return "bg-orange-500 text-white font-bold border-orange-500"

    if (topBlocks.includes(name))
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"

    return "bg-slate-200 text-slate-700 border-slate-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
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
                    <p>Azul: principais blocos | Cinza: outros | Laranja: abandono</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Botão da Inteligência Artificial */}
            {sortedSteps.length > 0 && (
              <Button 
                onClick={handleGenerateInsight} 
                variant="outline"
                className="gap-2 border-indigo-500/30 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 transition-all h-9"
              >
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Analisar com IA
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* 🔹 TABELA PRINCIPAL */}
          <div className="h-[420px] overflow-y-auto border rounded-md relative shadow-inner">
            <table className="w-full">
              <thead className="sticky top-0 bg-secondary z-10 shadow-sm border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Passo</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Fluxo</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Volume</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Abandono</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {sortedSteps.map((step, idx) => (
                  <tr key={idx} className="hover:bg-secondary/50 transition-colors">

                    <td className="py-3 px-4 text-sm font-medium text-muted-foreground">
                      {step.passo}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 flex-wrap">

                        <span className={`text-xs px-2.5 py-1 rounded-md border font-medium ${getStyle(step.origem, false)}`}>
                          {step.origem}
                        </span>

                        <ArrowRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />

                        <span className={`text-xs px-2.5 py-1 rounded-md border font-medium ${getStyle(step.destino, step.isExit)}`}>
                          {step.isExit ? 'SAÍDA' : step.destino}
                        </span>

                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-semibold text-foreground">
                      {step.contagem}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {step.dropCount > 0 && (
                        <div className="flex items-center justify-end gap-1.5 text-orange-600 dark:text-orange-400 font-semibold bg-orange-50 dark:bg-orange-500/10 px-2 py-1 rounded-md w-fit ml-auto">
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
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-500" />
              Blocos com mais abandono
            </h3>

            <div className="overflow-x-auto border rounded-md shadow-inner">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Nome do bloco
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Total de abandonos
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/50">
                  {dropRanking.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="py-8 text-center text-muted-foreground text-sm">
                        Nenhum abandono registrado no período.
                      </td>
                    </tr>
                  ) : (
                    dropRanking.map((block) => (
                      <tr
                        key={block.rank}
                        className="hover:bg-secondary/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold">
                              {block.rank}º
                            </span>
                            <span className="text-sm text-foreground font-medium">
                              {block.blockName}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right text-sm font-semibold text-orange-600 dark:text-orange-400">
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

      {/* MODAL DE INSIGHT DA IA */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="!max-w-[70vw] !w-[70vw] flex flex-col gap-0 border-zinc-200 dark:border-zinc-800 shadow-2xl bg-white dark:bg-zinc-950 overflow-hidden max-h-[85vh] p-0">
          
          <DialogHeader className="p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
                <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  Análise Estratégica Mindy AI
                </DialogTitle>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Visão detalhada sobre fluidez, gargalos e abandonos na jornada.
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 overflow-y-auto flex-1">
            {isGeneratingInsight ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                  Analisando padrões e elaborando insights da jornada...
                </p>
              </div>
            ) : (
              <div className="pr-4">
                {renderMarkdown(insight || '')}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/20 shrink-0 flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
              className="px-8"
            >
              Fechar Análise
            </Button>
          </div>

        </DialogContent>
      </Dialog>
    </>
  )
}