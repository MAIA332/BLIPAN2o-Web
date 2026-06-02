import { useState, useEffect } from 'react';

export function useActiveMessages(branchId: string, startDate: string, endDate: string) {
  // Estados Desk
  const [deskData, setDeskData] = useState<any>(null);
  const [isDeskLoading, setIsDeskLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Iniciando extração de métricas...");

  // Estados Campaigns
  const [campaignsData, setCampaignsData] = useState<any>(null);
  const [isCampaignsLoading, setIsCampaignsLoading] = useState(false);

  // Estados Modal
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [campaignReport, setCampaignReport] = useState<any>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Desk (Polling)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const fetchDeskMetrics = async () => {
      if (!branchId) return;
      setIsDeskLoading(true);
      
      try {
        const token = localStorage.getItem('access_token') || '';
        const response = await fetch('/api/blip/an/desk-active-messages-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ branch_id: branchId, startDate, endDate })
        });

        const result = await response.json();
        if (!isMounted) return;

        if (result.success) {
          if (result.status === 'processing') {
            setLoadingMessage("Volume extenso de dados. Compilando as métricas do Desk em segundo plano...");
            timeoutId = setTimeout(fetchDeskMetrics, 15000);
          } else {
            setDeskData(result.data || result);
            setIsDeskLoading(false);
          }
        } else {
          console.error("Erro na API Desk:", result.message);
          setIsDeskLoading(false);
        }
      } catch (error) {
        console.error("Erro ao carregar métricas do Desk:", error);
        if (isMounted) setIsDeskLoading(false);
      }
    };

    fetchDeskMetrics();
    return () => { isMounted = false; if (timeoutId) clearTimeout(timeoutId); };
  }, [branchId, startDate, endDate]);

  // Fetch Campaigns History
  useEffect(() => {
    const fetchCampaignsHistory = async () => {
      if (!branchId) return;
      setIsCampaignsLoading(true);
      try {
        const token = localStorage.getItem('access_token') || '';
        const response = await fetch('/api/blip/an/active-messages-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ branch_id: branchId, startDate, endDate })
        });
        const result = await response.json();
        if (result.success) setCampaignsData(result.data);
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      } finally {
        setIsCampaignsLoading(false);
      }
    };
    fetchCampaignsHistory();
  }, [branchId, startDate, endDate]);

  // Modal Methods
  const handleOpenReport = async (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setIsModalOpen(true);
    setIsReportLoading(true);
    setCampaignReport(null);

    try {
      const token = localStorage.getItem('access_token') || '';
      const response = await fetch('/api/blip/an/campaign-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ branch_id: branchId, campaign_id: campaignId })
      });
      const result = await response.json();
      if (result.success) setCampaignReport(result.data);
    } catch (error) {
      console.error("Erro ao carregar relatório:", error);
    } finally {
      setIsReportLoading(false);
    }
  };

  return {
    desk: { data: deskData, isLoading: isDeskLoading, loadingMessage },
    campaigns: { data: campaignsData, isLoading: isCampaignsLoading },
    modal: { 
      isOpen: isModalOpen, setIsOpen: setIsModalOpen, 
      report: campaignReport, isLoading: isReportLoading, 
      campaignId: selectedCampaignId, openReport: handleOpenReport 
    }
  };
}