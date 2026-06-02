'use client'

import { useEffect, useState } from 'react'

import {
  Filter,
  Search,
  Check,
  X,
  ChevronDown,
} from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

import { cn } from '@/lib/utils'

interface FilterPanelProps {
  filters: any[]
  activeFilters: Record<string, string[]>
  onFilterChange: (field: string, values: string[]) => void
}

export function FilterPanel({
  filters,
  activeFilters,
  onFilterChange,
}: FilterPanelProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [openSections, setOpenSections] = useState<string[]>([])

  /*
   |--------------------------------------------------------------------------
   | ABRIR SEÇÕES AUTOMATICAMENTE
   |--------------------------------------------------------------------------
   */

  useEffect(() => {
    setOpenSections(filters.map((f) => f.field))
  }, [filters])

  /*
   |--------------------------------------------------------------------------
   | TOGGLE SECTION
   |--------------------------------------------------------------------------
   */

  const toggleSection = (field: string) => {
    setOpenSections((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    )
  }

  /*
   |--------------------------------------------------------------------------
   | TOGGLE FILTER
   |--------------------------------------------------------------------------
   */

  const toggleFilter = (field: string, option: string) => {
    const current = activeFilters[field] || []

    const newValues = current.includes(option)
      ? current.filter((v) => v !== option)
      : [...current, option]

    onFilterChange(field, newValues)
  }

  /*
   |--------------------------------------------------------------------------
   | CLEAR FILTER
   |--------------------------------------------------------------------------
   */

  const clearFilter = (field: string) => {
    onFilterChange(field, [])
  }

  /*
   |--------------------------------------------------------------------------
   | SELECT ALL
   |--------------------------------------------------------------------------
   */

  const selectAll = (field: string, options: string[]) => {
    onFilterChange(field, options)
  }

  const totalActiveFilters = Object.values(activeFilters).flat().length

  return (
    <div className="w-72 bg-card border-l border-border flex flex-col min-h-0 flex-shrink-0">
      {/* HEADER */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">Filtros</span>
          </div>

          {totalActiveFilters > 0 && (
            <Badge
              variant="secondary"
              className="bg-primary/20 text-primary"
            >
              {totalActiveFilters}
            </Badge>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-input border-border"
          />
        </div>
      </div>

      {/* FILTROS */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-4 space-y-3">
          {filters.length === 0 && (
            <div className="text-sm text-muted-foreground">
              Selecione um gráfico
            </div>
          )}

          {filters.map((filter) => {
            // Trava extra de segurança: Ignora se vier a action
            if (filter.field === 'action') return null

            // Filtra as opções baseada na pesquisa, e depois LIMITA em 100
            // para não congelar o DOM criando milhares de HTML Checkboxes
            const filteredOptions = filter.options
              .filter((opt: string) =>
                opt.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .slice(0, 100) 

            const activeCount = (activeFilters[filter.field] || []).length
            const isOpen = openSections.includes(filter.field)

            return (
              <Collapsible
                key={filter.field}
                open={isOpen}
                onOpenChange={() => toggleSection(filter.field)}
              >
                <div className="rounded-lg bg-muted/50 overflow-hidden border border-border">
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {filter.label}
                      </span>

                      {activeCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-primary/20 text-primary text-xs"
                        >
                          {activeCount}
                        </Badge>
                      )}
                    </div>

                    <ChevronDown
                      className={cn(
                        'h-4 w-4 text-muted-foreground transition-transform',
                        isOpen && 'rotate-180'
                      )}
                    />
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="px-3 pb-3 space-y-1">
                      <div className="flex items-center gap-2 pb-2 border-b border-border mb-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => selectAll(filter.field, filter.options)}
                          className="h-7 text-xs"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Tudo
                        </Button>

                        {activeCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearFilter(filter.field)}
                            className="h-7 text-xs text-destructive"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Limpar
                          </Button>
                        )}
                      </div>

                      {filteredOptions.map((option: string) => (
                        <label
                          key={option}
                          className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted cursor-pointer group"
                        >
                          <Checkbox
                            checked={(activeFilters[filter.field] || []).includes(option)}
                            onCheckedChange={() => toggleFilter(filter.field, option)}
                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />

                          <span className="text-sm text-foreground group-hover:text-foreground/90 flex-1 truncate" title={option}>
                            {option}
                          </span>
                        </label>
                      ))}

                      {filter.options.length > 100 && filteredOptions.length === 100 && (
                        <div className="text-[10px] text-muted-foreground text-center mt-2 pt-1 border-t border-border/50 italic">
                          Muitos resultados. Use a pesquisa.
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}