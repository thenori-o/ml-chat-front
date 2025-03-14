import mock from '@/@fake-db/mock';
import { genId } from '@/@fake-db/utils';
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
    avatar: '',
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
    avatar: '',
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
      fullName: 'CNH_Renovacao.pdf',
      role: 'Habilitação',
      about: 'Cake pie jelly jelly beans. Marzipan lemon drops halvah cake. Pudding cookie lemon drops icing',
      avatar: '',
      status: 'offline',
    },
  ],
  chats: [
    {
      id: 1,
      documentId: 1,
      unseenMsgs: 0,
      messages: [
        {
          message: 'Hi',
          time: 'Mon Dec 10 2018 07:45:00 GMT+0000 (GMT)',
          senderId: 11,
          feedback: {
            isSent: true,
            isDelivered: true,
            isSeen: true,
          },
        },
        {
          message: 'Hello. How can I help You?',
          time: 'Mon Dec 11 2018 07:45:15 GMT+0000 (GMT)',
          senderId: 2,
          feedback: {
            isSent: true,
            isDelivered: true,
            isSeen: true,
          },
        },
        {
          message: 'Can I get details of my last transaction I made last month? 🤔',
          time: 'Mon Dec 11 2018 07:46:10 GMT+0000 (GMT)',
          senderId: 11,
          feedback: {
            isSent: true,
            isDelivered: true,
            isSeen: true,
          },
        },
        {
          message: 'We need to check if we can provide you such information.',
          time: 'Mon Dec 11 2018 07:45:15 GMT+0000 (GMT)',
          senderId: 2,
          feedback: {
            isSent: true,
            isDelivered: true,
            isSeen: true,
          },
        },
        {
          message: 'I will inform you as I get update on this.',
          time: 'Mon Dec 11 2018 07:46:15 GMT+0000 (GMT)',
          senderId: 2,
          feedback: {
            isSent: true,
            isDelivered: true,
            isSeen: true,
          },
        },
        {
          message: 'If it takes long you can mail me at my mail address.',
          time: String(dayBeforePreviousDay),
          senderId: 11,
          feedback: {
            isSent: true,
            isDelivered: false,
            isSeen: false,
          },
        },
      ],
    },
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
