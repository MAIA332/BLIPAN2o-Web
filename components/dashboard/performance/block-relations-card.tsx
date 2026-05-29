'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Info, Sparkles, Loader2, GitBranch, LogOut, LayoutGrid, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface BlockRelation {
  source: string
  target: string
  value: number
}

interface BlockRelationsCardProps {
  relations: BlockRelation[]
  blocks: string[]
}

// Helper de Markdown
const renderMarkdown = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let currentList: any[] = [];
  let listType = ''; 

  const flushList = () => {
    if (currentList.length > 0) {
      if (listType === 'ol') elements.push(<ol key={`ol-${elements.length}`} className="list-decimal pl-5 mb-4 space-y-2">{currentList}</ol>);
      else elements.push(<ul key={`ul-${elements.length}`} className="list-disc pl-5 mb-4 space-y-2">{currentList}</ul>);
      currentList = []; listType = '';
    }
  };

  const processInline = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-indigo-900 dark:text-indigo-200">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('### ')) {
      flushList(); elements.push(<h3 key={i} className="text-base font-bold text-indigo-900 dark:text-indigo-300 mt-6 mb-3">{processInline(line.replace('### ', ''))}</h3>);
    } else if (line.startsWith('## ')) {
      flushList(); elements.push(<h2 key={i} className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mt-6 mb-3">{processInline(line.replace('## ', ''))}</h2>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (listType !== 'ul') flushList(); listType = 'ul';
      currentList.push(<li key={i} className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{processInline(line.substring(2))}</li>);
    } else if (line === '') {
      flushList();
    } else {
      flushList(); elements.push(<p key={i} className="mb-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{processInline(line)}</p>);
    }
  }
  flushList();
  return elements;
};

