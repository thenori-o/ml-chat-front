<script lang="ts" setup>
import type { ChatDocument as TypeChatDocument } from "@/@fake-db/types";
import vuetifyInitialThemes from "@/plugins/vuetify/theme";
import ChatLeftSidebarContent from "@/views/apps/chat/ChatLeftSidebarContent.vue";
import ChatLog from "@/views/apps/chat/ChatLog.vue";
import { useChatStore } from "@/views/apps/chat/useChatStore";
import { useResponsiveLeftSidebar } from "@core/composable/useResponsiveSidebar";
import { PerfectScrollbar } from "vue3-perfect-scrollbar";
import { useDisplay, useTheme } from "vuetify";

// composables
const vuetifyDisplays = useDisplay();
const store = useChatStore();
const { isLeftSidebarOpen } = useResponsiveLeftSidebar(
  vuetifyDisplays.smAndDown
);

// docs relacionados
const { selectedDocs } = storeToRefs(store);

// Perfect scrollbar
const chatLogPS = ref();

const scrollToBottomInChatLog = () => {
  const scrollEl = chatLogPS.value.$el || chatLogPS.value;

  scrollEl.scrollTop = scrollEl.scrollHeight;
};

// Search query
const q = ref("");

watch(q, (val) => store.fetchChatsAndDocuments(val), { immediate: true });

// Open Sidebar in smAndDown when "start conversation" is clicked
const startConversation = () => {
  if (vuetifyDisplays.mdAndUp.value) return;
  isLeftSidebarOpen.value = true;
};

// Chat message
const msg = ref("");
const isSending = ref(false);

const sendMessage = async () => {
  if (!msg.value || !msg.value.trim()) return;

  try {
    await store.sendMsg(msg.value);
    msg.value = "";

    nextTick(() => {
      scrollToBottomInChatLog();
    });
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
  } finally {
    isSending.value = false;
  }
};

const openChatOfDocument = async (id: TypeChatDocument["id"]) => {
  await store.getChat(id);

  // Reset message input
  msg.value = "";

  // Set unseenMsgs to 0
  const document = store.chatsDocuments.find((c) => c.id === id);
  if (document) document.chat.unseenMsgs = 0;

  // if smAndDown =>  Close Chat & Documents left sidebar
  if (vuetifyDisplays.smAndDown.value) isLeftSidebarOpen.value = false;

  // Scroll to bottom
  nextTick(() => {
    scrollToBottomInChatLog();
  });
};

// User profile sidebar
const isUserProfileSidebarOpen = ref(false);

// Active chat user profile sidebar
const isActiveChatUserProfileSidebarOpen = ref(false);

// file input
const refInputEl = ref<HTMLElement>();

const { name } = useTheme();

const chatContentContainerBg = computed(() => {
  let color = "transparent";

  if (vuetifyInitialThemes)
    color = vuetifyInitialThemes.themes?.[name.value].colors
      ?.background as string;

  return color;
});
</script>

