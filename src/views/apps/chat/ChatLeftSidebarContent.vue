<script lang="ts" setup>
import type { ChatDocument as TypeChatDocument } from "@/@fake-db/types";
import ChatDocument from "@/views/apps/chat/ChatDocument.vue";
import { useChatStore } from "@/views/apps/chat/useChatStore";
import { PerfectScrollbar } from "vue3-perfect-scrollbar";

const props = defineProps<{
  search: string;
  isDrawerOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "openChatOfDocument", id: TypeChatDocument["id"]): void;
  (e: "showUserProfile"): void;
  (e: "close"): void;
  (e: "update:docs", value: Array<number>): void;
}>();

const search = useVModel(props, "search");

const store = useChatStore();

const { addMode } = storeToRefs(store);
const handleAddChat = () => {
  addMode.value = !addMode.value;
};
</script>

<template>
  <!-- 👉 Chat list header -->
  <div v-if="store.profileUser" class="chat-list-header">
    <AppTextField
      v-model="search"
      placeholder="Pesquisar..."
      class="ms-4 me-1 chat-list-search"
    >
      <template #prepend-inner>
        <VIcon size="22" icon="tabler-search" />
      </template>
    </AppTextField>

    <IconBtn v-if="$vuetify.display.smAndDown" @click="$emit('close')">
      <VIcon icon="tabler-x" class="text-medium-emphasis" />
    </IconBtn>
  </div>
  <VDivider />

  <PerfectScrollbar
    tag="ul"
    class="d-flex flex-column gap-y-1 chat-documents-list px-3 list-none"
    :options="{ wheelPropagation: false }"
  >
    <li>
      <span
        class="chat-document-header d-block text-primary text-xl font-weight-medium"
        >Chats</span
      >
    </li>

    <ChatDocument
      v-for="document in store.chatsDocuments"
      :key="`chat-${document.id}`"
      :document="document"
      is-chat-document
      @click="$emit('openChatOfDocument', document.id)"
    />

    <span
      v-show="!store.chatsDocuments.length"
      class="no-chat-items-text text-disabled"
      >No chats found</span
    >

    <li class="d-flex justify-space-between align-center">
      <span
        class="chat-document-header d-block text-primary text-xl font-weight-medium"
        >Documentos</span
      >
      <IconBtn size="small" @click="handleAddChat">
        <VIcon
          :icon="addMode ? 'tabler-x' : 'tabler-plus'"
          :class="{
            'rotate-forward': addMode,
            'rotate-backward': !addMode,
          }"
        />
        <VTooltip activator="parent" location="start" open-delay="300">
          {{ !addMode ? "Cancelar" : "Adicionar" }}
        </VTooltip>
      </IconBtn>
    </li>

    <ChatDocument
      v-for="document in store.documents"
      :key="`chat-${document.id}`"
      :document="document"
      :isAddMode="addMode"
      @click="!addMode && $emit('openChatOfDocument', document.id)"
    />

    <span
      v-show="!store.documents.length"
      class="no-chat-items-text text-disabled"
      >No documents found</span
    >
  </PerfectScrollbar>
</template>

<style lang="scss">
.chat-documents-list {
  --chat-content-spacing-x: 16px;

  padding-block-end: 0.75rem;

  .chat-document-header {
    margin-block-end: 0.625rem;
    margin-block-start: 1.25rem;
  }

  .chat-document-header,
  .no-chat-items-text {
    margin-inline: var(--chat-content-spacing-x);
  }
}

.chat-list-search {
  .v-field--focused {
    box-shadow: none !important;
  }
}

.rotate-forward {
  transition: transform 0.3s ease-in-out;
  transform: rotate(180deg);
}

.rotate-backward {
  transition: transform 0.3s ease-in-out;
  transform: rotate(0deg);
}
</style>
