<template>
  <prime-dialog class="w-1/4" header="Submit Feedback" v-model:visible="isVisible" @hide="reset()">
    <div class="flex flex-col gap-3">
      <div class="flex flex-col gap-2">
        <label for="feedbackContent">Content</label>
        <prime-textarea id="feedbackContent" v-model="content" placeholder="Share your opinion" />
      </div>
      <div class="flex flex-col gap-2">
        <label for="approvalButtons">Approval</label>
        <div class="flex gap-2" id="approvalButtons">
          <prime-button icon="pi pi-thumbs-up" :outlined="vote === false || vote == undefined" @click="vote = true" />
          <prime-button icon="pi pi-thumbs-down" severity="danger" :outlined="vote === true || vote == undefined" @click="vote = false" />
        </div>
      </div>
      <prime-button label="Submit" @click="submitForm" />
      <p v-if="errorText" class="text-red-500 text-sm italic">{{ errorText }}</p>
    </div>
  </prime-dialog>
</template>

<script setup lang="ts">
import pb from '@/util/pocketbase';
import { FeedbackVoteOptions } from '@/util/pocketbase-types';
import PrimeButton from 'primevue/button';
import PrimeDialog from 'primevue/dialog';
import PrimeTextarea from 'primevue/textarea';
import { ref } from 'vue';

const isVisible = ref(false);
const content = ref<string>();
const vote = ref<boolean | undefined>(undefined);
const errorText = ref<string>();

const props = defineProps<{ developmentId: string | undefined }>();
const emits = defineEmits<{ (e: 'form-submit'): void }>();

const toggle = () => {
  isVisible.value = !isVisible.value;
};
defineExpose({ toggle });

const validateForm = (): string | 'success' => {
  if (vote.value == undefined) {
    return 'Please give your approval of the project.';
  }
  return 'success';
};

const reset = () => {
  content.value = '';
  vote.value = undefined;
  errorText.value = '';
};

const submitForm = async () => {
  const result = validateForm();
  if (result !== 'success') {
    errorText.value = result;
    return;
  }

  await pb.collection('feedback').create({
    user: pb.authStore.model?.id,
    username: pb.authStore.model?.username,
    content: content.value,
    development: props.developmentId,
    vote: vote.value === true ? FeedbackVoteOptions.yay : FeedbackVoteOptions.nay
  });

  isVisible.value = false;
  emits('form-submit');
};
</script>
