'use client'

import { Database, ChevronDown, Hash, Type, Calendar } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface DataField {
  id: string
  label: string
  type: 'dimension' | 'measure'
}

interface DataPanelProps {
  fields: DataField[]
  selectedFields: string[]
  onFieldToggle: (fieldId: string) => void
}

const dataSets = [
  {
    id: 'block_occurrences',
    name: 'Block ocurrences',
    fields: ['occurrences_count', 'state_id', 'state_name'],
  },
  {
    id: 'trackings_data',
    name: 'Trackings data',
    fields: ['action', 'category', 'count', 'Name', 'storageDate'],
  },
]

export function DataPanel({
  fields,
  selectedFields,
  onFieldToggle,
}: DataPanelProps) {
  const [openSections, setOpenSections] = useState(['block_occurrences', 'trackings_data'])

  const toggleSection = (id: string) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const getFieldIcon = (field: DataField) => {
    if (field.type === 'measure') {
      return <Hash className="h-3 w-3 text-chart-3" />
    }
    if (field.id.toLowerCase().includes('date')) {
      return <Calendar className="h-3 w-3 text-chart-1" />
    }
    return <Type className="h-3 w-3 text-muted-foreground" />
  }

  return (
    <div className="w-64 bg-card border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">Dados</span>
        </div>
      </div>

      {/* Data Sets */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {dataSets.map((dataSet) => {
            const dataSetFields = fields.filter((f) =>
              dataSet.fields.includes(f.id)
            )
            const isOpen = openSections.includes(dataSet.id)

            return (
              <Collapsible
                key={dataSet.id}
                open={isOpen}
                onOpenChange={() => toggleSection(dataSet.id)}
              >
                <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded-md transition-colors">
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-muted-foreground transition-transform',
                      isOpen && 'rotate-0',
                      !isOpen && '-rotate-90'
                    )}
                  />
                  <Database className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {dataSet.name}
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-6 space-y-0.5 py-1">
                    {dataSetFields.map((field) => (
                      <label
                        key={field.id}
                        className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted cursor-pointer group"
                      >
                        <Checkbox
                          checked={selectedFields.includes(field.id)}
                          onCheckedChange={() => onFieldToggle(field.id)}
                          className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        {getFieldIcon(field)}
                        <span className="text-sm text-foreground group-hover:text-foreground/90 truncate">
                          {field.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
      </ScrollArea>

      {/* Axis Configuration */}
      <div className="p-4 border-t border-border space-y-3">
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Eixo X
          </span>
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <Type className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm text-foreground">action</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Eixo Y
          </span>
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <Hash className="h-3 w-3 text-chart-3" />
            <span className="text-sm text-foreground">Soma de count</span>
          </div>
        </div>
      </div>
    </div>
  )
}
