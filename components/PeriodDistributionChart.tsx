import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts'

interface PeriodDistributionChartProps {
    campaignsData: any;
}

export function PeriodDistributionChart({ campaignsData }: PeriodDistributionChartProps) {
    // Lógica para agrupar os disparos processados pelas 24 horas do dia
    const chartData = useMemo(() => {
        // 1. Inicializa um array com as 24 horas (00:00 até 23:00)
        const hours = Array.from({ length: 24 }, (_, i) => ({
            hour: `${i.toString().padStart(2, '0')}:00`,
            envios: 0
        }));

        // 2. Verifica se existem dados de campanhas para iterar
        if (!campaignsData?.campaigns?.items) return hours;

        // 3. Itera sobre as campanhas e soma o volume processado no respectivo horário
        campaignsData.campaigns.items.forEach((camp: any) => {
            if (camp.created) {
                const date = new Date(camp.created);
                const hourIndex = date.getHours(); // Retorna de 0 a 23

                // Soma a quantidade de contatos processados (ou fallback para 1 caso seja apenas contagem de campanhas)
                hours[hourIndex].envios += (camp.processed || 0);
            }
        });

        return hours;
    }, [campaignsData]);

    return (
        <Card className="bg-card border-border shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-sky-500" />
                    Distribuição de Envios por Período
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Volume total de mensagens disparadas agrupadas por hora do dia.
                </p>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: -20, bottom: 60 }}
                        >
                            {/* Linhas de grade horizontais tracejadas, igual à imagem */}
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />

                            <XAxis
                                dataKey="hour"
                                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                                axisLine={true}
                                tickLine={false}
                                dy={15}
                                angle={-45}
                                textAnchor="end"
                            />

                            <YAxis
                                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                                axisLine={true}
                                tickLine={false}
                            />

                            <Tooltip
                                cursor={{ fill: 'var(--secondary)' }}
                                contentStyle={{ backgroundColor: 'var(--popover)', borderRadius: '8px', border: '1px solid var(--border)' }}
                                itemStyle={{ color: 'var(--foreground)' }}
                                labelStyle={{ color: 'var(--foreground)' }}
                                formatter={(value: number) => [`${value} disparos`, 'Quantidade']}
                                labelFormatter={(label) => `Horário: ${label}`}
                            />

                            <Bar dataKey="envios" name="Quantidade de Envios" radius={[2, 2, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill="#87CEEB" // Azul claro similar à referência
                                        stroke="#ffffff" // Borda escura similar à referência
                                        strokeWidth={1}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}