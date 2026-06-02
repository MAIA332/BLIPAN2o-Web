'use client'

import { Loader2, Users, Ticket, CheckCircle2, Clock, Layers } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAttendanceDashboard } from '@/hooks/useAttendanceDashboard'

interface AttendancePageProps {
  branchId: string
  startDate: string
  endDate: string
}

// =====================================================
// FUNÇÕES AUXILIARES (Tempo e Data)
// =====================================================

const timeToSeconds = (timeStr?: string) => {
  if (!timeStr) return 0;
  const [h, m, s] = timeStr.split(':').map(Number);
  return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
};

const formatSeconds = (seconds?: number) => {
  if (!seconds || isNaN(seconds) || seconds < 0) return '00:00:00';
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const formatStatusDate = (isoString?: string) => {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    // Subtrai 3 horas conforme a regra do front
    date.setHours(date.getHours() - 3);
    return date.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  } catch (e) {
    return isoString;
  }
};

// =====================================================
// SUBCOMPONENTES UI (Reutilizáveis)
// =====================================================

function DashboardCards({
  onlineAgents,
  totalAgents,
  waitingTickets,
  inAttendance,
  activeTicketsOpen,
  historicalClosed
}: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Atendentes (Online / Total)</CardTitle>
          <Users className="w-4 h-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {onlineAgents} <span className="text-lg text-muted-foreground font-normal">/ {totalAgents}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Fila de Espera Atual</CardTitle>
          <Clock className="w-4 h-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{waitingTickets}</div>
        </CardContent>
      </Card>

      <Card className="bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Em Atendimento (Agora)</CardTitle>
          <Ticket className="w-4 h-4 text-indigo-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {inAttendance} <span className="text-lg text-muted-foreground font-normal">/ {activeTicketsOpen}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Tickets Fechados (Histórico)</CardTitle>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{historicalClosed}</div>
          <p className="text-xs text-muted-foreground mt-1">No período selecionado</p>
        </CardContent>
      </Card>
    </div>
  )
}

