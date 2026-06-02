import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Megaphone, Loader2, ChevronRight } from 'lucide-react'
import { formatDateTime, getAgentName } from '@/lib/utils'

interface CampaignsHistoryProps {
  data: any;
  isLoading: boolean;
  onOpenReport: (campaignId: string) => void;
}

export function CampaignsHistory({ data, isLoading, onOpenReport }: CampaignsHistoryProps) {
  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-indigo-500" /> 
          Histórico de Campanhas
        </CardTitle>
        <p className="text-sm text-muted-foreground">Clique em uma campanha para visualizar o relatório de entrega detalhado e exportar para CSV.</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
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
                {!data?.campaigns?.items || data.campaigns.items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-muted-foreground bg-secondary/10">Nenhuma campanha encontrada neste período.</td>
                  </tr>
                ) : (
                  data.campaigns.items.map((camp: any) => (
                    <tr 
                      key={camp.id} 
                      onClick={() => onOpenReport(camp.id)}
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
  )
}