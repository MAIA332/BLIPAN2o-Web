'use client'

import { useMemo, useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts'
import { Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TrackingItem {
  action?: string;
  count?: number;
  [key: string]: unknown;
}

type TrackingsRecord = Record<string, TrackingItem[]>;

interface BlockDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  blockName: string
  allTrackings: TrackingsRecord
}

// Função auxiliar para truncar textos gigantes (ex: JSONs/URLs de imagens)
const truncateText = (text: string, maxLength: number = 50) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export function BlockDetailsModal({ isOpen, onClose, blockName, allTrackings }: BlockDetailsModalProps) {
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false)
  const [insight, setInsight] = useState<string | null>(null)
  
  useEffect(() => {
    if (!isOpen) {
      setInsight(null)
      setIsGeneratingInsight(false)
    }
  }, [isOpen, blockName])

  const chartData = useMemo(() => {
    if (!allTrackings || !blockName) return [];

    const relatedTrackings = Object.entries(allTrackings).filter(([category]) => {
      const normalizedCategory = category.toLowerCase();
      const normalizedBlock = blockName.toLowerCase();
      return normalizedCategory.includes(normalizedBlock);
    });

    const consolidated = relatedTrackings.reduce<Record<string, number>>((acc, [_, items]) => {
      if (Array.isArray(items)) {
        items.forEach((item) => {
          const action = item.action || 'Desconhecido';
          acc[action] = (acc[action] || 0) + (item.count || 0);
        });
      }
      return acc;
    }, {});

    return Object.entries(consolidated).map(([name, value]) => ({ 
      // Mantemos o nome original escondido para o insight da IA e criamos uma versão truncada para o gráfico
      originalName: name, 
      name: truncateText(name, 35), // Trunca no eixo X para ficar mais limpo
      value 
    }));
  }, [allTrackings, blockName]);

  const handleGenerateInsight = async () => {
    if (chartData.length === 0) return;
    
    setIsGeneratingInsight(true);
    setInsight(null);

    try {
      // Passamos o dado original para a IA para que ela tenha o contexto completo (ex: URL da imagem)
      const dataForAI = chartData.map(item => ({ name: item.originalName, value: item.value }));

      const response = await fetch('/api/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockName, chartData: dataForAI })
      });

      if (!response.ok) throw new Error('Erro ao buscar insight');
      
      const data = await response.json();
      setInsight(data.insight);
    } catch (error) {
      console.error(error);
      setInsight("Desculpe, ocorreu um erro ao gerar o insight da IA. Tente novamente.");
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  // Custom Tooltip para forçar a quebra de linha (word-wrap) e evitar overflow na tela
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Pegamos o nome original do payload (que nós salvamos na formatação dos dados)
      const fullLabel = payload[0].payload.originalName || label;
      
      return (
        <div 
          className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 shadow-lg max-w-[300px]"
          style={{ wordWrap: 'break-word', whiteSpace: 'normal' }} // Força a quebra de linha de strings gigantes sem espaços
        >
          <p className="text-zinc-100 font-semibold mb-1 text-sm">{truncateText(fullLabel, 100)}</p>
          <p className="text-sky-500 font-medium text-sm">
            value : {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[80vw] !w-[80vw] border-zinc-200 dark:border-zinc-800 shadow-xl bg-white dark:bg-zinc-950 flex flex-col gap-0 overflow-hidden max-h-[90vh]">
        
        <DialogHeader className="p-6 pb-2 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Inputs do Bloco: <span className="text-sky-500">{blockName}</span>
              </DialogTitle>
              <DialogDescription className="text-zinc-500 dark:text-zinc-400 mt-1">
                Visualização consolidada de todas as ações rastreadas para este bloco.
              </DialogDescription>
            </div>
            
            {chartData.length > 0 && (
              <Button 
                onClick={handleGenerateInsight} 
                disabled={isGeneratingInsight}
                variant="outline"
                className="gap-2 border-indigo-500/30 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 transition-all"
              >
                {isGeneratingInsight ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                )}
                {isGeneratingInsight ? 'Analisando dados...' : 'Gerar Insight IA'}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="h-[400px] w-full bg-zinc-100 dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-inner overflow-hidden relative">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#a1a1aa" opacity={0.2} />
                  
                  <XAxis 
                    dataKey="name" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: 'var(--tw-colors-zinc-500)', fontWeight: 500 }} 
                    dy={10}
                    interval={0} // Força mostrar todos os ticks no eixo X
                    angle={-25}  // Inclina levemente para caber mais itens sem sobrepor
                    textAnchor="end" // Alinha o texto inclinado corretamente
                    height={60} // Dá mais espaço para o texto inclinado não cortar
                  />
                  <YAxis 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: 'var(--tw-colors-zinc-500)', fontWeight: 500 }} 
                    dx={-10}
                  />
                  
                  {/* Substituímos o Tooltip padrão pelo nosso customizado que previne quebras */}
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                    content={<CustomTooltip />}
                    isAnimationActive={false} // Desliga a animação do tooltip que causa tremores na tela
                  />
                  
                  <Bar 
                    dataKey="value" 
                    fill="#0ea5e9" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={60} 
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 dark:text-zinc-400 gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-sm font-medium">Nenhum dado de input encontrado para este bloco.</span>
              </div>
            )}
          </div>

          {insight && (
            <div className="p-5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h4 className="font-semibold text-indigo-900 dark:text-indigo-200">Análise de IA Mindy</h4>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm whitespace-pre-wrap">
                {insight}
              </p>
            </div>
          )}
        </div>

      </DialogContent>
    </Dialog>
  )
}