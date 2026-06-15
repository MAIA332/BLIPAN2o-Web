'use client'

import { useMemo } from 'react'
import { 
  Users, 
  Clock, 
  Ticket, 
  CheckCircle2, 
  MessageSquare, 
  Activity, 
  UserMinus, 
  Loader2,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAttendanceDashboard } from '@/hooks/useAttendanceDashboard'

// Tipagem esperada para os dados de contatos do Bot (Baseado no ContactsCard)
interface ContactsSummary {
  totalContacts: number
  totalContactsChange: number
  interactionRate: number
  rejectionRate: number
}

interface OverviewPageProps {
  branchId: string
  startDate: string
  endDate: string
  contactsData?: ContactsSummary | null
}

export function OverviewPage({ branchId, startDate, endDate, contactsData }: OverviewPageProps) {
  // Busca os dados de atendimento humano usando o seu hook existente
  const { data: attendanceData, isLoading, error } = useAttendanceDashboard(branchId, startDate, endDate)

  // =====================================================
  // CÁLCULOS DA VISÃO CONSOLIDADA (ATENDIMENTO HUMANO)
  // =====================================================
  const consolidatedAttendance = useMemo(() => {
    let waiting = 0
    let inAttendance = 0
    let open = 0
    let closed = 0
    const agentsSet = new Set()
    let onlineAgentsCount = 0

    if (attendanceData && !error) {
      const botsIds = Object.keys(attendanceData).filter(key => key !== 'success')

      botsIds.forEach(botId => {
        const metrics = attendanceData[botId].metrics
        waiting += metrics?.waiting_tickets?.total || 0
        inAttendance += metrics?.active_tickets?.inAttendance || 0
        open += metrics?.active_tickets?.open || 0
        closed += metrics?.tickets_report?.items?.reduce((acc: number, curr: any) => acc + (curr.closed || 0), 0) || 0

        metrics?.agents_metrics?.items?.forEach((agent: any) => {
          if (!agentsSet.has(agent.identity)) {
            agentsSet.add(agent.identity)
            if (agent.status === 'Online') onlineAgentsCount++
          }
        })
      })
    }

    return {
      waiting,
      inAttendance,
      open,
      closed,
      totalAgents: agentsSet.size,
      onlineAgentsCount
    }
  }, [attendanceData, error])

  // Componente auxiliar para a variação percentual
  const renderChange = (value?: number) => {
    if (value === undefined) return null
    const isNegative = value < 0
    return (
      <span className={`flex items-center gap-1 text-xs font-medium ml-2 ${isNegative ? 'text-destructive' : 'text-emerald-500'}`}>
        {isNegative ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
        {Math.abs(value)}%
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="font-medium">Carregando visão geral dos dados...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* SEÇÃO 1: RESUMO DO BOT (CONTATOS E ENGAJAMENTO) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Engajamento do Bot</h2>
            <p className="text-sm text-muted-foreground">Métricas gerais de interação automatizada</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card shadow-sm border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Contatos</CardTitle>
              <MessageSquare className="w-4 h-4 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <div className="text-3xl font-bold">{contactsData?.totalContacts || 0}</div>
                {renderChange(contactsData?.totalContactsChange)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-sm border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Interação</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{contactsData?.interactionRate?.toFixed(1) || 0}%</div>
              <div className="mt-3 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full" 
                  style={{ width: `${contactsData?.interactionRate || 0}%` }} 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-sm border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Rejeição</CardTitle>
              <UserMinus className="w-4 h-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{contactsData?.rejectionRate?.toFixed(1) || 0}%</div>
              <div className="mt-3 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-destructive rounded-full" 
                  style={{ width: `${contactsData?.rejectionRate || 0}%` }} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SEÇÃO 2: RESUMO DO ATENDIMENTO HUMANO */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2 mt-4">
          <div className="bg-indigo-500/10 p-2 rounded-lg">
            <Users className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Atendimento Humano</h2>
            <p className="text-sm text-muted-foreground">Consolidado de filas e agentes em operação</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Agentes Online</CardTitle>
              <Users className="w-4 h-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {consolidatedAttendance.onlineAgentsCount} 
                <span className="text-lg text-muted-foreground font-normal"> / {consolidatedAttendance.totalAgents}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Fila de Espera</CardTitle>
              <Clock className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{consolidatedAttendance.waiting}</div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Em Atendimento</CardTitle>
              <Ticket className="w-4 h-4 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {consolidatedAttendance.inAttendance} 
                <span className="text-lg text-muted-foreground font-normal"> / {consolidatedAttendance.open}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tickets Fechados</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{consolidatedAttendance.closed}</div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  )
}