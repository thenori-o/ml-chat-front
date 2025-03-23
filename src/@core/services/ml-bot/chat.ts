import mock from '@/@fake-db/mock';
import { genId } from '@/@fake-db/utils';
import avatar1 from '@images/avatars/avatar-1.png';
import profile2 from '@images/avatars/profile-2.png';
import { mlBotService } from './ml-bot.service';
import type { Chat, ChatDocument, ChatDocumentWithChat, ChatMessage, ChatUser } from './types.d';

const dayBeforePreviousDay = new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 2);

interface Database {
  profileUser: ChatUser & {
    settings: {
      isTwoStepAuthVerificationEnabled: boolean
      isNotificationsOn: boolean
    }
  },
  mlBotUser: ChatUser & {
      settings: {
        isTwoStepAuthVerificationEnabled: boolean
        isNotificationsOn: boolean
      }
    },
  documents: ChatDocument[]
  chats: Chat[]
}

const database: Database = {
  profileUser: {
    id: 11,
    avatar: avatar1,
    fullName: 'John Doe',
    role: 'admin',
    about:
      'Dessert chocolate cake lemon drops jujubes. Biscuit cupcake ice cream bear claw brownie marshmallow.',
    status: 'online',
    settings: {
      isTwoStepAuthVerificationEnabled: true,
      isNotificationsOn: false,
    },
  },
  mlBotUser: {
    id: 2,
    avatar: profile2,
    fullName: 'ML Bot',
    role: 'bot',
    about:
      'Bot construído com um modelo de aprendizado de máquina de larga escala (LLM)',
    status: 'online',
    settings: {
      isTwoStepAuthVerificationEnabled: true,
      isNotificationsOn: false,
    },
  },
  documents: [
    {
      id: 1,
      fullName: "Renovacao_CNH_Protocolo.pdf",
      role: "Habilitação",
      about: "Protocolo de solicitação de renovação da CNH",
      avatar: "",
      status: "offline"
    },
    {
      id: 2,
      fullName: "CRLV_2024.pdf",
      role: "Licenciamento",
      about: "Certificado de Registro e Licenciamento do Veículo atualizado",
      avatar: "",
      status: "offline"
    },
    {
      id: 3,
      fullName: "Multa_Recorrencia.pdf",
      role: "Multas",
      about: "Documento de recurso para multa de trânsito",
      avatar: "",
      status: "offline"
    },
    {
      id: 4,
      fullName: "Auto_Infração.pdf",
      role: "Infração",
      about: "Cópia do auto de infração de trânsito",
      avatar: "",
      status: "offline"
    },
    {
      id: 5,
      fullName: "Laudo_Vistoria.pdf",
      role: "Vistoria",
      about: "Laudo de vistoria veicular emitido pelo Detran",
      avatar: "",
      status: "offline"
    },
  ],
  chats: [
    {
      id: 1,
      documentId: 1,
      unseenMsgs: 0,
      messages: [
        {
          message: "Oi",
          time: "Thu Mar 21 2025 08:30:00 GMT+0000 (GMT)",
          senderId: 11,
          feedback: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          message: "Olá, como posso te ajudar com a renovação da sua CNH?",
          time: "Thu Mar 21 2025 08:31:15 GMT+0000 (GMT)",
          senderId: 2,
          feedback: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          message: "Eu preciso saber os documentos necessários para a renovação da minha CNH.",
          time: "Thu Mar 21 2025 08:32:10 GMT+0000 (GMT)",
          senderId: 11,
          feedback: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          message: "Os documentos necessários geralmente incluem o CPF, RG, comprovante de residência e a CNH atual. Você tem todos esses documentos?",
          time: "Thu Mar 21 2025 08:33:00 GMT+0000 (GMT)",
          senderId: 2,
          feedback: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          message: "Sim, tenho todos os documentos. O que mais preciso fazer?",
          time: "Thu Mar 21 2025 08:33:45 GMT+0000 (GMT)",
          senderId: 11,
          feedback: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          message: "Você precisará agendar uma avaliação médica, se ainda não tiver feito. Após isso, podemos seguir com a solicitação de renovação.",
          time: "Thu Mar 21 2025 08:34:30 GMT+0000 (GMT)",
          senderId: 2,
          feedback: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          message: "Entendido! Vou agendar a avaliação e volto em breve.",
          time: "Thu Mar 21 2025 08:35:15 GMT+0000 (GMT)",
          senderId: 11,
          feedback: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        }
      ]
    }    
  ],
};

