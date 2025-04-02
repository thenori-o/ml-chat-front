// SECTION App: Chat
export type ChatStatus = 'online' | 'offline' | 'busy' | 'away'

export interface ChatUser {
  id: number
  fullName: string
  role: string
  about: string
  avatar: string
  status: ChatStatus 
}

export interface ChatDocument {
  id: number
  related?: ChatDocument[]
  fullName: string
  role: string
  about: string
  avatar: string
  status: ChatStatus 
  base64?:string
}

export interface ChatMessage {
  message: string
  time: string
  senderId: number
  feedback: {
    isSent: boolean
    isDelivered: boolean
    isSeen: boolean
  }
}

export interface Chat {
  id: number
  documentId: number
  unseenMsgs: number
  messages: ChatMessage[]
}

// ℹ️ This is chat type received in response of user chat
export interface ChatOut {
  id: Chat['id']
  unseenMsgs: Chat['unseenMsgs']
  messages: ChatMessage[]
  lastMessage: ChatMessage[number]
}

export interface ChatDocumentWithChat extends ChatDocument {
  chat: ChatOut
}
// !SECTION App: Chat