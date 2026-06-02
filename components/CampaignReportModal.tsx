import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { 
  Loader2, Megaphone, Download, Send, Smartphone, Eye, 
  Server, Waypoints, MapPin, UserCheck, FileText, 
  ArrowRightLeft, Users, CheckCircle2, XCircle, Reply 
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils';

interface CampaignReportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  report: any;
  isLoading: boolean;
  campaignId: string | null;
}

export function CampaignReportModal({ isOpen, onOpenChange, report, isLoading, campaignId }: CampaignReportModalProps) {
  
  const exportToCSV = () => {
    if (!report?.statusAudience?.length) return;
    const headers = ['Identificador', 'Status', 'Data de Processamento', 'Recebido em', 'Lido em'];
    const rows = report.statusAudience.map((audience: any) => [
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
    const safeName = (report.name || 'relatorio').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute('href', url);
    link.setAttribute('download', `${safeName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalProcessed = report?.statusAudience?.length || 0;
  const totalReceived = report?.statusAudience?.filter((a: any) => a.received || ['RECEIVED', 'READ', 'REPLIED'].includes(a.status)).length || 0;
  const totalRead = report?.statusAudience?.filter((a: any) => a.read || ['READ', 'REPLIED'].includes(a.status)).length || 0;
  const receivedRate = totalProcessed > 0 ? ((totalReceived / totalProcessed) * 100).toFixed(1) : '0';
  const readRate = totalReceived > 0 ? ((totalRead / totalReceived) * 100).toFixed(1) : '0';
  const isDeskCampaign = report?.name?.toLowerCase().includes('desk') || !!report?.campaignSender;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[95vw] !w-[95vw] h-[90vh] flex flex-col gap-0 border-border bg-background shadow-2xl p-0 overflow-hidden">
        
        <DialogHeader className="p-6 pb-4 border-b border-border bg-card shrink-0 flex flex-row items-start justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
                <Megaphone className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              {report?.name || 'Detalhes da Campanha'}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
              ID da Campanha: <span className="font-mono text-xs px-2 py-0.5 bg-secondary rounded-md">{campaignId}</span>
            </p>
          </div>

          {!isLoading && report?.statusAudience?.length > 0 && (
            <Button onClick={exportToCSV} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Download className="w-4 h-4" /> Exportar CSV
            </Button>
          )}
        </DialogHeader>

        <div className="p-6 overflow-y-auto flex-1 bg-secondary/5 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
              <p className="text-muted-foreground text-lg">Buscando entrega e conversões da campanha...</p>
            </div>
          ) : !report ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-lg">Não foi possível carregar os dados desta campanha.</div>
          ) : (
            <div className="space-y-6 max-w-[1400px] mx-auto">
              
              {/* STATUS GERAL */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-medium">Status de Disparo</p>
                  <p className="text-lg font-bold text-foreground">{report.status || 'N/A'}</p>
                </div>
                <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-medium">Canal de Envio</p>
                  <p className="text-lg font-bold text-foreground">{report.channelType || 'N/A'}</p>
                </div>
                <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-medium">Data de Envio</p>
                  <p className="text-base font-semibold text-foreground">{formatDateTime(report.sendDate)}</p>
                </div>
                <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-medium">Volume da Audiência</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {totalProcessed} <span className="text-sm text-muted-foreground font-medium">contatos</span>
                  </p>
                </div>
              </div>

              {/* FUNIL DE CONVERSÃO */}
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

              {/* ROTEAMENTO TÉCNICO */}
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
                    <p className="font-mono text-sm text-foreground truncate" title={report.masterState}>{report.masterState || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><Waypoints className="w-3 h-3"/> Flow ID</p>
                    <p className="font-mono text-sm text-foreground truncate" title={report.flowId}>{report.flowId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> State ID</p>
                    <p className="font-mono text-sm text-foreground truncate" title={report.stateId}>{report.stateId || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* DETALHES DESK */}
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
                      <p className="font-medium text-sm text-foreground truncate" title={report.messageTemplate}>{report.messageTemplate || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600/70 dark:text-blue-400/70 uppercase tracking-wider mb-1 flex items-center gap-1"><ArrowRightLeft className="w-3 h-3"/> Attendance Redirect</p>
                      <p className="font-medium text-sm text-foreground truncate" title={report.attendanceRedirect}>{report.attendanceRedirect || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600/70 dark:text-blue-400/70 uppercase tracking-wider mb-1 flex items-center gap-1"><UserCheck className="w-3 h-3"/> Campaign Sender</p>
                      <p className="font-medium text-sm text-foreground truncate" title={report.campaignSender}>{report.campaignSender || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* LISTA DE CONTATOS */}
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
                      {report.statusAudience?.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-base">Sem contatos processados nesta audiência.</td>
                        </tr>
                      ) : (
                        report.statusAudience?.map((audience: any, i: number) => {
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
          <Button variant="outline" size="lg" onClick={() => onOpenChange(false)} className="px-8 font-semibold">
            Fechar Relatório
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}