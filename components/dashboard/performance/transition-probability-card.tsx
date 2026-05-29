'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Info, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface TransitionData {
  fromBlock: string
  toBlock: string
  probability: number
}

interface TransitionProbabilityCardProps {
  data: TransitionData[]
}

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

/*
 |-------------------------------------------------------------------------- 
 | PARSER DE MARKDOWN CUSTOMIZADO
 |-------------------------------------------------------------------------- 
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

export function TransitionProbabilityCard({ data }: TransitionProbabilityCardProps) {
  // Estados para Modal e IA
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false)
  const [insight, setInsight] = useState<string | null>(null)

  // Tratamento original dos dados do gráfico
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.fromBlock]) {
      acc[item.fromBlock] = []
    }
    acc[item.fromBlock].push(item)
    return acc
  }, {} as Record<string, TransitionData[]>)

  const chartData = Object.entries(groupedData).map(([fromBlock, transitions]) => {
    const result: Record<string, string | number> = { name: fromBlock }
    transitions.forEach((t) => {
      result[t.toBlock] = t.probability
    })
    return result
  })

  const allDestinations = [...new Set(data.map((d) => d.toBlock))]

  // Chamada para a API
  const handleGenerateInsight = async () => {
    if (data.length === 0) return;
    
    setIsModalOpen(true);
    
    if (insight) return; // Evita requisições duplicadas

    setIsGeneratingInsight(true);

    try {
      // Ordena e filtra os dados mais relevantes para não sobrecarregar o token limit, se necessário
      const sortedTransitions = [...data]
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 30); // Limita às 30 maiores probabilidades como exemplo

      const response = await fetch('/api/insight-transitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transitions: sortedTransitions })
      });

      if (!response.ok) throw new Error('Erro ao buscar insight');
      
      const responseData = await response.json();
      setInsight(responseData.insight);
    } catch (error) {
      console.error(error);
      setInsight("Desculpe, ocorreu um erro ao gerar a análise de transições. Tente novamente.");
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold text-foreground">
                Probabilidade de Transição de States
              </CardTitle>
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Probabilidade de cada bloco levar para outro bloco específico. Mostra a tendência do cliente de seguir determinados caminhos.</p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>

            {/* Botão de Insight da IA */}
            {data.length > 0 && (
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
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Essa informação mostra em termos de média geral que quando um cliente cai em um bloco, qual é a chance de que esse cliente siga para algum dos blocos possíveis.
          </p>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} horizontal={true} vertical={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  axisLine={{ stroke: 'var(--border)' }}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                />
                {allDestinations.map((dest, index) => (
                  <Bar
                    key={dest}
                    dataKey={dest}
                    name={dest}
                    stackId="a"
                    fill={COLORS[index % COLORS.length]}
                    radius={index === allDestinations.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            {allDestinations.map((dest, index) => (
              <div key={dest} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-muted-foreground">{dest}</span>
              </div>
            ))}
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
                  Análise de Transições Mindy AI
                </DialogTitle>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Visão estratégica sobre o comportamento de navegação entre os blocos.
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 overflow-y-auto flex-1">
            {isGeneratingInsight ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                  Analisando padrões e calculando tendências de navegação...
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