'use client'

import { useMemo } from 'react'
import { ContactsCard } from './contacts-card'
import { RecurrenceCard } from './recurrence-card'
import { BlocksCard } from './blocks-card'
import { TransitionProbabilityCard } from './transition-probability-card'
import { BlockRelationsCard } from './block-relations-card'

interface PerformancePageProps {
  activeFilters?: Record<string, string[]>
}

// Mock data for performance page
const contactsData = {
  totalContacts: 19,
  totalContactsChange: -41,
  noResponse: 7,
  noResponseChange: -22,
  withInteraction: 12,
  withInteractionChange: -48,
  rejectionRate: 36.84,
  interactionRate: 63.16,
  chartData: [
    { date: '20/05', comInteracao: 8, semResposta: 3 },
    { date: '21/05', comInteracao: 10, semResposta: 4 },
    { date: '22/05', comInteracao: 6, semResposta: 2 },
    { date: '23/05', comInteracao: 12, semResposta: 5 },
    { date: '24/05', comInteracao: 9, semResposta: 4 },
  ],
}

const recurrenceData = {
  recurrenceRate: 0,
  uniqueRecurrentContacts: 0,
  topRecurrentContacts: [
    { rank: 7, name: 'Karina - Revista Proteç...', recurrence: 0, phone: '51992961690' },
    { rank: 8, name: 'Leticia Mariana - A Hora', recurrence: 0, phone: '51993098572' },
    { rank: 9, name: 'Adeline - A Hora do Sul', recurrence: 0, phone: '+5553999238585' },
  ],
}

const exceptionBlocks = [
  { rank: 1, blockName: 'Anything else', totalEvents: 1 },
  { rank: 2, blockName: 'Error handler', totalEvents: 0 },
]

const transferBlocks = [
  { rank: 1, blockName: '0.0 - Send e-mail to Comercial', totalEvents: 1 },
  { rank: 2, blockName: '1.2 - Transfer to Support', totalEvents: 0 },
]

const transitionProbabilities = [
  { fromBlock: '1.0 - Initial Menu', toBlock: '1.0.1 - Presentation', probability: 45 },
  { fromBlock: '1.0 - Initial Menu', toBlock: '1.0.2 - Policy', probability: 30 },
  { fromBlock: '1.0 - Initial Menu', toBlock: 'Error message', probability: 25 },
  { fromBlock: '1.0.1 - Presentation', toBlock: '1.1 - Options', probability: 70 },
  { fromBlock: '1.0.1 - Presentation', toBlock: 'Back to Menu', probability: 30 },
  { fromBlock: '1.0.2 - Policy', toBlock: 'Accept', probability: 80 },
  { fromBlock: '1.0.2 - Policy', toBlock: 'Decline', probability: 20 },
  { fromBlock: '1.1 - Options', toBlock: 'Comercial', probability: 40 },
  { fromBlock: '1.1 - Options', toBlock: 'Suporte', probability: 35 },
  { fromBlock: '1.1 - Options', toBlock: 'Outros', probability: 25 },
]

const blockRelations = [
  { source: '1.0 - Initial Menu', target: '1.0.1 - Presentation', value: 45 },
  { source: '1.0 - Initial Menu', target: '1.0.2 - Policy', value: 30 },
  { source: '1.0.1 - Presentation', target: '1.1 - Options', value: 70 },
  { source: '1.0.2 - Policy', target: 'Accept Flow', value: 25 },
  { source: '1.1 - Options', target: 'Comercial', value: 40 },
  { source: '1.1 - Options', target: 'Suporte', value: 35 },
]

const uniqueBlocks = [
  '1.0 - Initial Menu',
  '1.0.1 - Presentation',
  '1.0.2 - Policy',
  '1.1 - Options',
  'Comercial',
  'Suporte',
  'Accept Flow',
]

export function PerformancePage({ activeFilters = {} }: PerformancePageProps) {
  const dateRange = '20 de maio 2026 - 00h às 23h59'

  // Filter transitions based on active filters
  const filteredTransitions = useMemo(() => {
    if (!activeFilters.state_name || activeFilters.state_name.length === 0) {
      return transitionProbabilities
    }
    return transitionProbabilities.filter(
      (t) =>
        activeFilters.state_name.some(
          (state) =>
            t.fromBlock.toLowerCase().includes(state.toLowerCase()) ||
            t.toBlock.toLowerCase().includes(state.toLowerCase())
        )
    )
  }, [activeFilters.state_name])

  // Filter block relations based on active filters
  const filteredRelations = useMemo(() => {
    if (!activeFilters.state_name || activeFilters.state_name.length === 0) {
      return blockRelations
    }
    return blockRelations.filter(
      (r) =>
        activeFilters.state_name.some(
          (state) =>
            r.source.toLowerCase().includes(state.toLowerCase()) ||
            r.target.toLowerCase().includes(state.toLowerCase())
        )
    )
  }, [activeFilters.state_name])

  // Filter exception/transfer blocks based on action filter
  const filteredExceptionBlocks = useMemo(() => {
    if (!activeFilters.action || activeFilters.action.length === 0) {
      return exceptionBlocks
    }
    return exceptionBlocks
  }, [activeFilters.action])

  const filteredTransferBlocks = useMemo(() => {
    if (!activeFilters.action || activeFilters.action.length === 0) {
      return transferBlocks
    }
    return transferBlocks.filter((b) =>
      activeFilters.action.some((action) =>
        b.blockName.toLowerCase().includes(action.toLowerCase())
      )
    )
  }, [activeFilters.action])

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

      {/* Transition probability */}
      <TransitionProbabilityCard data={filteredTransitions} />

      {/* Block relations */}
      <BlockRelationsCard relations={filteredRelations} blocks={uniqueBlocks} />
    </div>
  )
}