<template>
  <VLayout class="chat-app-layout">
    <!-- 👉 Left sidebar   -->
    <VNavigationDrawer
      v-model="isLeftSidebarOpen"
      absolute
      touchless
      location="start"
      width="370"
      :temporary="$vuetify.display.smAndDown"
      class="chat-list-sidebar"
      :permanent="$vuetify.display.mdAndUp"
    >
      <ChatLeftSidebarContent
        v-model:isDrawerOpen="isLeftSidebarOpen"
        v-model:search="q"
        @open-chat-of-document="openChatOfDocument"
        @show-user-profile="isUserProfileSidebarOpen = true"
        @close="isLeftSidebarOpen = false"
      />
    </VNavigationDrawer>

    <!-- 👉 Chat content -->
    <VMain class="chat-content-container">
      <!-- 👉 Right content: Active Chat -->
      <div v-if="store.activeChat" class="d-flex flex-column h-100">
        <!-- 👉 Active chat header -->
        <div
          class="active-chat-header d-flex align-center text-medium-emphasis bg-surface"
        >
          <!-- Sidebar toggler -->
          <IconBtn class="d-md-none me-3" @click="isLeftSidebarOpen = true">
            <VIcon icon="tabler-menu-2" />
          </IconBtn>

          <!-- avatar -->
          <div
            class="d-flex align-center cursor-pointer"
            @click="isActiveChatUserProfileSidebarOpen = true"
          >
            <div class="flex-grow-1 ms-4 overflow-hidden">
              <p class="text-h6 mb-0">
                {{ store.activeChat.document.fullName }}
              </p>
              <p class="text-truncate mb-0 text-disabled">
                {{ store.activeChat.document.role }}
              </p>
            </div>
          </div>

          <VSpacer />

          <!-- Header right content -->
          <div class="d-sm-flex align-center d-none">
            <IconBtn disabled>
              <VIcon icon="tabler-send" />
            </IconBtn>
            <IconBtn disabled>
              <VIcon icon="tabler-edit" />
            </IconBtn>
            <IconBtn disabled>
              <VIcon icon="tabler-file-arrow-right" />
            </IconBtn>
            <IconBtn disabled>
              <VIcon icon="tabler-reload" />
            </IconBtn>
            <IconBtn disabled>
              <VIcon icon="tabler-trash" />
            </IconBtn>
          </div>
        </div>

        <VDivider />

        <!-- Chat log -->
        <PerfectScrollbar
          ref="chatLogPS"
          tag="ul"
          :options="{ wheelPropagation: false }"
          class="flex-grow-1"
        >
          <ChatLog />
        </PerfectScrollbar>

        <!-- Message form -->
        <VForm
          class="chat-log-message-form mb-5 mx-5"
          @submit.prevent="sendMessage"
        >
          <VTextField
            :key="store.activeChat?.document.id"
            v-model="msg"
            variant="solo"
            class="chat-message-input"
            placeholder="Type your message..."
            density="default"
            autofocus
          >
            <template #prepend-inner>
              <IconBtn disabled @click="refInputEl?.click()">
                <VIcon icon="tabler-file-type-pdf" />
              </IconBtn>
            </template>
            <template #append-inner>
              <VBtn
                :loading="isSending"
                :disabled="isSending || !msg.trim()"
                @click="sendMessage"
              >
                Send
              </VBtn>
            </template>
          </VTextField>

          <input
            ref="refInputEl"
            type="file"
            name="file"
            accept=".pdf"
            hidden
          />
        </VForm>
      </div>

      <!-- 👉 Start conversation -->
      <div v-else class="d-flex h-100 align-center justify-center flex-column">
        <VAvatar size="109" class="elevation-3 mb-6 bg-surface">
          <VIcon
            size="50"
            class="rounded-0 text-high-emphasis"
            icon="tabler-message"
          />
        </VAvatar>
        <p
          class="mb-0 px-6 py-1 font-weight-medium text-lg elevation-3 rounded-xl text-high-emphasis bg-surface"
          :class="[{ 'cursor-pointer': $vuetify.display.smAndDown }]"
          @click="startConversation"
        >
          Iniciar conversa
        </p>
      </div>
    </VMain>
  </VLayout>
</template>

<route lang="yaml">
meta:
  layoutWrapperClasses: layout-content-height-fixed
</route>

<style lang="scss">
@use "@styles/variables/_vuetify.scss";
@use "@core/scss/base/_mixins.scss";
@use "@layouts/styles/mixins" as layoutsMixins;

// Variables
$chat-app-header-height: 62px;

// Placeholders
%chat-header {
  display: flex;
  align-items: center;
  min-block-size: $chat-app-header-height;
  padding-inline: 1rem;
}

.chat-app-layout {
  border-radius: vuetify.$card-border-radius;

  @include mixins.elevation(vuetify.$card-elevation);

  $sel-chat-app-layout: &;

  @at-root {
    .skin--bordered {
      @include mixins.bordered-skin($sel-chat-app-layout);
    }
  }

  .active-chat-user-profile-sidebar,
  .user-profile-sidebar {
    .v-navigation-drawer__content {
      display: flex;
      flex-direction: column;
    }
  }

  .chat-list-header,
  .active-chat-header {
    @extend %chat-header;
  }

  .chat-list-search {
    .v-field__outline__start {
      flex-basis: 20px !important;
      border-radius: 28px 0 0 28px !important;
    }

    .v-field__outline__end {
      border-radius: 0 28px 28px 0 !important;
    }

    @include layoutsMixins.rtl {
      .v-field__outline__start {
        flex-basis: 20px !important;
        border-radius: 0 28px 28px 0 !important;
      }

      .v-field__outline__end {
        border-radius: 28px 0 0 28px !important;
      }
    }
  }

  .chat-list-sidebar {
    .v-navigation-drawer__content {
      display: flex;
      flex-direction: column;
    }
  }
}

.chat-content-container {
  /* stylelint-disable-next-line value-keyword-case */
  background-color: v-bind(chatContentContainerBg);

  // Adjust the padding so text field height stays 48px
  .chat-message-input {
    .v-field__append-inner {
      align-items: center;
      padding-block-start: 0;
    }

    .v-field__prepend-inner {
      padding-top: 0;
    }

    .v-field--appended {
      padding-inline-end: 9px;
      align-items: center;
    }
  }
}

.chat-user-profile-badge {
  .v-badge__badge {
    /* stylelint-disable liberty/use-logical-spec */
    min-width: 12px !important;
    height: 0.75rem;
    /* stylelint-enable liberty/use-logical-spec */
  }
}
</style>
