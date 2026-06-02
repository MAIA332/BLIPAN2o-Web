import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDateTime = (isoString: string) => {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleDateString('pt-BR', { 
    day: '2-digit', month: '2-digit', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  });
};

export const getAgentName = (c: any) => {
  if (c.campaignSender) return c.campaignSender.split('@')[0];
  if (c.attendanceRedirect) return c.attendanceRedirect.split('@')[0];
  if (c.name?.toLowerCase().includes('desk')) return 'Desk (Atendente)';
  return 'Bot (Automático)';
};