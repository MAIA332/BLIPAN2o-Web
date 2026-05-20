'use client'

import { Building2, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import type { Tenant } from '@/lib/mock-data'

interface TenantSelectorProps {
  tenants: Tenant[]
  currentTenant: Tenant
  onTenantChange: (tenant: Tenant) => void
}

export function TenantSelector({
  tenants,
  currentTenant,
  onTenantChange,
}: TenantSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-secondary border-border hover:bg-muted"
        >
          <Building2 className="h-4 w-4 text-primary" />
          <span className="text-foreground">{currentTenant.name}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {tenants.map((tenant) => (
          <DropdownMenuItem
            key={tenant.id}
            onClick={() => onTenantChange(tenant)}
            className={
              tenant.id === currentTenant.id
                ? 'bg-primary/10 text-primary'
                : ''
            }
          >
            <Building2 className="mr-2 h-4 w-4" />
            {tenant.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
