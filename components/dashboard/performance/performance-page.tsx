'use client'

import { useMemo } from 'react'
import { ContactsCard } from './contacts-card'
import { RecurrenceCard } from './recurrence-card'
import { BlocksCard } from './blocks-card'
import { TransitionProbabilityCard } from './transition-probability-card'
import { BlockRelationsCard } from './block-relations-card'
import { JourneyStepsCard } from './journey-steps-card'

interface PerformancePageProps {
  activeFilters?: Record<string, string[]>
  rawData?: any // Adicionamos a prop para receber os dados reais do Dashboard
}

export function PerformancePage({ activeFilters = {}, rawData }: PerformancePageProps) {
  const dateRange = 'Período Selecionado'

  // Se os dados ainda não chegaram ou deram erro, mostra state vazio
  const data = rawData?.contactsDashboard?.data || null

  // 1. Mapeamento de Contatos
  const contactsData = useMemo(() => {
    if (!data) return null;
    return {
      totalContacts: data.resumo.total_contatos_unicos || 0,
      totalContactsChange: 0, // Como não temos last period, default 0
      noResponse: data.resumo.contatos_sem_resposta || 0,
      noResponseChange: 0,
      withInteraction: data.resumo.contatos_com_interacao || 0,
      withInteractionChange: 0,
      rejectionRate: data.taxas.rejeicao || 0,
      interactionRate: data.taxas.interacao || 0,
      chartData: (data.grafico || []).map((g: any) => ({
        date: g.data?.split('-').reverse().slice(0, 2).join('/') || 'N/A', // Converte "2026-05-20" para "20/05"
        comInteracao: g.com_interacao || 0,
        semResposta: g.sem_resposta || 0,
      }))
    }
  }, [data]);

  // 2. Mapeamento de Recorrência
  const recurrenceData = useMemo(() => {
    if (!data) return null;
    return {
      recurrenceRate: data.taxas.recorrencia || 0,
      uniqueRecurrentContacts: data.recorrencia.contatos_unicos_recorrentes || 0,
      topRecurrentContacts: (data.recorrencia.lista_contatos || []).map((c: any) => ({
        rank: c.posicao,
        name: c.nome,
        recurrence: c.recorrencia,
        phone: c.telefone
      }))
    }
  }, [data]);

  // 3. Mapeamento de Blocos Críticos
  const exceptionBlocks = useMemo(() => {
    if (!data) return [];
    return (data.blocos_fallback || []).map((b: any, index: number) => ({
      rank: index + 1,
      blockName: b.nome_bloco,
      totalEvents: b.contagem
    }));
  }, [data]);

  const transferBlocks = useMemo(() => {
    if (!data) return [];
    return (data.blocos_atendimento_humano || []).map((b: any, index: number) => ({
      rank: index + 1,
      blockName: b.nome_bloco,
      totalEvents: b.contagem
    }));
  }, [data]);

  // 4. Mapeamento de Jornada (Edges e Probabilidades)
  const journeyEdges = data?.jornada_contatos || [];
  
  const blockRelations = useMemo(() => {
    return journeyEdges.map((j: any) => ({
      source: j.origem.replace(/\[\d+\]/g, '').trim(), // Limpa os [IDs] que a Blip envia
      target: j.destino.replace(/\[\d+\]/g, '').trim(),
      value: j.contagem
    }));
  }, [journeyEdges]);

  const uniqueBlocks = useMemo(() => {
    return Array.from(new Set(blockRelations.flatMap((r: any) => [r.source, r.target]))) as string[];
  }, [blockRelations]);

  const transitionProbabilities = useMemo(() => {
    // Agrupa por origem para calcular a %
    const groupedByOrigem = journeyEdges.reduce((acc: any, curr: any) => {
      const source = curr.origem.replace(/\[\d+\]/g, '').trim();
      const target = curr.destino.replace(/\[\d+\]/g, '').trim();
      
      if (!acc[source]) acc[source] = { total: 0, destinations: [] };
      acc[source].total += curr.contagem;
      acc[source].destinations.push({ target, count: curr.contagem });
      return acc;
    }, {});

    const probs: any[] = [];
    Object.keys(groupedByOrigem).forEach(source => {
      const group = groupedByOrigem[source];
      group.destinations.forEach((dest: any) => {
        probs.push({
          fromBlock: source,
          toBlock: dest.target,
          probability: Number(((dest.count / group.total) * 100).toFixed(2))
        });
      });
    });
    return probs;
  }, [journeyEdges]);

  // Aplicação dos Filtros Ativos
  const filteredTransitions = useMemo(() => {
    if (!activeFilters.state_name || activeFilters.state_name.length === 0) return transitionProbabilities;
    return transitionProbabilities.filter((t) =>
      activeFilters.state_name.some((state) =>
        t.fromBlock.toLowerCase().includes(state.toLowerCase()) ||
        t.toBlock.toLowerCase().includes(state.toLowerCase())
      )
    )
  }, [activeFilters.state_name, transitionProbabilities]);

  const filteredRelations = useMemo(() => {
    if (!activeFilters.state_name || activeFilters.state_name.length === 0) return blockRelations;
    return blockRelations.filter((r: any) =>
      activeFilters.state_name.some((state) =>
        r.source.toLowerCase().includes(state.toLowerCase()) ||
        r.target.toLowerCase().includes(state.toLowerCase())
      )
    )
  }, [activeFilters.state_name, blockRelations]);

  const filteredExceptionBlocks = useMemo(() => {
    if (!activeFilters.action || activeFilters.action.length === 0) return exceptionBlocks;
    return exceptionBlocks;
  }, [activeFilters.action, exceptionBlocks]);

  const filteredTransferBlocks = useMemo(() => {
    if (!activeFilters.action || activeFilters.action.length === 0) return transferBlocks;
    return transferBlocks.filter((b: any) =>
      activeFilters.action.some((action) => b.blockName.toLowerCase().includes(action.toLowerCase()))
    )
  }, [activeFilters.action, transferBlocks]);


  if (!data || !contactsData || !recurrenceData) {
    return <div className="p-8 text-center text-muted-foreground">Nenhum dado de performance encontrado.</div>
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Contacts section */}
      <ContactsCard data={contactsData} dateRange={dateRange} />

      {/* Recurrence section */}
      <RecurrenceCard data={recurrenceData} />

      {/* Blocks with most exceptions/transfers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BlocksCard
          title="Blocos com mais exceção"
          description="Esses são os blocos que mais tiveram contatos direcionados ao bloco de exceções dos chatbots conectados a este router."
          linkText="Clique aqui para entender como analisar as mensagens que ocasionaram essas exceções."
          blocks={filteredExceptionBlocks}
        />
        <BlocksCard
          title="Blocos com mais transbordo"
          description="Esses são os blocos dos subbots que mais tiveram contatos direcionados para atendimento humano."
          linkText="Clique aqui para ler mais dicas e insights sobre transbordo."
          blocks={filteredTransferBlocks}
        />
      </div>

      {/* Nova visualização em tabela da Jornada */}
      <JourneyStepsCard data={journeyEdges} />

      {/* Transition probability */}
      <TransitionProbabilityCard data={filteredTransitions} />

      {/* Block relations */}
      <BlockRelationsCard relations={filteredRelations} blocks={uniqueBlocks} />
    </div>
  )
}