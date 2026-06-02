import { useState, useEffect } from 'react';

export function useAttendanceDashboard(branchId: string, startDate: string, endDate: string) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAttendanceData = async () => {
      if (!branchId) return;
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('access_token') || '';
        const response = await fetch('/api/blip/an/attendance-dashboard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ branch_id: branchId, startDate, endDate })
        });

        const result = await response.json();

        if (!isMounted) return;

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || 'Erro ao carregar dados de atendimento');
        }
      } catch (err) {
        if (isMounted) setError('Falha de conexão com a API de atendimento');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAttendanceData();

    return () => {
      isMounted = false;
    };
  }, [branchId, startDate, endDate]);

  return { data, isLoading, error };
}