<template>
  <prime-dialog class="w-1/3 h-[90%]" :pt="{ content: 'h-full' }" v-model:visible="isDialogVisible" :header="development?.title" position="left">
    <div v-show="isLoading" class="flex items-center justify-center h-full">
      <progress-spinner class="h-20" stroke-width="5" :pt="{ circle: '!stroke-[var(--primary-color)]' }" />
    </div>

    <div v-show="!isLoading">
      <prime-carousel :value="imageUrls" :num-visible="2">
        <template #item="slotProps">
          <div class="flex items-center justify-center">
            <prime-image :src="slotProps.data" preview />
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
            <p class="text-xl" id="approvalRating">{{ percentageString }}</p>
            <i v-if="percentageDecimal && percentageDecimal > -1" :class="['pi', percentageDecimal > 0.65 ? 'pi-thumbs-up' : 'pi-thumbs-down']" />
          </div>
        </div>

        <div class="flex justify-between">
          <div>
            <h2 class="mt-2 font-bold">Community Feedback</h2>
            <p class="text-xs italic">
              {{ `${development?.expand?.['feedback(development)'].filter((f) => f.content).length} written responses` }}
            </p>
          </div>
          <prime-button label="Add Your Own" size="small" @click="addFeedbackDialog.toggle()" />
        </div>

        <div class="flex flex-col gap-2 w-full h-56">
          <div class="flex items-center justify-between" v-for="f in development?.expand?.['feedback(development)'].filter((f) => f.content)">
            <div class="flex flex-col w-11/12">
              <p class="text-xs font-bold">{{ f.username }}</p>
              <p class="break-words text-sm">{{ f.content }}</p>
            </div>
            <i :class="['pi pr-2', f.vote === FeedbackVoteOptions.yay ? 'pi-thumbs-up' : 'pi-thumbs-down']" />
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
import pb from '@/util/pocketbase';
import { ref } from 'vue';
import type { DevelopmentsResponse, FeedbackResponse } from '@/util/pocketbase-types';
import { FeedbackVoteOptions } from '@/util/pocketbase-types';
import { formatDateMonthYear } from '@/util/dates';

type DevelopmentsExpandFeedback = DevelopmentsResponse<{ 'feedback(development)': FeedbackResponse[] }>;

const addFeedbackDialog = ref({} as InstanceType<typeof AddFeedbackDialog>);

const isDialogVisible = ref(false);
const isLoading = ref(false);
const development = ref<DevelopmentsExpandFeedback>({} as DevelopmentsExpandFeedback);
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
  const developmentResponse = await pb
    .collection('developments')
    .getFirstListItem<DevelopmentsExpandFeedback>(`id="${developmentId}"`, { expand: 'feedback(development)' });
  development.value = developmentResponse;
  console.log(development.value);

  developmentResponse.images.forEach((img) => {
    imageUrls.value.push(pb.getFileUrl(developmentResponse, img));
  });

  let numYay = 0;
  developmentResponse.expand?.['feedback(development)'].forEach((feedback) => {
    if (feedback.vote === FeedbackVoteOptions.yay) {
      numYay++;
    }
  });

  if (developmentResponse.expand) {
    percentageDecimal.value = numYay / developmentResponse.expand['feedback(development)'].length;
    percentageString.value = `${Math.floor(percentageDecimal.value * 100)}%`;
  } else {
    percentageDecimal.value = -1;
    percentageString.value = 'No votes yet.';
  }
  isLoading.value = false;
};
</script>
