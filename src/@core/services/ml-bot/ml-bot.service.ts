import axios from 'axios';
import type { ChatMessage } from './types';

export const mlBotService = () => {
  const botApi = axios.create({
    baseURL: 'http://localhost:8000/api',
    timeout: 5000,
    headers: { 'Content-Type': 'application/json' },
  });

  const sendMessage = async (message: ChatMessage['message']): Promise<string> => {
    try {
      const response = await botApi.post(`/ask_question`, { question: message });

      return response.data.response; // Retorna os dados corretamente
    }
    catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);

    const errorMessage = error?.response?.data?.message || error?.message || 'Erro desconhecido';

    throw new Error(`Erro ao processar a resposta do bot: ${errorMessage}`);
    }
  };

  return {
    sendMessage,
  };
};