export function BlockRelationsCard({ relations, blocks }: BlockRelationsCardProps) {
  // Estados para IA
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false)
  const [insight, setInsight] = useState<string | null>(null)

  // Estado para os blocos expansíveis
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({})

  // Função para alternar entre expandido e colapsado
  const toggleBlock = (source: string) => {
    setExpandedBlocks(prev => ({
      ...prev,
      [source]: !prev[source]
    }))
  }

  // Tratamento de Cores e Ícones
  const getBlockStyle = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('#exit')) return { color: 'bg-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400', icon: <LogOut className="w-3 h-3" /> };
    if (lowerName.includes('outros') || lowerName.includes('default')) return { color: 'bg-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/50', text: 'text-slate-600 dark:text-slate-300', icon: <LayoutGrid className="w-3 h-3" /> };
    return { color: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', icon: <GitBranch className="w-3 h-3" /> };
  };

  // Reestruturando dados para formato Funil/Branching
  const groupedData = useMemo(() => {
    const sourceMap: Record<string, { total: number; targets: BlockRelation[] }> = {};
    
    relations.forEach((rel) => {
      const cleanSource = rel.source.replace(/\[\d+\]/g, '').trim();
      const cleanTarget = rel.target.replace(/\[\d+\]/g, '').trim();
      
      if (!sourceMap[cleanSource]) {
        sourceMap[cleanSource] = { total: 0, targets: [] };
      }
      sourceMap[cleanSource].total += rel.value;
      sourceMap[cleanSource].targets.push({ source: cleanSource, target: cleanTarget, value: rel.value });
    });

    return Object.entries(sourceMap)
      .map(([source, data]) => ({
        source,
        total: data.total,
        targets: data.targets.sort((a, b) => b.value - a.value)
      }))
      .sort((a, b) => b.total - a.total);
  }, [relations]);

  const totalTransitions = relations.reduce((acc, r) => acc + r.value, 0);

  // Geração do Insight
  const handleGenerateInsight = async () => {
    if (relations.length === 0) return;
    setIsModalOpen(true);
    if (insight) return;

    setIsGeneratingInsight(true);

    try {
      const topFlows = groupedData.slice(0, 20).map(g => ({
        origem: g.source,
        volume_total: g.total,
        principais_destinos: g.targets.slice(0, 3).map(t => `${t.target} (${t.value})`)
      }));

      const response = await fetch('/api/insight-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flowData: topFlows, totalTransitions })
      });

      if (!response.ok) throw new Error('Erro ao buscar insight');
      const responseData = await response.json();
      setInsight(responseData.insight);
    } catch (error) {
      console.error(error);
      setInsight("Desculpe, ocorreu um erro ao analisar o fluxo. Tente novamente.");
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-indigo-500" />
                Fluxo de Navegação
              </CardTitle>
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent className="max-w-sm p-3">
                    <p>Visualização de ramificação. Clique nos blocos para ver ou ocultar para quais caminhos os usuários se dividem.</p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>

            {relations.length > 0 && (
              <Button 
                onClick={handleGenerateInsight} 
                variant="outline"
                className="gap-2 border-indigo-500/30 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 transition-all h-9"
              >
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Analisar Rotas com IA
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex gap-6 mb-6 text-xs text-muted-foreground bg-secondary/30 p-3 rounded-lg border border-border/50">
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"/> Fluxo Principal</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-400"/> Outros / Suporte</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"/> Saída / Fuga</span>
          </div>

          <div className="bg-card border border-border rounded-lg p-1 overflow-y-auto max-h-[500px] shadow-inner custom-scrollbar">
            <div className="flex flex-col gap-1">
              {groupedData.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Nenhum fluxo registrado.</div>
              ) : (
                groupedData.map((group, i) => {
                  // Define se está expandido (O primeiro abre por padrão)
                  const isExpanded = expandedBlocks[group.source] ?? (i === 0);

                  return (
                    <div key={i} className="p-4 bg-secondary/10 hover:bg-secondary/20 transition-colors rounded-md border border-transparent hover:border-border/50">
                      
                      {/* Bloco de Origem (Clicável para Expandir/Colapsar) */}
                      <div 
                        onClick={() => toggleBlock(group.source)}
                        className={`flex items-center justify-between cursor-pointer select-none group ${isExpanded ? 'mb-3 pb-2 border-b border-border/40' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-300">
                              <LayoutGrid className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-sm text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {group.source}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                          {group.total} saídas
                        </span>
                      </div>

                      {/* Lista de Destinos (Ramificações) */}
                      {isExpanded && (
                        <div className="flex flex-col gap-2 pl-9 mt-3 animate-in slide-in-from-top-2 fade-in duration-200">
                          {group.targets.map((target, idx) => {
                            const style = getBlockStyle(target.target);
                            const percentage = group.total > 0 ? ((target.value / group.total) * 100).toFixed(1) : '0';
                            
                            return (
                              <div key={idx} className="flex items-center gap-3 relative">
                                <div className="absolute -left-4 top-0 w-4 h-[50%] border-l-2 border-b-2 border-border/60 rounded-bl-md"></div>
                                
                                <div className={`flex items-center gap-2 w-1/3 min-w-[200px] p-2 rounded-md border border-white/5 dark:border-white/5 ${style.bg}`}>
                                  {style.icon}
                                  <span className={`text-xs font-medium truncate ${style.text}`} title={target.target}>
                                    {target.target}
                                  </span>
                                </div>

                                <div className="flex-1 flex items-center gap-3">
                                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${style.color} opacity-80`} 
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <div className="flex flex-col items-end min-w-[60px]">
                                    <span className="text-xs font-bold text-foreground">{target.value}</span>
                                    <span className="text-[10px] text-muted-foreground">{percentage}%</span>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Rodapé com Totais */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-secondary/30 border border-border/50 rounded-lg p-4 text-center">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{blocks.length}</span>
              <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">Blocos Mapeados</p>
            </div>
            <div className="bg-secondary/30 border border-border/50 rounded-lg p-4 text-center">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{relations.length}</span>
              <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">Conexões Únicas</p>
            </div>
            <div className="bg-secondary/30 border border-border/50 rounded-lg p-4 text-center">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalTransitions}</span>
              <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">Total de Transições</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal da IA */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="!max-w-[70vw] !w-[70vw] flex flex-col gap-0 border-zinc-200 dark:border-zinc-800 shadow-2xl bg-white dark:bg-zinc-950 overflow-hidden max-h-[85vh] p-0">
          <DialogHeader className="p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
                <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  Análise de Ramificações Mindy AI
                </DialogTitle>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Mapeamento de rotas principais e fugas no roteamento de usuários.
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            {isGeneratingInsight ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                  Mapeando conexões e identificando gargalos no fluxo...
                </p>
              </div>
            ) : (
              <div className="pr-4">
                {renderMarkdown(insight || '')}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/20 shrink-0 flex justify-end">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="px-8">
              Fechar Análise
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}