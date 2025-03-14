import axios from '@axios';
import type { ChatMessage } from './types';

export const mlBotService = () => {
  const mlHost = 'localhost:8000';

  const sendMessage = async (message: ChatMessage['message']): Promise<string> => {
    try {
      const response = await axios.post(`${mlHost}/ask_question`, { question: message });

      return response.data; // Retorna os dados corretamente
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
