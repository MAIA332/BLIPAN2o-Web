'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface HistoryInsightButtonProps {
  contactId?: string;
  messages: any[]; // Substitua pelo tipo correto das suas mensagens
}

// O mesmo parser Markdown que você utilizou no JourneySteps
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
        return <strong key={index} className="font-bold text-indigo-900 dark:text-indigo-200">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('### ')) {
      flushList();
      elements.push(<h3 key={i} className="text-base font-bold text-indigo-900 dark:text-indigo-300 mt-6 mb-3">{processInline(line.replace('### ', ''))}</h3>);
    } else if (line.startsWith('## ')) {
      flushList();
      elements.push(<h2 key={i} className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mt-6 mb-3">{processInline(line.replace('## ', ''))}</h2>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      currentList.push(<li key={i} className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{processInline(line.substring(2))}</li>);
    } else if (line.match(/^\d+\.\s/)) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      currentList.push(<li key={i} className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{processInline(line.replace(/^\d+\.\s/, ''))}</li>);
    } else if (line === '') {
      flushList();
    } else {
      flushList();
      elements.push(<p key={i} className="mb-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{processInline(line)}</p>);
    }
  }
  flushList();

  return elements;
};

export function HistoryInsightButton({ contactId = 'Desconhecido', messages }: HistoryInsightButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false)
  const [insight, setInsight] = useState<string | null>(null)

  const handleGenerateInsight = async () => {
    if (!messages || messages.length === 0) return;
    
    setIsModalOpen(true);
    
    if (insight) return;

    setIsGeneratingInsight(true);

    try {
      const response = await fetch('/api/insight-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contactId,
          messages 
        })
      });

      if (!response.ok) throw new Error('Erro ao buscar insight');
      
      const responseData = await response.json();
      setInsight(responseData.insight);
    } catch (error) {
      console.error(error);
      setInsight("Desculpe, ocorreu um erro ao gerar a análise do histórico. Tente novamente.");
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  return (
    <>
      <Button 
        onClick={handleGenerateInsight} 
        disabled={!messages || messages.length === 0}
        variant="outline"
        className="gap-2 border-indigo-500/30 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 transition-all h-9"
      >
        <Sparkles className="w-4 h-4 text-indigo-500" />
        Analisar Histórico (IA)
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="!max-w-[70vw] !w-[70vw] flex flex-col gap-0 border-zinc-200 dark:border-zinc-800 shadow-2xl bg-white dark:bg-zinc-950 overflow-hidden max-h-[85vh] p-0">
          
          <DialogHeader className="p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
                <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  Resumo Conversacional Mindy AI
                </DialogTitle>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Análise das últimas {Math.min(messages.length, 100)} mensagens do cliente.
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 overflow-y-auto flex-1">
            {isGeneratingInsight ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                  Lendo o histórico e gerando diagnóstico de atendimento...
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