import type { ActiveChat } from './useChat';
import type { ChatDocument, ChatDocumentWithChat, ChatMessage, ChatOut } from '@/@core/services/ml-bot/types';
import axios from '@axios';

interface State {
  chatsDocuments: ChatDocumentWithChat[]
  documents: ChatDocument[]
  profileUser: ChatDocument | undefined
  activeChat: ActiveChat
}

export const useChatStore = defineStore('chat', {
  // ℹ️ arrow function recommended for full type inference
  state: (): State => ({
    documents: [],
    chatsDocuments: [],
    profileUser: undefined,
    activeChat: null,
  }),
  actions: {
    async fetchChatsAndDocuments(q: string) {
      const { data } = await axios.get('/apps/chat/chats-and-documents', {
        params: { q },
      });

      const { chatsDocuments, documents, profileUser } = data;

      this.chatsDocuments = chatsDocuments;
      this.documents = documents;
      this.profileUser = profileUser;
    },

    async getChat(userId: ChatDocument['id']) {
      const { data } = await axios.get(`/apps/chat/chats/${userId}`);

      this.activeChat = data;
    },

    async sendMsg(message: ChatMessage['message']) {
      const senderId = this.profileUser?.id;
      const { data } = await axios.post(`/apps/chat/chats/${this.activeChat?.document.id}`, { message, senderId });

      const { msg, chat }: { msg: ChatMessage; chat: ChatOut } = data;

      // ? If it's not undefined => New chat is created (Document is not in list of chats)
      if (chat !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const activeChat = this.activeChat!;

        this.chatsDocuments.push({
          ...activeChat.document,
          chat: {
            id: chat.id,
            lastMessage: [],
            unseenMsgs: 0,
            messages: [msg],
          },
        });

        if (this.activeChat) {
          this.activeChat.chat = {
            id: chat.id,
            messages: [msg],
            unseenMsgs: 0,
            userId: this.activeChat?.document.id,
          };
        }
      }
      else {
        this.activeChat?.chat?.messages.push(msg);
      }

      // Set Last Message for active document
      const document = this.chatsDocuments.find(c => {
        if (this.activeChat)
          return c.id === this.activeChat.document.id;

        return false;
      }) as ChatDocumentWithChat;

      document.chat.lastMessage = msg;
    },
  },
});
