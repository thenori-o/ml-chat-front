import type { ChatMessage } from './types';
import axios from '@axios';

export const mlBotService = () => {
  const mlHost = 'localhost:8000';

  const sendMessage = async (message: ChatMessage['message']): Promise<string> => {
    try {
      const response = await axios.post(`${mlHost}/ask_question`, { question: message });

      return response.data; // Retorna os dados corretamente
    }
    catch (error) {
      console.error('Erro ao enviar mensagem:', error);

      return 'Erro ao processar a resposta do bot'; // Retorno seguro para evitar erro de undefined
    }
  };

  return {
    sendMessage,
  };
};
