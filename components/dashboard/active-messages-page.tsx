'use client'

import { Loader2 } from 'lucide-react'
import { useActiveMessages } from '@/hooks/useActiveMessages'
import { MetricsDashboard } from '../MetricsDashboard'
import { AnalyticsTables } from '../AnalyticsTables'
import { CampaignsHistory } from '../CampaignsHistory'
import { CampaignReportModal } from '../CampaignReportModal'
import { PeriodDistributionChart } from '../PeriodDistributionChart'

interface ActiveMessagesPageProps {
  branchId: string
  startDate: string
  endDate: string
}

export function ActiveMessagesPage({ branchId, startDate, endDate }: ActiveMessagesPageProps) {
  const { desk, campaigns, modal } = useActiveMessages(branchId, startDate, endDate);

  if (desk.isLoading || !desk.data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="font-medium text-center px-4 max-w-sm">{desk.loadingMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <MetricsDashboard deskData={desk.data} />

      <PeriodDistributionChart campaignsData={campaigns.data} />
      
      <AnalyticsTables deskData={desk.data} />
      
      <CampaignsHistory 
        data={campaigns.data} 
        isLoading={campaigns.isLoading} 
        onOpenReport={modal.openReport} 
      />

      <CampaignReportModal 
        isOpen={modal.isOpen} 
        onOpenChange={modal.setIsOpen}
        report={modal.report}
        isLoading={modal.isLoading}
        campaignId={modal.campaignId}
      />
    </div>
  )
}