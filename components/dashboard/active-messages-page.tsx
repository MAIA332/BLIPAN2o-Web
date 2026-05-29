'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Loader2, 
  MessageSquare, 
  Megaphone, 
  BarChart3,
  UserCheck,
  PieChart as PieChartIcon,
  ArrowRightLeft,
  ChevronRight,
  Download,
  Send,
  Smartphone,
  Eye,
  Server,
  Waypoints,
  MapPin,
  FileText,
  Users,
  CheckCircle2,
  XCircle,
  Reply
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ActiveMessagesPageProps {
  branchId: string
  startDate: string
  endDate: string
}

const PIE_COLORS = ['#93c5fd', '#fca5a5', '#86efac', '#fdba74', '#c4b5fd', '#f9a8d4', '#fde047', '#d8b4fe', '#94a3b8'];

export function ActiveMessagesPage({ branchId, startDate, endDate }: ActiveMessagesPageProps) {
  // Estados para as Métricas do Desk (Nova API com Polling)
  const [deskData, setDeskData] = useState<any>(null)
  const [isDeskLoading, setIsDeskLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Iniciando extração de métricas...");

  // Estados para o Histórico de Campanhas (API Antiga)
  const [campaignsData, setCampaignsData] = useState<any>(null)
  const [isCampaignsLoading, setIsCampaignsLoading] = useState(false)

  // Estados do Modal de Relatório Específico
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
  const [campaignReport, setCampaignReport] = useState<any>(null)
  const [isReportLoading, setIsReportLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 1. Fetch dos Dados Analíticos do Desk com Polling (15 em 15 segundos)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const fetchDeskMetrics = async () => {
      if (!branchId) return;
      setIsDeskLoading(true);
      
      try {
        const token = localStorage.getItem('access_token') || '';
        const response = await fetch('/api/blip/an/desk-active-messages-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ branch_id: branchId, startDate, endDate })
        });

        const result = await response.json();

        if (!isMounted) return;

        if (result.success) {
          if (result.status === 'processing') {
            setLoadingMessage("Volume extenso de dados. Compilando as métricas do Desk em segundo plano...");
            timeoutId = setTimeout(fetchDeskMetrics, 15000);
          } else if (result.status === 'completed') {
            setDeskData(result.data);
            setIsDeskLoading(false);
          } else {
            setDeskData(result.data || result);
            setIsDeskLoading(false);
          }
        } else {
          console.error("Erro na resposta da API Desk:", result.message);
          setIsDeskLoading(false);
        }
      } catch (error) {
        console.error("Erro ao carregar métricas do Desk:", error);
        if (isMounted) setIsDeskLoading(false);
      }
    };

    fetchDeskMetrics();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [branchId, startDate, endDate]);

  // 2. Fetch da Lista Geral de Campanhas (API Antiga)
  useEffect(() => {
    const fetchCampaignsHistory = async () => {
      if (!branchId) return;
      setIsCampaignsLoading(true);

      try {
        const token = localStorage.getItem('access_token') || '';
        const response = await fetch('/api/blip/an/active-messages-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ branch_id: branchId, startDate, endDate })
        });

        const result = await response.json();
        if (result.success) {
          setCampaignsData(result.data);
        }
      } catch (error) {
        console.error("Erro ao carregar histórico de campanhas:", error);
      } finally {
        setIsCampaignsLoading(false);
      }
    };

    fetchCampaignsHistory();
  }, [branchId, startDate, endDate]);

  // Helpers de formatação
  const formatDateTime = (isoString: string) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getAgentName = (c: any) => {
    if (c.campaignSender) return c.campaignSender.split('@')[0];
    if (c.attendanceRedirect) return c.attendanceRedirect.split('@')[0];
    if (c.name?.toLowerCase().includes('desk')) return 'Desk (Atendente)';
    return 'Bot (Automático)';
  }

  // 3. Fetch Relatório Modal (API Detalhada)
  const handleOpenCampaignReport = async (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setIsModalOpen(true);
    setIsReportLoading(true);
    setCampaignReport(null);

    try {
      const token = localStorage.getItem('access_token') || '';
      const response = await fetch('/api/blip/an/campaign-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ branch_id: branchId, campaign_id: campaignId })
      });

      const result = await response.json();
      if (result.success) setCampaignReport(result.data);
    } catch (error) {
      console.error("Erro ao carregar relatório:", error);
    } finally {
      setIsReportLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!campaignReport?.statusAudience?.length) return;
    const headers = ['Identificador', 'Status', 'Data de Processamento', 'Recebido em', 'Lido em'];
    const rows = campaignReport.statusAudience.map((audience: any) => [
      audience.recipientIdentity?.split('@')[0] || 'N/A',
      audience.status || 'N/A',
      audience.processed ? new Date(audience.processed).toLocaleString('pt-BR') : 'N/A',
      audience.received ? new Date(audience.received).toLocaleString('pt-BR') : 'N/A',
      audience.read ? new Date(audience.read).toLocaleString('pt-BR') : 'N/A'
    ]);
    const csvContent = [headers.join(';'), ...rows.map((row: any) => row.join(';'))].join('\n');
    const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = (campaignReport.name || 'relatorio').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute('href', url);
    link.setAttribute('download', `${safeName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Lógica de Tela de Carregamento (Mostra enquanto os dados do Desk não finalizarem)
  if (isDeskLoading || !deskData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="font-medium text-center px-4 max-w-sm">{loadingMessage}</p>
      </div>
    );
  }

  // Variáveis para os Gráficos
  const totalDisparos = deskData.taxa_conversao_por_template?.reduce((acc: number, curr: any) => acc + curr.processados, 0) || 0;
  const agentChartData = deskData.distribuicao_por_atendente?.map((a: any) => ({ name: a.atendente.split('@')[0], value: a.disparos })) || [];
  const templateChartData = deskData.distribuicao_por_template?.map((t: any) => ({ name: t.template, value: t.disparos })) || [];
  const conversionData = deskData.taxa_conversao_por_template || [];
  const topTemplates = conversionData.map((t: any) => t.template);

  // Variáveis do Modal
  const totalProcessed = campaignReport?.statusAudience?.length || 0;
  const totalReceived = campaignReport?.statusAudience?.filter((a: any) => a.received || ['RECEIVED', 'READ', 'REPLIED'].includes(a.status)).length || 0;
  const totalRead = campaignReport?.statusAudience?.filter((a: any) => a.read || ['READ', 'REPLIED'].includes(a.status)).length || 0;
  const receivedRate = totalProcessed > 0 ? ((totalReceived / totalProcessed) * 100).toFixed(1) : '0';
  const readRate = totalReceived > 0 ? ((totalRead / totalReceived) * 100).toFixed(1) : '0';
  const isDeskCampaign = campaignReport?.name?.toLowerCase().includes('desk') || !!campaignReport?.campaignSender;

  return (
    <div className="space-y-6 pb-6">
      
      {/* 🔹 CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total de Disparos Ativos</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-md">
              <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">{totalDisparos}</div>
            <p className="text-xs text-muted-foreground mt-1">Soma total de templates processados</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Campanhas Desk</CardTitle>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-md">
              <Megaphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">{deskData.total_desk_campaigns || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Disparos independentes analisados</p>
          </CardContent>
        </Card>
      </div>

      {/* 🔹 GRÁFICO PRINCIPAL: FUNIL POR TEMPLATE */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2"><BarChart3 className="w-5 h-5 text-indigo-500" /> Funil de Conversão por Template</CardTitle>
          <p className="text-sm text-muted-foreground">Comparativo entre a quantidade processada, visualizada e respondida para cada template.</p>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="template" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} angle={-15} textAnchor="end" />
                <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'var(--secondary)' }} contentStyle={{ backgroundColor: 'var(--popover)', borderRadius: '8px', color: 'var(--foreground)' }} />
                <Legend verticalAlign="top" height={36}/>
                <Bar dataKey="processados" name="Enviados" fill="#93c5fd" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="visualizados" name="Lidos" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="respondidos" name="Respondidos" fill="#818cf8" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 🔹 GRÁFICOS PIE: ATENDENTES & TEMPLATES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2"><PieChartIcon className="w-5 h-5 text-blue-500"/> Volume por Atendente</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center h-[300px]">
            {agentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={agentChartData} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label>
                    {agentChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--popover)', borderRadius: '8px', color: 'var(--foreground)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <span className="text-muted-foreground mt-10">Dados insuficientes.</span>}
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2"><PieChartIcon className="w-5 h-5 text-emerald-500"/> Divisão de Templates</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center h-[300px]">
            {templateChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={templateChartData.slice(0,6)} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label>
                    {templateChartData.slice(0,6).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[(index + 3) % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--popover)', borderRadius: '8px', color: 'var(--foreground)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <span className="text-muted-foreground mt-10">Dados insuficientes.</span>}
          </CardContent>
        </Card>
      </div>

      {/* 🔹 TABELA DE CONVERSÃO DETALHADA */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2"><ArrowRightLeft className="w-5 h-5 text-emerald-500" /> Tabela Analítica de Templates</CardTitle>
          <p className="text-sm text-muted-foreground">Taxas exatas de conversão e visualização de cada template.</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border border-border/50 rounded-lg shadow-inner custom-scrollbar">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-secondary/80 text-foreground border-b border-border/50">
                <tr>
                  <th className="px-4 py-3 font-semibold">Template Utilizado</th>
                  <th className="px-4 py-3 font-semibold text-right">Processados</th>
                  <th className="px-4 py-3 font-semibold text-right">Visualizados</th>
                  <th className="px-4 py-3 font-semibold text-right">Respondidos</th>
                  <th className="px-4 py-3 font-semibold text-right">Taxa (Resp/Proc)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {conversionData.map((row: any) => (
                  <tr key={row.template} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{row.template}</td>
                    <td className="px-4 py-3 font-mono text-right text-muted-foreground">{row.processados}</td>
                    <td className="px-4 py-3 font-mono text-right text-emerald-600 dark:text-emerald-400">{row.visualizados}</td>
                    <td className="px-4 py-3 font-mono text-right text-blue-600 dark:text-blue-400">{row.respondidos}</td>
                    <td className="px-4 py-3 font-mono font-bold text-right text-indigo-600 dark:text-indigo-400">{row.taxa_conversao}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 🔹 TABELA MATRIZ: RELAÇÃO ATENDENTE x TEMPLATE */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2"><UserCheck className="w-5 h-5 text-indigo-500" /> Disparos (Atendente x Template)</CardTitle>
          <p className="text-sm text-muted-foreground">Volume absoluto de disparos cruzando o atendente com o template escolhido.</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border border-border/50 rounded-lg shadow-inner custom-scrollbar">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="bg-secondary/80 text-foreground border-b border-border/50">
                <tr>
                  <th className="px-4 py-3 font-semibold sticky left-0 bg-secondary/90 backdrop-blur z-10 border-r border-border/50">Atendente</th>
                  {topTemplates.map((tpl: string) => (
                    <th key={tpl} className="px-4 py-3 font-semibold truncate max-w-[150px]" title={tpl}>{tpl}</th>
                  ))}
                  <th className="px-4 py-3 font-bold text-right bg-secondary/90">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {deskData.relacao_atendente_template?.map((row: any) => {
                  const agentName = row.atendente.split('@')[0];
                  const totalAgent = topTemplates.reduce((acc: number, tpl: string) => acc + (row.disparos_por_template[tpl] || 0), 0);
                  
                  return (
                    <tr key={row.atendente} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground sticky left-0 bg-card z-10 border-r border-border/50" title={row.atendente}>
                        {agentName}
                      </td>
                      {topTemplates.map((tpl: string) => {
                        const val = row.disparos_por_template[tpl] || 0;
                        return (
                          <td key={tpl} className={`px-4 py-3 font-mono ${val > 0 ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-muted-foreground/30'}`}>
                            {val > 0 ? val : '-'}
                          </td>
                        )
                      })}
                      <td className="px-4 py-3 font-bold font-mono text-right bg-secondary/10">{totalAgent}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 🔹 TABELA DE CAMPANHAS ORIGINAL (CLICÁVEL) */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2"><Megaphone className="w-5 h-5 text-indigo-500" /> Histórico de Campanhas</CardTitle>
          <p className="text-sm text-muted-foreground">Clique em uma campanha para visualizar o relatório de entrega detalhado e exportar para CSV.</p>
        </CardHeader>
        <CardContent>
          {isCampaignsLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto border border-border/50 rounded-lg shadow-inner custom-scrollbar">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-secondary/50 text-muted-foreground border-b border-border/50">
                  <tr>
                    <th className="px-5 py-3 font-semibold tracking-wide">Campanha / Audiência</th>
                    <th className="px-5 py-3 font-semibold tracking-wide">Atendente / Disparador</th>
                    <th className="px-5 py-3 font-semibold tracking-wide">Criação</th>
                    <th className="px-5 py-3 font-semibold tracking-wide text-right">Processados</th>
                    <th className="px-5 py-3 font-semibold tracking-wide text-right">Lidas</th>
                    <th className="px-5 py-3 font-semibold tracking-wide text-right">Respondidas</th>
                    <th className="px-5 py-3 font-semibold tracking-wide text-right">Falhas</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {!campaignsData?.campaigns?.items || campaignsData.campaigns.items.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-muted-foreground bg-secondary/10">Nenhuma campanha encontrada neste período.</td>
                    </tr>
                  ) : (
                    campaignsData.campaigns.items.map((camp: any) => (
                      <tr 
                        key={camp.id} 
                        onClick={() => handleOpenCampaignReport(camp.id)}
                        className="hover:bg-secondary/40 transition-colors cursor-pointer group"
                      >
                        <td className="px-5 py-4 font-medium text-foreground max-w-[250px] truncate" title={camp.name}>{camp.name || 'N/A'}</td>
                        <td className="px-5 py-4 text-muted-foreground text-xs truncate max-w-[150px]">{getAgentName(camp)}</td>
                        <td className="px-5 py-4 text-muted-foreground text-xs">{formatDateTime(camp.created)}</td>
                        <td className="px-5 py-4 text-right font-mono font-medium">{camp.processed || 0}</td>
                        <td className="px-5 py-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-medium">{camp.read || 0}</td>
                        <td className="px-5 py-4 text-right font-mono text-blue-600 dark:text-blue-400 font-medium">{camp.replied || 0}</td>
                        <td className="px-5 py-4 text-right font-mono text-orange-600 dark:text-orange-400 font-medium">{camp.failed || 0}</td>
                        <td className="px-4 py-4 text-right"><ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-indigo-500 transition-colors ml-auto" /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🔹 MODAL COM RELATÓRIO DA CAMPANHA (FULL WIDTH) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="!max-w-[95vw] !w-[95vw] h-[90vh] flex flex-col gap-0 border-border bg-background shadow-2xl p-0 overflow-hidden">
          
          <DialogHeader className="p-6 pb-4 border-b border-border bg-card shrink-0 flex flex-row items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
                  <Megaphone className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                {campaignReport?.name || 'Detalhes da Campanha'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                ID da Campanha: <span className="font-mono text-xs px-2 py-0.5 bg-secondary rounded-md">{selectedCampaignId}</span>
              </p>
            </div>

            {!isReportLoading && campaignReport?.statusAudience?.length > 0 && (
              <Button onClick={exportToCSV} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Download className="w-4 h-4" /> Exportar CSV
              </Button>
            )}
          </DialogHeader>

          <div className="p-6 overflow-y-auto flex-1 bg-secondary/5 custom-scrollbar">
            {isReportLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-muted-foreground text-lg">Buscando entrega e conversões da campanha...</p>
              </div>
            ) : !campaignReport ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-lg">Não foi possível carregar os dados desta campanha.</div>
            ) : (
              <div className="space-y-6 max-w-[1400px] mx-auto">
                
                {/* 1. STATUS GERAL */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-medium">Status de Disparo</p>
                    <p className="text-lg font-bold text-foreground">{campaignReport.status || 'N/A'}</p>
                  </div>
                  <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-medium">Canal de Envio</p>
                    <p className="text-lg font-bold text-foreground">{campaignReport.channelType || 'N/A'}</p>
                  </div>
                  <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-medium">Data de Envio</p>
                    <p className="text-base font-semibold text-foreground">{formatDateTime(campaignReport.sendDate)}</p>
                  </div>
                  <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-medium">Volume da Audiência</p>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {totalProcessed} <span className="text-sm text-muted-foreground font-medium">contatos</span>
                    </p>
                  </div>
                </div>

                {/* 2. FUNIL DE CONVERSÃO */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card rounded-xl p-5 border border-border shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded">
                        <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Enviados (Processados)</p>
                    </div>
                    <div><span className="text-3xl font-bold">{totalProcessed}</span></div>
                    <div className="mt-3 h-2 w-full bg-blue-500 rounded-full opacity-80" />
                    <p className="text-xs text-muted-foreground mt-2 text-right">100% da audiência</p>
                  </div>

                  <div className="bg-card rounded-xl p-5 border border-border shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded">
                        <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Recebidos no Aparelho</p>
                    </div>
                    <div><span className="text-3xl font-bold">{totalReceived}</span></div>
                    <div className="mt-3 h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${receivedRate}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-right">{receivedRate}% dos enviados</p>
                  </div>

                  <div className="bg-card rounded-xl p-5 border border-border shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded">
                        <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Lidos pelo Usuário</p>
                    </div>
                    <div><span className="text-3xl font-bold">{totalRead}</span></div>
                    <div className="mt-3 h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${readRate}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-right">{readRate}% dos recebidos</p>
                  </div>
                </div>

                {/* 3. DETALHES DE ROTEAMENTO TÉCNICO */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-border bg-secondary/20">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Server className="w-4 h-4 text-indigo-500" />
                      Mapeamento de Roteamento BLIP
                    </h3>
                  </div>
                  <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><Server className="w-3 h-3"/> Master State</p>
                      <p className="font-mono text-sm text-foreground truncate" title={campaignReport.masterState}>{campaignReport.masterState || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><Waypoints className="w-3 h-3"/> Flow ID</p>
                      <p className="font-mono text-sm text-foreground truncate" title={campaignReport.flowId}>{campaignReport.flowId || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> State ID</p>
                      <p className="font-mono text-sm text-foreground truncate" title={campaignReport.stateId}>{campaignReport.stateId || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* 4. DETALHES DE ATENDIMENTO (APARECE APENAS SE FOR DESK) */}
                {isDeskCampaign && (
                  <div className="bg-card rounded-xl border border-blue-500/30 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10">
                      <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        Acionamento Ativo via Atendimento (Desk)
                      </h3>
                    </div>
                    <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-xs text-blue-600/70 dark:text-blue-400/70 uppercase tracking-wider mb-1 flex items-center gap-1"><FileText className="w-3 h-3"/> Message Template</p>
                        <p className="font-medium text-sm text-foreground truncate" title={campaignReport.messageTemplate}>{campaignReport.messageTemplate || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600/70 dark:text-blue-400/70 uppercase tracking-wider mb-1 flex items-center gap-1"><ArrowRightLeft className="w-3 h-3"/> Attendance Redirect</p>
                        <p className="font-medium text-sm text-foreground truncate" title={campaignReport.attendanceRedirect}>{campaignReport.attendanceRedirect || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600/70 dark:text-blue-400/70 uppercase tracking-wider mb-1 flex items-center gap-1"><UserCheck className="w-3 h-3"/> Campaign Sender</p>
                        <p className="font-medium text-sm text-foreground truncate" title={campaignReport.campaignSender}>{campaignReport.campaignSender || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. LISTA DE CONTATOS */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-border bg-secondary/20 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-500" />
                      Status Individual de Entrega
                    </h3>
                  </div>
                  
                  <div className="overflow-x-auto max-h-[500px]">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                      <thead className="bg-secondary/50 text-muted-foreground sticky top-0 backdrop-blur z-10 shadow-sm">
                        <tr>
                          <th className="px-6 py-4 font-semibold tracking-wide">Identificador (Telefone)</th>
                          <th className="px-6 py-4 font-semibold tracking-wide">Status de Entrega</th>
                          <th className="px-6 py-4 font-semibold tracking-wide text-right">Processado em</th>
                          <th className="px-6 py-4 font-semibold tracking-wide text-right">Recebido no Celular em</th>
                          <th className="px-6 py-4 font-semibold tracking-wide text-right">Lido pelo Usuário em</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {campaignReport.statusAudience?.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-base">Sem contatos processados nesta audiência.</td>
                          </tr>
                        ) : (
                          campaignReport.statusAudience?.map((audience: any, i: number) => {
                            let statusColor = "text-muted-foreground";
                            let StatusIcon = CheckCircle2;
                            
                            if (audience.status === "READ") { statusColor = "text-emerald-500"; StatusIcon = Eye; }
                            else if (audience.status === "REPLIED") { statusColor = "text-blue-500"; StatusIcon = Reply; }
                            else if (audience.status === "FAILED") { statusColor = "text-orange-500"; StatusIcon = XCircle; }
                            else if (audience.status === "RECEIVED") { statusColor = "text-indigo-500"; }

                            return (
                              <tr key={i} className="hover:bg-secondary/30 transition-colors">
                                <td className="px-6 py-4 font-mono text-sm text-foreground">
                                  {audience.recipientIdentity?.split('@')[0]}
                                </td>
                                <td className="px-6 py-4">
                                  <div className={`flex items-center gap-2 font-bold ${statusColor}`}>
                                    <StatusIcon className="w-4 h-4" />
                                    {audience.status}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-right text-muted-foreground">{audience.processed ? formatDateTime(audience.processed) : '-'}</td>
                                <td className="px-6 py-4 text-right text-muted-foreground">{audience.received ? formatDateTime(audience.received) : '-'}</td>
                                <td className="px-6 py-4 text-right font-medium text-foreground">{audience.read ? formatDateTime(audience.read) : '-'}</td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-border bg-card shrink-0 flex justify-end">
            <Button variant="outline" size="lg" onClick={() => setIsModalOpen(false)} className="px-8 font-semibold">
              Fechar Relatório
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}