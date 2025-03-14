import { mlBotService } from '@/@core/services/ml-bot/ml-bot.service';
import mock from '@/@fake-db/mock';
import { genId } from '@/@fake-db/utils';
import type { Chat, ChatDocument, ChatDocumentWithChat, ChatMessage } from './../types.d';

const previousDay = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
const dayBeforePreviousDay = new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 2);

interface Database {
  profileUser: ChatDocument & {
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
    id: 1,
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
    {
      id: 2,
      fullName: 'IPVA_2024.pdf',
      role: 'Impostos e Taxas',
      about: 'Toffee caramels jelly-o tart gummi bears cake I love ice cream lollipop. Sweet liquorice croissant candy danish dessert icing. Cake macaroon gingerbread toffee sweet.',
      avatar: '',
      status: 'busy',
    },
    {
      id: 3,
      fullName: 'Multas_Recursos.pdf',
      role: 'Multas e Infrações',
      about: 'Soufflé soufflé caramels sweet roll. Jelly lollipop sesame snaps bear claw jelly beans sugar plum sugar plum.',
      avatar: '',
      status: 'busy',
    },
    {
      id: 4,
      fullName: 'CRLV_Digital.pdf',
      role: 'Licenciamento',
      about: 'Chupa chups candy canes chocolate bar marshmallow liquorice muffin. Lemon drops oat cake tart liquorice tart cookie. Jelly-o cookie tootsie roll halvah.',
      avatar: '',
      status: 'online',
    },
    {
      id: 5,
      fullName: 'Transferencia_Veiculo.pdf',
      role: 'Transferência de Veículos',
      about: 'Cake pie jelly jelly beans. Marzipan lemon drops halvah cake. Pudding cookie lemon drops icing',
      avatar: '',
      status: 'busy',
    },
    {
      id: 6,
      fullName: 'Placas_Mercosul.pdf',
      role: 'Identificação Veicular',
      about: 'Toffee caramels jelly-o tart gummi bears cake I love ice cream lollipop. Sweet liquorice croissant candy danish dessert icing. Cake macaroon gingerbread toffee sweet.',
      avatar: '',
      status: 'online',
    },
    {
      id: 7,
      fullName: 'Seguranca_Viaria.pdf',
      role: 'Educação no Trânsito',
      about: 'Biscuit powder oat cake donut brownie ice cream I love soufflé. I love tootsie roll I love powder tootsie roll.',
      avatar: '',
      status: 'online',
    },
    {
      id: 8,
      fullName: 'Registro_Veicular.pdf',
      role: 'Registro de Veículos',
      about: 'Bear claw ice cream lollipop gingerbread carrot cake. Brownie gummi bears chocolate muffin croissant jelly I love marzipan wafer.',
      avatar: '',
      status: 'away',
    },
    {
      id: 9,
      fullName: 'Leis_Transito.pdf',
      role: 'Legislação de Trânsito',
      about: 'Gummies gummi bears I love candy icing apple pie I love marzipan bear claw. I love tart biscuit I love candy canes pudding chupa chups liquorice croissant.',
      avatar: '',
      status: 'offline',
    },
    {
      id: 10,
      fullName: 'CNH_Suspensao.pdf',
      role: 'Penalidades',
      about: 'Cake pie jelly jelly beans. Marzipan lemon drops halvah cake. Pudding cookie lemon drops icing',
      avatar: '',
      status: 'away',
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
    {
      id: 2,
      userId: 1,
      unseenMsgs: 1,
      messages: [
        {
          message: 'How can we help? We\'re here for you!',
          time: 'Mon Dec 10 2018 07:45:00 GMT+0000 (GMT)',
          senderId: 11,
          feedback: {
            isSent: true,
            isDelivered: true,
            isSeen: true,
          },
        },
        {
          message: 'Hey John, I am looking for the best admin template. Could you please help me to find it out?',
          time: 'Mon Dec 10 2018 07:45:23 GMT+0000 (GMT)',
          senderId: 1,
          feedback: {
            isSent: true,
            isDelivered: true,
            isSeen: true,
          },
        },
        {
          message: 'It should use nice Framework.',
          time: 'Mon Dec 10 2018 07:45:55 GMT+0000 (GMT)',
          senderId: 1,
          feedback: {
            isSent: true,
            isDelivered: true,
            isSeen: true,
          },
        },
        {
          message: 'Absolutely!',
          time: 'Mon Dec 10 2018 07:46:00 GMT+0000 (GMT)',
          senderId: 11,
          feedback: {
            isSent: true,
            isDelivered: true,
            isSeen: true,
          },
        },
        {
          message: 'Our admin is the responsive admin template.!',
          time: 'Mon Dec 10 2018 07:46:05 GMT+0000 (GMT)',
          senderId: 11,
          feedback: {
            isSent: true,
            isDelivered: true,
            isSeen: true,
          },
        },
        {
          message: 'Looks clean and fresh UI. 😍',
          time: 'Mon Dec 10 2018 07:46:23 GMT+0000 (GMT)',
          senderId: 1,
          feedback: {
            isSent: true,
            isDelivered: true,
            isSeen: true,
          },
        },
        {
          message: 'It\'s perfect for my next project.',
          time: 'Mon Dec 10 2018 07:46:33 GMT+0000 (GMT)',
          senderId: 1,
          feedback: {
            isSent: true,
            isDelivered: true,
            isSeen: true,
          },
        },
        {
          message: 'How can I purchase it?',
          time: 'Mon Dec 10 2018 07:46:43 GMT+0000 (GMT)',
          senderId: 1,
          feedback: {
            isSent: true,
            isDelivered: true,
            isSeen: true,
          },
        },
        {
          message: 'Thanks, From our official site  😇',
          time: 'Mon Dec 10 2018 07:46:53 GMT+0000 (GMT)',
          senderId: 11,
          feedback: {
            isSent: true,
            isDelivered: true,
            isSeen: true,
          },
        },
        {
          message: 'I will purchase it for sure. 👍',
          time: String(previousDay),
          senderId: 1,
          feedback: {
            isSent: true,
            isDelivered: true,
            isSeen: true,
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
