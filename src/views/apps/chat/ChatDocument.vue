<script lang="ts" setup>
import type { ChatDocument, ChatDocumentWithChat } from "@/@fake-db/types";
import { useChat } from "@/views/apps/chat/useChat";
import { useChatStore } from "@/views/apps/chat/useChatStore";
import { avatarText, formatDateToMonthShort } from "@core/utils/formatters";
import { VCheckbox, VFadeTransition } from "vuetify/components";

interface Props {
  isChatDocument?: boolean;
  isAddMode?: boolean;
  document: ChatDocument | ChatDocumentWithChat;
  selectedDocs?: Array<number>;
}

const props = withDefaults(defineProps<Props>(), {
  isChatDocument: false,
});
const emit = defineEmits<{
  (e: "selected", value: { id: ChatDocument["id"]; isSelected: boolean }): void;
}>();

const store = useChatStore();
const { resolveAvatarBadgeVariant } = useChat();

const isChatDocumentActive = computed(() => {
  const isActive = store.activeChat?.document.id === props.document.id;
  if (!props.isChatDocument) return !store.activeChat?.chat && isActive;

  return isActive;
});

const isSelected = ref(false);
onUpdated(() => {
  if (!props.selectedDocs || props.selectedDocs.length == 0) {
    isSelected.value = false;
  }
});

const toggleSelected = () => {
  isSelected.value = !isSelected.value;
  emit("selected", { id: props.document.id, isSelected: isSelected.value });
};

watch(
  () => props.isAddMode,
  (newVal, oldVal) => {
    if (!newVal) isSelected.value = false;
    else if (isChatDocumentActive.value) {
      isSelected.value = true;
    }
  }
);

watch(isChatDocumentActive, (newVal) => {
  if (newVal && props.isAddMode) isSelected.value = true;
  else isSelected.value = false;
});
</script>

<template>
  <li
    :key="store.chatsDocuments.length"
    class="chat-document cursor-pointer d-flex align-center"
    :class="{ 'chat-document-active': isChatDocumentActive }"
  >
    <div v-if="!isChatDocument" class="relative">
      <VBadge
        dot
        location="bottom right"
        offset-x="3"
        offset-y="0"
        :color="resolveAvatarBadgeVariant(props.document.status)"
        bordered
        :model-value="props.isChatDocument"
      >
        <VAvatar
          size="38"
          :variant="!props.document.avatar ? 'tonal' : undefined"
          :color="
            !props.document.avatar
              ? resolveAvatarBadgeVariant(props.document.status)
              : undefined
          "
        >
          <VImg
            v-if="props.document.avatar"
            :src="props.document.avatar"
            alt="John Doe"
          />
          <span v-else>{{ avatarText(props.document.fullName) }}</span>
        </VAvatar>

        <VFadeTransition>
          <VCheckbox
            v-if="isAddMode || isSelected"
            :model-value="isSelected"
            @update:model-value="toggleSelected()"
            class="absolute-center"
          />
        </VFadeTransition>
      </VBadge>
    </div>

    <div v-else>
      <VBadge
        dot
        location="bottom right"
        offset-x="3"
        offset-y="0"
        :color="resolveAvatarBadgeVariant(props.document.status)"
        bordered
        :model-value="props.isChatDocument"
      >
        <VAvatar
          size="38"
          :variant="!props.document.avatar ? 'tonal' : undefined"
          :color="
            !props.document.avatar
              ? resolveAvatarBadgeVariant(props.document.status)
              : undefined
          "
        >
          <VImg
            v-if="props.document.avatar"
            :src="props.document.avatar"
            alt="John Doe"
          />
          <span v-else>{{ avatarText(props.document.fullName) }}</span>
        </VAvatar>
      </VBadge>
    </div>

    <div class="flex-grow-1 ms-4 overflow-hidden">
      <p class="text-h6 mb-0">{{ props.document.fullName }}</p>
      <p class="mb-0 text-truncate text-disabled">
        {{
          props.isChatDocument && "chat" in props.document
            ? props.document.chat.lastMessage.message
            : props.document.about
        }}
      </p>
    </div>

    <div
      v-if="props.isChatDocument && 'chat' in props.document"
      class="d-flex flex-column align-self-start"
    >
      <span class="d-block text-sm text-disabled whitespace-no-wrap">
        {{ formatDateToMonthShort(props.document.chat.lastMessage.time) }}
      </span>
      <VBadge
        v-if="props.document.chat.unseenMsgs"
        color="error"
        inline
        :content="props.document.chat.unseenMsgs"
        class="ms-auto"
      />
    </div>
  </li>
</template>

<style lang="scss">
@use "@styles/variables/_vuetify.scss";
@use "@core/scss/base/mixins";
@use "vuetify/lib/styles/tools/states" as vuetifyStates;

.chat-document {
  border-radius: vuetify.$border-radius-root;
  padding-block: 8px;
  padding-inline: 12px;

  @include mixins.before-pseudo;
  @include vuetifyStates.states($active: false);

  &.chat-document-active {
    background: linear-gradient(
      72.47deg,
      rgb(var(--v-theme-primary)) 0%,
      #fff 300%
    );
    color: #fff;

    --v-theme-on-background: #fff;

    .v-avatar {
      background: #fff;
      outline: 2px solid #fff;
    }
  }

  .v-badge--bordered .v-badge__badge::after {
    color: #fff;
  }

  .absolute-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .v-selection-control__input::before {
    background-color: #ececec;
  }

  .v-selection-control__input::before {
    opacity: calc(
      (var(--v-selected-opacity) + 1) * var(--v-theme-overlay-multiplier)
    );
  }
}
</style>
