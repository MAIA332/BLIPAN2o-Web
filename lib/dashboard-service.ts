// lib/dashboard-service.ts

interface FetchDashboardDataParams {
  branchId: string
  token: string
  startDate: string
  endDate: string
}

export const fetchDashboardData = async ({
  branchId,
  token,
  startDate,
  endDate,
}: FetchDashboardDataParams) => {
  const payload = {
    branch_id: branchId,
    startDate,
    endDate,
  }

  // Fazemos todas as requisições em paralelo
  const [trackingsRes, occurrencesRes, contactsDashboardRes] = await Promise.all([
    fetch('/api/blip/an/trackings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }),
    fetch('/api/blip/an/block-occurrences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }),
    fetch('/api/blip/an/contacts-dashboard', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }),
  ])

  if (!trackingsRes.ok || !occurrencesRes.ok || !contactsDashboardRes.ok) {
    throw new Error('Erro ao buscar dados da dashboard')
  }

  return {
    trackings: await trackingsRes.json(),
    occurrences: await occurrencesRes.json(),
    contactsDashboard: await contactsDashboardRes.json(),
  }
}