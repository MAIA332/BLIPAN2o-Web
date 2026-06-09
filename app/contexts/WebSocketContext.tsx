'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface WebSocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
  sendMessage: (event: string, payload: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({} as WebSocketContextType);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Variáveis locais para o ciclo de vida deste escopo
    let socket: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
      socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        // Ignora eventos de sockets que já foram desmontados pelo React
        if (socketRef.current !== socket) return;

        console.log('[WebSocket] Conectado ao servidor');
        setIsConnected(true);

        const token = localStorage.getItem('access_token'); 
        if (token) {
          socket!.send(JSON.stringify({
            event: 'auth',
            payload: { access_token: token }
          }));
        }
      };

      socket.onmessage = (event) => {
        if (socketRef.current !== socket) return;

        try {
          const data = JSON.parse(event.data);
          handleServerEvent(data);
        } catch (error) {
          console.error('[WebSocket] Erro ao fazer parse da mensagem:', error);
        }
      };

      socket.onclose = () => {
        if (socketRef.current !== socket) return;

        setIsConnected(false);
        console.log('[WebSocket] Desconectado. Tentando reconectar em 3s...');
        
        // Reconecta automaticamente
        reconnectTimeout = setTimeout(connect, 3000);
      };

      socket.onerror = (error) => {
        if (socketRef.current !== socket) return;
        console.error('[WebSocket] Erro na comunicação com o servidor.');
      };
    };

    // Central de roteamento de eventos recebidos do Backend
    const handleServerEvent = (message: any) => {
      const { event, data } = message;

      switch (event) {
        case 'auth_success':
          console.log('[WebSocket] Autenticação confirmada pelo backend.');
          break;

        case 'report_ready':
          toast.success('Relatório Concluído!', {
            description: data?.message || 'Seus dados já estão prontos para visualização.',
            duration: 5000,
            action: {
              label: 'Atualizar',
              onClick: () => window.location.reload() 
            }
          });
          break;

        case 'report_error':
          toast.error('Falha no Processamento', {
            description: data?.message || 'Não foi possível gerar o seu relatório.',
            duration: 7000,
          });
          break;

        default:
          console.log('[WebSocket] Evento não mapeado recebido:', message);
      }
    };

    // Inicia a conexão
    connect();

    // Função de Limpeza (Executada quando a página muda ou o HMR atualiza o código)
    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      
      if (socket) {
        // Ao zerar a ref ANTES de fechar, o onclose nativo percebe a diferença
        // e morre silenciosamente, impedindo o loop infinito.
        socketRef.current = null;
        socket.close();
      }
    };
  }, []);

  const sendMessage = (event: string, payload: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ event, payload }));
    } else {
      console.warn('[WebSocket] Tentativa de envio falhou. Socket não está aberto.');
    }
  };

  return (
    <WebSocketContext.Provider value={{ socket: socketRef.current, isConnected, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);