function AgentsTable({ agents, title = "Visão Geral dos Agentes" }: { agents: any[], title?: string }) {
  return (
    <Card className="bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto border border-border/50 rounded-lg shadow-inner custom-scrollbar max-h-[400px]">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-secondary/80 text-foreground border-b border-border/50 sticky top-0 backdrop-blur z-10">
              <tr>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">E-mail</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">T. Abertos</th>
                <th className="px-4 py-3 font-semibold text-right">T. Fechados</th>
                <th className="px-4 py-3 font-semibold text-right">TMA</th>
                <th className="px-4 py-3 font-semibold text-right">TMR</th>
                <th className="px-4 py-3 font-semibold text-right">Pausa</th>
                <th className="px-4 py-3 font-semibold">Última Atualização</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {agents.map((agent: any) => {
                let statusColor = "text-muted-foreground";
                if (agent.status === "Online") statusColor = "text-emerald-500";
                if (agent.status === "Offline") statusColor = "text-red-500";
                if (agent.status === "Invisible") statusColor = "text-orange-500";

                return (
                  <tr key={agent.identity} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{agent.agentName || agent.fullName || 'Desconhecido'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{agent.identity.split('%40')[0]}</td>
                    <td className={`px-4 py-3 font-bold ${statusColor}`}>{agent.status}</td>
                    <td className="px-4 py-3 font-mono text-right">{agent.openedTickets || 0}</td>
                    <td className="px-4 py-3 font-mono text-right">{agent.closedTickets || 0}</td>
                    <td className="px-4 py-3 font-mono text-right text-muted-foreground">{agent.averageAttendanceTime || '00:00:00'}</td>
                    <td className="px-4 py-3 font-mono text-right text-muted-foreground">{agent.averageResponseTime || '00:00:00'}</td>
                    <td className="px-4 py-3 font-mono text-right text-muted-foreground">{formatSeconds(agent.breakDurationInSeconds)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatStatusDate(agent.currentStatusDateTime)}</td>
                  </tr>
                );
              })}
              {agents.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum agente com métricas no período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================

export function AttendanceDashboardPage({ branchId, startDate, endDate }: AttendancePageProps) {
  const { data, isLoading, error } = useAttendanceDashboard(branchId, startDate, endDate);

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
        <p className="font-medium">Compilando dados de atendimento dos bots...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-destructive gap-4">
        <p className="font-semibold text-lg">Atenção</p>
        <p>{error}</p>
      </div>
    );
  }

  const ObjectKeys = Object.keys(data);
  const botsIds = ObjectKeys.filter(key => key !== 'success');

  if (botsIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground border-2 border-dashed border-border/60 bg-secondary/10 rounded-xl">
        <p className="text-xl font-semibold text-foreground mb-1">Nenhum Bot Encontrado</p>
        <p className="text-sm">Esta empresa não possui bots de atendimento cadastrados.</p>
      </div>
    );
  }

  // =====================================================
  // CÁLCULOS DA VISÃO CONSOLIDADA (AGREGADA)
  // =====================================================
  const consolidatedAgentsMap = new Map();
  let consolidatedWaiting = 0;
  let consolidatedInAttendance = 0;
  let consolidatedOpen = 0;
  let consolidatedClosed = 0;

  botsIds.forEach(botId => {
    const metrics = data[botId].metrics;

    consolidatedWaiting += metrics?.waiting_tickets?.total || 0;
    consolidatedInAttendance += metrics?.active_tickets?.inAttendance || 0;
    consolidatedOpen += metrics?.active_tickets?.open || 0;
    consolidatedClosed += metrics?.tickets_report?.items?.reduce((acc: number, curr: any) => acc + (curr.closed || 0), 0) || 0;

    metrics?.agents_metrics?.items?.forEach((agent: any) => {
      if (consolidatedAgentsMap.has(agent.identity)) {
        const existing = consolidatedAgentsMap.get(agent.identity);
        
        // Ponderação matemática do TMA e TMR para não perder a exatidão agregando
        const existingWeight = (existing.openedTickets || 0) + (existing.closedTickets || 0);
        const newWeight = (agent.openedTickets || 0) + (agent.closedTickets || 0);
        const totalWeight = existingWeight + newWeight;

        if (totalWeight > 0) {
           const existingTMA = timeToSeconds(existing.averageAttendanceTime);
           const newTMA = timeToSeconds(agent.averageAttendanceTime);
           existing.averageAttendanceTime = formatSeconds(((existingTMA * existingWeight) + (newTMA * newWeight)) / totalWeight);

           const existingTMR = timeToSeconds(existing.averageResponseTime);
           const newTMR = timeToSeconds(agent.averageResponseTime);
           existing.averageResponseTime = formatSeconds(((existingTMR * existingWeight) + (newTMR * newWeight)) / totalWeight);
        }

        existing.openedTickets = (existing.openedTickets || 0) + (agent.openedTickets || 0);
        existing.closedTickets = (existing.closedTickets || 0) + (agent.closedTickets || 0);
        existing.breakDurationInSeconds = (existing.breakDurationInSeconds || 0) + (agent.breakDurationInSeconds || 0);
        
        // Atualiza para o status datetime mais recente
        if (agent.currentStatusDateTime && existing.currentStatusDateTime) {
          if (new Date(agent.currentStatusDateTime) > new Date(existing.currentStatusDateTime)) {
            existing.currentStatusDateTime = agent.currentStatusDateTime;
          }
        } else if (agent.currentStatusDateTime) {
          existing.currentStatusDateTime = agent.currentStatusDateTime;
        }

        if (agent.status === 'Online') existing.status = 'Online';
      } else {
        consolidatedAgentsMap.set(agent.identity, { ...agent });
      }
    });
  });

  const consolidatedAgentsList = Array.from(consolidatedAgentsMap.values());
  const consolidatedTotalAgents = consolidatedAgentsList.length;
  const consolidatedOnlineAgents = consolidatedAgentsList.filter(a => a.status === 'Online').length;

  return (
    <div className="space-y-10 pb-6">
      
      {botsIds.length > 1 && (
        <div className="space-y-6 mb-12">
          <div className="border-b border-border pb-2 flex items-center gap-2">
            <div className="bg-indigo-500/10 p-2 rounded-lg">
              <Layers className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Visão Consolidada</h2>
              <p className="text-sm text-muted-foreground">Desempenho somado de todos os bots de atendimento</p>
            </div>
          </div>

          <DashboardCards 
            onlineAgents={consolidatedOnlineAgents}
            totalAgents={consolidatedTotalAgents}
            waitingTickets={consolidatedWaiting}
            inAttendance={consolidatedInAttendance}
            activeTicketsOpen={consolidatedOpen}
            historicalClosed={consolidatedClosed}
          />

          <AgentsTable agents={consolidatedAgentsList} title="Todos os Agentes (Únicos)" />
        </div>
      )}

      {botsIds.length > 1 && (
        <div className="flex items-center gap-4 my-8">
          <h2 className="text-xl font-bold text-foreground whitespace-nowrap">Visão por Bot</h2>
          <div className="h-px bg-border flex-1"></div>
        </div>
      )}

      {botsIds.map((botId) => {
        const botData = data[botId];
        const metrics = botData.metrics;

        const botAgentsList = metrics?.agents_metrics?.items || [];
        const totalAgents = metrics?.agents?.total || 0;
        const onlineAgents = botAgentsList.filter((a: any) => a.status === 'Online').length || 0;
        
        const waitingTickets = metrics?.waiting_tickets?.total || 0;
        const activeTicketsOpen = metrics?.active_tickets?.open || 0;
        const inAttendance = metrics?.active_tickets?.inAttendance || 0;
        
        const historicalClosed = metrics?.tickets_report?.items?.reduce((acc: number, curr: any) => acc + (curr.closed || 0), 0) || 0;

        return (
          <div key={botId} className="space-y-6 bg-secondary/5 rounded-2xl p-6 border border-border shadow-sm">
            <div className="border-b border-border/60 pb-2">
              <h3 className="text-xl font-bold text-foreground">Bot: {botData.bot_info.name}</h3>
              <p className="text-xs text-muted-foreground font-mono mt-1">ID: {botData.bot_info.id}</p>
            </div>

            <DashboardCards 
              onlineAgents={onlineAgents}
              totalAgents={totalAgents}
              waitingTickets={waitingTickets}
              inAttendance={inAttendance}
              activeTicketsOpen={activeTicketsOpen}
              historicalClosed={historicalClosed}
            />

            <AgentsTable agents={botAgentsList} title={`Agentes - ${botData.bot_info.name}`} />
          </div>
        )
      })}

    </div>
  )
}