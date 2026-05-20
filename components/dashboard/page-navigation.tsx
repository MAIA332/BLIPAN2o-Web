'use client'

import { cn } from '@/lib/utils'
import { LayoutGrid, TrendingUp, Activity, Globe, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ChartPage } from '@/lib/mock-data'

interface PageNavigationProps {
  pages: ChartPage[]
  currentPageId: string
  onPageChange: (pageId: string) => void
}

const pageIcons: Record<string, React.ReactNode> = {
  'page-1': <LayoutGrid className="h-4 w-4" />,
  'page-2': <TrendingUp className="h-4 w-4" />,
  'page-3': <Activity className="h-4 w-4" />,
  'page-4': <Globe className="h-4 w-4" />,
}

export function PageNavigation({
  pages,
  currentPageId,
  onPageChange,
}: PageNavigationProps) {
  return (
    <div className="flex items-center gap-1 border-t border-border bg-sidebar px-4 py-2">
      {pages.map((page) => (
        <Button
          key={page.id}
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 h-9 rounded-md transition-colors',
            currentPageId === page.id
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          {pageIcons[page.id] || <LayoutGrid className="h-4 w-4" />}
          <span>{page.name}</span>
        </Button>
      ))}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 ml-1 text-primary hover:bg-primary/10"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
