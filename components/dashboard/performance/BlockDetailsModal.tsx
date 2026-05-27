'use client'

import { useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface BlockDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  blockName: string
  allTrackings: any // rawData.trackings.data
}

export function BlockDetailsModal({ isOpen, onClose, blockName, allTrackings }: BlockDetailsModalProps) {
  
  const chartData = useMemo(() => {
    if (!allTrackings || !blockName) return [];

    // Lógica robusta de matching:
    // Pega o nome do bloco e compara se ele está contido na categoria do tracking
    const relatedTrackings = Object.entries(allTrackings).filter(([category]) => {
      // Normaliza ambos para garantir o match
      const normalizedCategory = category.toLowerCase();
      const normalizedBlock = blockName.toLowerCase();
      
      // Verifica se o nome do bloco está dentro da categoria
      // Ex: "1.0 - Initial menu" está contido em "main 1.0 - Initial menu all inputs"
      return normalizedCategory.includes(normalizedBlock);
    });

    console.log("DEBUG: Bloco:", blockName, "Trackings Relacionados:", relatedTrackings);

    // Consolida as ações
    const consolidated = relatedTrackings.reduce((acc: any, [_, items]: any) => {
      if (Array.isArray(items)) {
        items.forEach((item: any) => {
          const action = item.action || 'Desconhecido';
          acc[action] = (acc[action] || 0) + (item.count || 0);
        });
      }
      return acc;
    }, {});

    return Object.entries(consolidated).map(([name, value]) => ({ name, value }));
  }, [allTrackings, blockName]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Inputs do Bloco: {blockName}</DialogTitle>
        </DialogHeader>
        <div className="h-[300px] w-full mt-4">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Nenhum dado de input encontrado para este bloco.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}