// ------------------------------------------------
// GET: Return Chats Documents and Documents
// ------------------------------------------------
mock.onGet('/apps/chat/chats-and-documents').reply(config => {
  const { q = '' }: { q?: string } = config.params;

  const qLowered = q.toLowerCase();

  const chatsDocuments: ChatDocumentWithChat[] = database.chats
    .map(chat => {
      const document = JSON.parse(JSON.stringify((database.documents.find(c => c.id === chat.documentId) as ChatDocument)));

      document.chat = { id: chat.id, unseenMsgs: chat.unseenMsgs, lastMessage: chat.messages.at(-1) };

      return document;
    })
    .reverse();

  const profileUserData: ChatUser = database.profileUser;
  const mlBotUserData: ChatUser = database.mlBotUser;

  const response = {
    chatsDocuments: chatsDocuments.filter(c => c.fullName.toLowerCase().includes(qLowered)),
    documents: database.documents.filter(c => c.fullName.toLowerCase().includes(qLowered)),
    profileUser: profileUserData,
    mlBotUser: mlBotUserData
  };

  return [200, response];
});

// ------------------------------------------------
// GET: Return Single Chat
// ------------------------------------------------
mock.onGet('/apps/chat/users/profile-user').reply(() => [200, database.profileUser]);

// ------------------------------------------------
// GET: Return Single Chat
// ------------------------------------------------
mock.onGet(/\/apps\/chat\/chats\/\d+/).reply(config => {
  // Get document id from URL
  const documentId = Number(config.url?.substring(config.url.lastIndexOf('/') + 1));

  const chat = database.chats.find(c => c.documentId === documentId);
  if (chat)
    chat.unseenMsgs = 0;

  return [
    200,
    {
      chat,
      document: database.documents.find(c => c.id === documentId),
    },
  ];
});

// ------------------------------------------------
// POST: Add new chat message
// ------------------------------------------------
mock.onPost(/\/apps\/chat\/chats\/\d+/).reply(async config => {
  const documentId = Number(config.url?.substring(config.url.lastIndexOf('/') + 1));
  const { message, senderId } = JSON.parse(config.data);

  let activeChat = database.chats.find(chat => chat.documentId === documentId);
  let isNewChat = false;

  // Função auxiliar para criar mensagens
  const createMessage = (msg: string, sender: number, isSent = true): ChatMessage => ({
    message: msg,
    time: new Date().toISOString(),
    senderId: sender,
    feedback: { isSent, isDelivered: false, isSeen: false },
  });

  // Mensagem do usuário (ainda sem saber se foi enviada com sucesso)
  let userMessage = createMessage(message, senderId);

  try {
    const botResponse = await mlBotService().sendMessage(message);
    const botMessage = createMessage(botResponse, database.mlBotUser.id);

    // Se o bot respondeu, a mensagem do usuário é considerada enviada
    userMessage.feedback.isSent = true;

    if (!activeChat) {
      isNewChat = true;
      activeChat = {
        id: genId(database.chats),
        documentId,
        unseenMsgs: 0,
        messages: [userMessage, botMessage],
      };
      database.chats.push(activeChat);
    } else {
      activeChat.messages.push(userMessage, botMessage);
    }

    return [201, { msgs: [userMessage, botMessage], chat: isNewChat ? activeChat : undefined }];
  } catch (error: any) {
    // Se der erro, a mensagem do usuário fica com `isSent: false`
    userMessage.feedback.isSent = false;

    if (!activeChat) {
      isNewChat = true;
      activeChat = {
        id: genId(database.chats),
        documentId,
        unseenMsgs: 0,
        messages: [userMessage],
      };
      database.chats.push(activeChat);
    } else {
      activeChat.messages.push(userMessage);
    }

    return [201, { msgs: [userMessage], chat: isNewChat ? activeChat : undefined }];
  }
});
