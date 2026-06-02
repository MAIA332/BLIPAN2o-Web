import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Megaphone, BarChart3, PieChart as PieChartIcon } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const PIE_COLORS = ['#93c5fd', '#fca5a5', '#86efac', '#fdba74', '#c4b5fd', '#f9a8d4', '#fde047', '#d8b4fe', '#94a3b8'];

export function MetricsDashboard({ deskData }: { deskData: any }) {
  const totalDisparos = deskData.taxa_conversao_por_template?.reduce((acc: number, curr: any) => acc + curr.processados, 0) || 0;
  const conversionData = deskData.taxa_conversao_por_template || [];
  const agentChartData = deskData.distribuicao_por_atendente?.map((a: any) => ({ name: a.atendente.split('@')[0], value: a.disparos })) || [];
  const templateChartData = deskData.distribuicao_por_template?.map((t: any) => ({ name: t.template, value: t.disparos })) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Total de Disparos */}
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

        {/* Card 2: Campanhas Desk */}
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

      {/* Gráfico 1: Funil de Conversão */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" /> 
            Funil de Conversão por Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="template" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} angle={-15} textAnchor="end" />
                <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'var(--secondary)' }} 
                  contentStyle={{ backgroundColor: 'var(--popover)', borderRadius: '8px', border: '1px solid var(--border)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                  labelStyle={{ color: 'var(--foreground)' }}
                />
                <Legend verticalAlign="top" height={36}/>
                <Bar dataKey="processados" name="Enviados" fill="#93c5fd" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="visualizados" name="Lidos" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="respondidos" name="Respondidos" fill="#818cf8" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos Pie: Atendentes & Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-blue-500"/> Volume por Atendente
            </CardTitle>
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
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--popover)', borderRadius: '8px', border: '1px solid var(--border)' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                    labelStyle={{ color: 'var(--foreground)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <span className="text-muted-foreground mt-10">Dados insuficientes.</span>}
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-emerald-500"/> Divisão de Templates
            </CardTitle>
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
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--popover)', borderRadius: '8px', border: '1px solid var(--border)' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                    labelStyle={{ color: 'var(--foreground)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <span className="text-muted-foreground mt-10">Dados insuficientes.</span>}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}