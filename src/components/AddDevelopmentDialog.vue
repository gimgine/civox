<template>
  <prime-dialog
    class="w-1/3 h-[90%]"
    v-model:visible="isDialogVisible"
    header="Add Development"
    position="right"
    :pt="{ content: 'h-full' }"
    @hide="emit('close', false)"
  >
    <div class="flex flex-col gap-4 h-full">
      <div class="flex flex-col gap-2">
        <label for="title" :class="`${development.title.error ? 'p-error' : ''}`">Title</label>
        <input-text
          id="title"
          v-model="development.title.value"
          :class="`${development.title.error ? 'p-invalid focus:[box-shadow:0_0_0_0.2rem_var(--red-100)]' : ''}`"
          @update:model-value="() => (development.title.error = '')"
        />
        <small class="p-error">{{ development.title.error }}</small>
      </div>
      <div class="flex flex-col gap-2">
        <label for="description" :class="`${development.description.error ? 'p-error' : ''}`">Description</label>
        <prime-textarea
          id="description"
          v-model="development.description.value"
          :class="`${development.description.error ? 'p-invalid focus:[box-shadow:0_0_0_0.2rem_var(--red-100)]' : ''}`"
          @update:model-value="() => (development.description.error = '')"
        />
        <small class="p-error">{{ development.description.error }}</small>
      </div>
      <div class="flex flex-col gap-2">
        <label for="type" :class="`${development.type.error ? 'p-error' : ''}`">Type</label>
        <dropdown
          id="type"
          v-model="development.type.value"
          :options="Object.values(DevelopmentsTypeOptions)"
          :class="`${development.type.error ? 'p-invalid focus:[box-shadow:0_0_0_0.2rem_var(--red-100)]' : ''}`"
          @update:model-value="() => (development.type.error = '')"
        />
        <small class="p-error">{{ development.type.error }}</small>
      </div>
    </div>
  </prime-dialog>
</template>

<script setup lang="ts">
import PrimeDialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import PrimeTextarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';

import { ref } from 'vue';
import { DevelopmentsTypeOptions } from '@/util/pocketbase-types';

const emit = defineEmits<{
  (e: 'close', submitted: boolean): void;
}>();

const isDialogVisible = ref(false);
const development = ref({
  title: { value: '', error: '' },
  description: { value: '', error: '' },
  type: { value: undefined, error: '' },
  images: { value: undefined, error: '' },
  proposedBy: { value: '', error: '' },
  expectedStart: { value: '', error: '' }
});

const open = () => {
  isDialogVisible.value = true;
  development.value = {
    title: { value: '', error: '' },
    description: { value: '', error: '' },
    type: { value: undefined, error: '' },
    images: { value: undefined, error: '' },
    proposedBy: { value: '', error: '' },
    expectedStart: { value: '', error: '' }
  };
};
const close = () => (isDialogVisible.value = false);

defineExpose({ open, close });
</script>
