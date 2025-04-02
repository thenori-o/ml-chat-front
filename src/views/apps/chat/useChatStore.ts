import type {
  ChatDocument,
  ChatDocumentWithChat,
  ChatMessage,
  ChatOut,
  ChatUser,
} from "@/@core/services/ml-bot/types";
import axios from "@axios";
import type { ActiveChat } from "./useChat";

interface State {
  chatsDocuments: ChatDocumentWithChat[];
  documents: ChatDocument[];
  addMode: boolean;
  selectedDocs: number[];
  profileUser: ChatUser | undefined;
  mlBotUser: ChatUser | undefined;
  activeChat: ActiveChat;
}

export const useChatStore = defineStore("chat", {
  // ℹ️ arrow function recommended for full type inference
  state: (): State => ({
    addMode: false,
    selectedDocs: [],
    documents: [],
    chatsDocuments: [],
    profileUser: undefined,
    mlBotUser: undefined,
    activeChat: null,
  }),
  actions: {
    async fetchChatsAndDocuments(q: string) {
      const { data } = await axios.get("/apps/chat/chats-and-documents", {
        params: { q },
      });

      const { chatsDocuments, documents, profileUser, mlBotUser } = data;

      this.chatsDocuments = chatsDocuments;
      this.documents = documents;
      this.profileUser = profileUser;
      this.mlBotUser = mlBotUser;
    },

    async getChat(documentId: ChatDocument["id"]) {
      const { data } = await axios.get(`/apps/chat/chats/${documentId}`);

      this.activeChat = data;
    },

    async sendMsg(message: ChatMessage["message"]) {
      this.addMode = false;
      this.selectedDocs = [];

      const senderId = this.profileUser?.id;
      const { data } = await axios.post(
        `/apps/chat/chats/${this.activeChat?.document.id}`,
        { message, senderId }
      );

      const { msgs, chat }: { msgs: ChatMessage[]; chat: ChatOut } = data;

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
            messages: msgs,
          },
        });

        if (this.activeChat) {
          this.activeChat.chat = {
            id: chat.id,
            messages: [...msgs],
            unseenMsgs: 0,
            userId: this.activeChat?.document.id,
          };
        }
      } else {
        this.activeChat?.chat?.messages.push(...msgs);
      }

      // Set Last Message for active document
      const document = this.chatsDocuments.find((c) => {
        if (this.activeChat) return c.id === this.activeChat.document.id;

        return false;
      }) as ChatDocumentWithChat;

      document.chat.lastMessage = msgs.slice(-1)[0];
    },
  },
});
