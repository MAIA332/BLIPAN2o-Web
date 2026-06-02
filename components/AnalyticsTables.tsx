import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRightLeft, UserCheck } from 'lucide-react'

interface AnalyticsTablesProps {
  deskData: any;
}

export function AnalyticsTables({ deskData }: AnalyticsTablesProps) {
  const conversionData = deskData.taxa_conversao_por_template || [];
  const topTemplates = conversionData.map((t: any) => t.template);

  return (
    <div className="space-y-6">
      {/* 🔹 TABELA DE CONVERSÃO DETALHADA */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-emerald-500" /> 
            Tabela Analítica de Templates
          </CardTitle>
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
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-500" /> 
            Disparos (Atendente x Template)
          </CardTitle>
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
    </div>
  )
}