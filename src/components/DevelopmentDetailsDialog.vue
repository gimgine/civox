<template>
  <prime-dialog class="w-1/3 h-[90%]" :pt="{ content: 'h-full' }" v-model:visible="isDialogVisible" position="left">
    <template #header>
      <div class="flex gap-4">
        <span class="text-xl font-bold" v-show="!isLoading">{{ development.title }}</span>
        <tag :value="development.type?.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())" v-show="!isLoading" />
      </div>
    </template>
    <div v-show="isLoading" class="flex items-center justify-center h-full">
      <progress-spinner class="h-20" stroke-width="5" :pt="{ circle: '!stroke-[var(--primary-color)]' }" />
    </div>

    <div v-show="!isLoading">
      <prime-carousel :value="imageUrls" :num-visible="1">
        <template #item="slotProps">
          <div class="flex items-center justify-center">
            <prime-image :src="slotProps.data" preview width="250" />
          </div>
        </template>
      </prime-carousel>

      <div class="flex flex-col gap-3">
        <div>
          <label class="text-xs font-bold" for="description">Description</label>
          <p id="description">{{ development?.description }}</p>
        </div>

        <div class="flex gap-5">
          <div>
            <label class="text-xs font-bold" for="proposedBy">Proposed by</label>
            <p id="proposedBy">{{ development?.proposedBy }}</p>
          </div>
          <div>
            <label class="text-xs font-bold" for="expectedStart">Expected Start Date</label>
            <p id="expectedStart">{{ formatDateMonthYear(development?.expectedStart ?? '') }}</p>
          </div>
        </div>

        <div>
          <label class="text-xs font-bold" for="approvalRating">Community Approval Rating</label>
          <div class="flex items-center gap-2">
            <p v-if="feedback?.length ?? 0" class="text-xl" id="approvalRating">{{ percentageString }}</p>
            <i v-if="(feedback?.length ?? 0) && percentageDecimal" :class="['pi', percentageDecimal > 0.65 ? 'pi-thumbs-up' : 'pi-thumbs-down']" />
            <p class="text-xs italic">{{ `${feedback?.length ?? 0} response(s)` }}</p>
          </div>
        </div>

        <div class="flex justify-between">
          <div>
            <h2 class="mt-2 font-bold">Community Feedback</h2>
            <p class="text-xs italic">
              {{ `${feedback?.filter((f) => f.content).length ?? 0} written response(s)` }}
            </p>
          </div>
          <prime-button label="Add Feedback" size="small" @click="addFeedbackDialog.toggle()" :disabled="!canAddFeedback" />
        </div>

        <div class="flex flex-col gap-2 w-full">
          <div class="flex items-center justify-between" v-for="f in feedback?.filter((f) => f.content)">
            <div class="flex flex-col w-full border-b">
              <div class="flex justify-between pb-1">
                <div class="flex gap-2 items-center">
                  <p class="text-xs font-bold">{{ f.username }}</p>
                  <i :class="['pi pr-2', f.vote === FeedbackVoteOptions.yay ? 'pi-thumbs-up' : 'pi-thumbs-down']" />
                </div>
                <p class="text-sm">{{ formatDateTimeAgo(f.created) }}</p>
              </div>
              <p class="break-words text-sm">{{ f.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </prime-dialog>

  <add-feedback-dialog ref="addFeedbackDialog" :developmentId="development.id" @form-submit="reload(development.id)" />
</template>

<script setup lang="ts">
import PrimeDialog from 'primevue/dialog';
import AddFeedbackDialog from '@/components/AddFeedbackDialog.vue';
import PrimeCarousel from 'primevue/carousel';
import PrimeImage from 'primevue/image';
import PrimeButton from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';
import pb from '@/util/pocketbase';
import { ref } from 'vue';
import type { DevelopmentsResponse, FeedbackResponse, UsersResponse } from '@/util/pocketbase-types';
import { FeedbackVoteOptions } from '@/util/pocketbase-types';
import { formatDateMonthYear, formatDateTimeAgo } from '@/util/dates';

type DevelopmentsExpandFeedback = DevelopmentsResponse<{ 'feedback(development)': FeedbackResponse[] }>;

const addFeedbackDialog = ref({} as InstanceType<typeof AddFeedbackDialog>);

const canAddFeedback = ref(true);
const isDialogVisible = ref(false);
const isLoading = ref(false);
const development = ref<DevelopmentsExpandFeedback>({} as DevelopmentsExpandFeedback);
const feedback = ref<FeedbackResponse[]>();
const imageUrls = ref<string[]>([]);
const percentageString = ref<string>();
const percentageDecimal = ref<number>();

const open = (developmentId: string) => {
  isDialogVisible.value = true;
  reload(developmentId);
};
defineExpose({ open });

const reload = async (developmentId: string) => {
  isLoading.value = true;
  imageUrls.value = [];
  canAddFeedback.value = true;

  const developmentResponse = await pb.collection('developments').getFirstListItem<DevelopmentsExpandFeedback>(`id="${developmentId}"`);
  development.value = developmentResponse;

  developmentResponse.images.forEach((img) => {
    imageUrls.value.push(pb.getFileUrl(developmentResponse, img));
  });

  const feedbackResponse = await pb.collection('feedback').getFullList({ filter: `development="${developmentId}"` });
  feedback.value = feedbackResponse;
  if (feedbackResponse.some((f) => f.user === pb.authStore.model?.id) || !pb.authStore.isValid) {
    canAddFeedback.value = false;
  }

  let numYay = 0;
  feedback.value.forEach((f) => {
    if (f.vote === FeedbackVoteOptions.yay) {
      numYay++;
    }
  });

  if (feedback.value.length) {
    percentageDecimal.value = numYay / feedback.value.length;
    percentageString.value = `${Math.floor(percentageDecimal.value * 100)}%`;
  }

  isLoading.value = false;
};
</script>
