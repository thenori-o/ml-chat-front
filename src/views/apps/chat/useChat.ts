import type { Chat, ChatDocument, ChatStatus } from '@/@fake-db/types';

export type ActiveChat = {
  chat?: Chat
  document: ChatDocument
} | null;

export const useChat = () => {
  const resolveAvatarBadgeVariant = (status: ChatStatus) => {
    if (status === 'online')
      return 'success';
    if (status === 'busy')
      return 'error';
    if (status === 'away')
      return 'warning';

    return 'secondary';
  };

  return {
    resolveAvatarBadgeVariant,
  };
};
