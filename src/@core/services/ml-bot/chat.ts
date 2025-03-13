import { mlBotService } from './ml-bot.service';
import type { Chat, ChatDocument, ChatDocumentWithChat, ChatMessage } from './types.d';
import mock from '@/@fake-db/mock';
import { genId } from '@/@fake-db/utils';

const dayBeforePreviousDay = new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 2);

interface Database {
  profileUser: ChatDocument & {
    settings: {
      isTwoStepAuthVerificationEnabled: boolean
      isNotificationsOn: boolean
    }
  }
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
      userId: 2,
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
      const document = JSON.parse(JSON.stringify((database.documents.find(c => c.id === chat.userId) as ChatDocument)));

      document.chat = { id: chat.id, unseenMsgs: chat.unseenMsgs, lastMessage: chat.messages.at(-1) };

      return document;
    })
    .reverse();

  const profileUserData: ChatDocument = database.profileUser;

  const response = {
    chatsDocuments: chatsDocuments.filter(c => c.fullName.toLowerCase().includes(qLowered)),
    documents: database.documents.filter(c => c.fullName.toLowerCase().includes(qLowered)),
    profileUser: profileUserData,
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
  // Get user id from URL
  const userId = Number(config.url?.substring(config.url.lastIndexOf('/') + 1));

  const chat = database.chats.find(c => c.userId === userId);
  if (chat)
    chat.unseenMsgs = 0;

  return [
    200,
    {
      chat,
      document: database.documents.find(c => c.id === userId),
    },
  ];
});

// ------------------------------------------------
// POST: Add new chat message
// ------------------------------------------------
mock.onPost(/\/apps\/chat\/chats\/\d+/).reply(async config => {
  // Get user id from URL
  const documentId = Number(config.url?.substring(config.url.lastIndexOf('/') + 1));

  // Get message from post data
  const { message, senderId } = JSON.parse(config.data);

  let activeChat = database.chats.find(chat => chat.userId === documentId);

  // Send message to ML BOT
  const botResponse = await mlBotService().sendMessage(message);

  const newMessageData: ChatMessage = {
    message: botResponse,
    time: String(new Date()),
    senderId,
    feedback: {
      isSent: true,
      isDelivered: false,
      isSeen: false,
    },
  };

  // If there's new chat for user create one
  let isNewChat = false;
  if (activeChat === undefined) {
    isNewChat = true;

    database.chats.push({
      id: genId(database.chats),
      userId: documentId,
      unseenMsgs: 0,
      messages: [],
    });
    activeChat = database.chats.at(-1);
  }
  else {
    activeChat.messages.push(newMessageData);
  }

  const response: { msg: ChatMessage; chat?: Chat } = { msg: newMessageData };

  if (isNewChat)
    response.chat = activeChat;

  return [201, response];
});
