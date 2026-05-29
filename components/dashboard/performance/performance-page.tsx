'use client'

import { useMemo, useState } from 'react'
import { ContactsCard } from './contacts-card'
import { RecurrenceCard } from './recurrence-card'
import { BlocksCard } from './blocks-card'
import { TransitionProbabilityCard } from './transition-probability-card'
import { BlockRelationsCard } from './block-relations-card'
import { JourneyStepsCard } from './journey-steps-card'
import { BlockDetailsModal } from './BlockDetailsModal'

interface PerformancePageProps {
  activeFilters?: Record<string, string[]>
  rawData?: any
  branchId: string // Prop necessária para enviar ao RecurrenceCard
}

export function PerformancePage({ activeFilters = {}, rawData, branchId }: PerformancePageProps) {
  const dateRange = 'Período Selecionado'
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  // 1. Correção de caminho: Tenta pegar de contactsDashboard, mas faz o fallback direto para rawData.data
  const data = rawData?.contactsDashboard?.data || rawData?.data || null;
  const allTrackings = rawData?.trackings?.data || {};

  // 2. Mapeamento super seguro usando optional chaining (?.)
  const contactsData = useMemo(() => {
    if (!data || !data.resumo) return null;
    return {
      totalContacts: data.resumo?.total_contatos_unicos || 0,
      totalContactsChange: 0,
      noResponse: data.resumo?.contatos_sem_resposta || 0,
      noResponseChange: 0,
      withInteraction: data.resumo?.contatos_com_interacao || 0,
      withInteractionChange: 0,
      rejectionRate: data.taxas?.rejeicao || 0,
      interactionRate: data.taxas?.interacao || 0,
      chartData: (data.grafico || []).map((g: any) => ({
        date: g?.data?.split('-').reverse().slice(0, 2).join('/') || 'N/A',
        comInteracao: g?.com_interacao || 0,
        semResposta: g?.sem_resposta || 0,
      }))
    }
  }, [data]);

  const recurrenceData = useMemo(() => {
    if (!data?.recorrencia) return null;

    return {
      recurrenceRate: data.taxas?.recorrencia || 0,
      uniqueRecurrentContacts: data.recorrencia?.contatos_unicos_recorrentes || 0,
      topRecurrentContacts: (data.recorrencia?.lista_contatos || [])
        .filter((c: any) => c.recorrencia > 0) // Filtra aqui também por segurança
        .map((c: any) => ({
          rank: c?.posicao,
          name: c?.nome || 'Desconhecido',
          recurrence: c?.recorrencia || 0,
          phone: c?.telefone || '',
          identity: c?.identity
        }))
    }
  }, [data]);

  const exceptionBlocks = useMemo(() => {
    if (!data || !data.blocos_fallback) return [];
    return data.blocos_fallback.map((b: any, index: number) => ({
      rank: index + 1,
      blockName: b?.nome_bloco || 'Desconhecido',
      totalEvents: b?.contagem || 0
    }));
  }, [data]);

  const transferBlocks = useMemo(() => {
    if (!data || !data.blocos_atendimento_humano) return [];
    return data.blocos_atendimento_humano.map((b: any, index: number) => ({
      rank: index + 1,
      blockName: b?.nome_bloco || 'Desconhecido',
      totalEvents: b?.contagem || 0
    }));
  }, [data]);

  const journeyEdges = data?.jornada_contatos || [];

  const blockRelations = useMemo(() => {
    return journeyEdges.map((j: any) => ({
      source: j?.origem?.replace(/\[\d+\]/g, '').trim() || '',
      target: j?.destino?.replace(/\[\d+\]/g, '').trim() || '',
      value: j?.contagem || 0
    }));
  }, [journeyEdges]);

  const uniqueBlocks = useMemo(() => {
    return Array.from(new Set(blockRelations.flatMap((r: any) => [r.source, r.target]))) as string[];
  }, [blockRelations]);

  const transitionProbabilities = useMemo(() => {
    const groupedByOrigem = journeyEdges.reduce((acc: any, curr: any) => {
      const source = curr?.origem?.replace(/\[\d+\]/g, '').trim();
      const target = curr?.destino?.replace(/\[\d+\]/g, '').trim();

      if (!source || !target) return acc;

      if (!acc[source]) acc[source] = { total: 0, destinations: [] };
      acc[source].total += (curr.contagem || 0);
      acc[source].destinations.push({ target, count: (curr.contagem || 0) });
      return acc;
    }, {});

    const probs: any[] = [];
    Object.keys(groupedByOrigem).forEach(source => {
      const group = groupedByOrigem[source];
      group.destinations.forEach((dest: any) => {
        probs.push({
          fromBlock: source,
          toBlock: dest.target,
          probability: group.total > 0 ? Number(((dest.count / group.total) * 100).toFixed(2)) : 0
        });
      });
    });
    return probs;
  }, [journeyEdges]);

  const filteredTransitions = useMemo(() => {
    if (!activeFilters?.state_name || activeFilters.state_name.length === 0) return transitionProbabilities;
    return transitionProbabilities.filter((t) =>
      activeFilters.state_name.some((state) =>
        t.fromBlock.toLowerCase().includes(state.toLowerCase()) ||
        t.toBlock.toLowerCase().includes(state.toLowerCase())
      )
    )
  }, [activeFilters, transitionProbabilities]);

  const filteredRelations = useMemo(() => {
    if (!activeFilters?.state_name || activeFilters.state_name.length === 0) return blockRelations;
    return blockRelations.filter((r: any) =>
      activeFilters.state_name.some((state) =>
        r.source.toLowerCase().includes(state.toLowerCase()) ||
        r.target.toLowerCase().includes(state.toLowerCase())
      )
    )
  }, [activeFilters, blockRelations]);

  const filteredExceptionBlocks = useMemo(() => {
    return exceptionBlocks;
  }, [exceptionBlocks]);

  const filteredTransferBlocks = useMemo(() => {
    if (!activeFilters?.action || activeFilters.action.length === 0) return transferBlocks;
    return transferBlocks.filter((b: any) =>
      activeFilters.action.some((action) => b.blockName.toLowerCase().includes(action.toLowerCase()))
    )
  }, [activeFilters, transferBlocks]);


  if (!data || !contactsData || !recurrenceData) {
    return <div className="p-8 text-center text-muted-foreground">Nenhum dado de performance encontrado.</div>
  }

  return (
    <div className="space-y-6 pb-6">
      <ContactsCard data={contactsData} dateRange={dateRange} />

      {/* Card que recebe o branchId para rodar o fetch no background */}
      <RecurrenceCard data={recurrenceData} branchId={branchId} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BlocksCard
          title="Blocos com mais exceção"
          description="Esses são os blocos que mais tiveram contatos direcionados ao bloco de exceções."
          linkText="Clique em uma linha para ver os inputs relacionados."
          blocks={filteredExceptionBlocks}
          onBlockClick={(name) => {
            console.log("DEBUG: Clique no bloco detectado:", name);
            setSelectedBlock(name);
          }}
        />
        <BlocksCard
          title="Blocos com mais transbordo"
          description="Esses são os blocos dos subbots que mais tiveram contatos direcionados para atendimento humano."
          linkText="Clique em uma linha para ver os inputs relacionados."
          blocks={filteredTransferBlocks}
          /* onBlockClick={(name) => {
            console.log("DEBUG: Clique no bloco detectado:", name);
            setSelectedBlock(name);
          }} */
        />
      </div>
      <BlockDetailsModal
        isOpen={!!selectedBlock}
        onClose={() => setSelectedBlock(null)}
        blockName={selectedBlock || ''}
        allTrackings={rawData?.trackings?.data || {}} // Garantindo que passamos o objeto correto
      />
      <JourneyStepsCard data={journeyEdges} />

      <TransitionProbabilityCard data={filteredTransitions} />

      <BlockRelationsCard relations={filteredRelations} blocks={uniqueBlocks} />
    </div>
  )
}