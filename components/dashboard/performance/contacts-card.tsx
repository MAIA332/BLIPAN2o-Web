'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Info, Download, TrendingDown, TrendingUp, Sparkles, Loader2 } from 'lucide-react'
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

interface ContactsData {
  totalContacts: number
  totalContactsChange: number
  noResponse: number
  noResponseChange: number
  withInteraction: number
  withInteractionChange: number
  rejectionRate: number
  interactionRate: number
  recurrenceRate?: number
  totalSent?: number
  totalReceived?: number
  chartData: { date: string; comInteracao: number; semResposta: number }[]
}

interface ContactsCardProps {
  data: ContactsData
  dateRange: string
}

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


export function ContactsCard({ data, dateRange }: ContactsCardProps) {
  
  // Estados para a Inteligência Artificial e Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false)
  const [insight, setInsight] = useState<string | null>(null)

  const handleGenerateInsight = async () => {
    setIsModalOpen(true); // Abre a modal imediatamente
    
    // Se já gerou, não precisa gerar de novo ao reabrir
    if (insight) return; 

    setIsGeneratingInsight(true);
    
    try {
      const response = await fetch('/api/insight-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Erro ao buscar insight');
      
      const responseData = await response.json();
      setInsight(responseData.insight);
    } catch (error) {
      console.error(error);
      setInsight("Desculpe, ocorreu um erro ao gerar a análise de contatos. Tente novamente.");
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  const formatChange = (value: number) => {
    const isNegative = value < 0
    return (
      <span className={`flex items-center gap-1 text-xs ${isNegative ? 'text-destructive' : 'text-green-500'}`}>
        {isNegative ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
        {isNegative ? '' : '+'}{value}%
      </span>
    )
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold text-foreground">
              Contatos
            </CardTitle>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Métricas de contatos do chatbot</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Botão da Inteligência Artificial */}
            <Button 
              onClick={handleGenerateInsight} 
              variant="outline"
              className="gap-2 border-indigo-500/30 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 transition-all h-8"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Analisar com IA
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Download className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Acompanhe as métricas relativas aos contatos que conversaram com o seu chatbot.
          </p>
          <p className="text-xs text-muted-foreground mb-4">{dateRange}</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left stats */}
            <div className="space-y-3">
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total de contatos únicos</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-foreground">{data.totalContacts}</span>
                    {formatChange(data.totalContactsChange)}
                  </div>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Contatos que não responderam</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold text-foreground">{data.noResponse}</span>
                    {formatChange(data.noResponseChange)}
                  </div>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Contatos com interação</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold text-foreground">{data.withInteraction}</span>
                    {formatChange(data.withInteractionChange)}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                    axisLine={{ stroke: 'var(--border)' }}
                  />
                  <YAxis
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                    axisLine={{ stroke: 'var(--border)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--foreground)',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="comInteracao"
                    name="Com interação"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="semResposta"
                    name="Sem resposta"
                    stroke="var(--muted-foreground)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Right stats */}
            <div className="space-y-3">
              <div className="bg-secondary/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Taxa de rejeição</span>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </div>
                <span className="text-2xl font-bold text-foreground">{data.rejectionRate.toFixed(2)}%</span>
                <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-destructive rounded-full"
                    style={{ width: `${data.rejectionRate}%` }}
                  />
                </div>
              </div>

              <div className="bg-secondary/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Taxa de interação</span>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </div>
                <span className="text-2xl font-bold text-foreground">{data.interactionRate.toFixed(2)}%</span>
                <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${data.interactionRate}%` }}
                  />
                </div>
              </div>
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
                  Visão detalhada sobre engajamento, rejeição e comportamento dos contatos.
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 overflow-y-auto flex-1">
            {isGeneratingInsight ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                  Processando métricas e elaborando insights...
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