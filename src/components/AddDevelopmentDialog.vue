<template>
  <prime-dialog
    class="w-1/3 h-[90%]"
    v-model:visible="isDialogVisible"
    header="Add Development"
    position="right"
    :pt="{ content: 'h-full' }"
    @hide="emit('close', false)"
  >
    <div class="flex flex-col gap-2 h-full">
      <div class="flex flex-col gap-1">
        <file-upload
          @select="
            (e: FileUploadSelectEvent) => {
              development.images.value = e.files;
              development.images.error = '';
            }
          "
          @remove="(e: FileUploadRemoveEvent) => (development.images.value = e.files as any)"
          accept="image/*"
          multiple
          :show-upload-button="false"
          :show-cancel-button="false"
          :pt="{ root: '[&_.p-badge]:hidden' }"
        >
          <template #empty>
            <p>Drag and drop images to here to upload.</p>
          </template>
        </file-upload>
        <small class="p-error">{{ development.images.error }}</small>
      </div>
      <div class="flex flex-col gap-1">
        <label for="title" :class="`${development.title.error ? 'p-error' : ''}`">Title</label>
        <input-text
          id="title"
          v-model="development.title.value"
          :class="`${development.title.error ? 'p-invalid focus:[box-shadow:0_0_0_0.2rem_var(--red-100)]' : ''}`"
          @update:model-value="() => (development.title.error = '')"
        />
        <small class="p-error">{{ development.title.error }}</small>
      </div>
      <div class="flex flex-col gap-1">
        <label for="description" :class="`${development.description.error ? 'p-error' : ''}`">Description</label>
        <prime-textarea
          id="description"
          v-model="development.description.value"
          :class="`${development.description.error ? 'p-invalid focus:[box-shadow:0_0_0_0.2rem_var(--red-100)]' : ''}`"
          @update:model-value="() => (development.description.error = '')"
        />
        <small class="p-error">{{ development.description.error }}</small>
      </div>
      <div class="flex flex-col gap-1">
        <label for="type" :class="`${development.type.error ? 'p-error' : ''}`">Type</label>
        <dropdown
          id="type"
          v-model="development.type.value"
          :options="Object.values(DevelopmentsTypeOptions)"
          :option-label="(data: string) => data.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())"
          :class="`${development.type.error ? 'p-invalid focus:[box-shadow:0_0_0_0.2rem_var(--red-100)]' : ''}`"
          @update:model-value="() => (development.type.error = '')"
        />
        <small class="p-error">{{ development.type.error }}</small>
      </div>
      <div class="flex flex-col gap-1">
        <label for="proposedBy" :class="`${development.proposedBy.error ? 'p-error' : ''}`">Company</label>
        <input-text
          disabled
          id="proposedBy"
          v-model="development.proposedBy.value"
          :class="`${development.proposedBy.error ? 'p-invalid focus:[box-shadow:0_0_0_0.2rem_var(--red-100)]' : ''}`"
          @update:model-value="() => (development.proposedBy.error = '')"
        />
        <small class="p-error">{{ development.proposedBy.error }}</small>
      </div>
      <div class="flex flex-col gap-1">
        <label for="expectedStart" :class="`${development.expectedStart.error ? 'p-error' : ''}`">Expected Start</label>
        <calendar
          id="expectedStart"
          v-model="development.expectedStart.value"
          :class="`${development.expectedStart.error ? 'p-invalid' : ''}`"
          :pt="{ input: development.expectedStart.error ? 'border-red-500 focus:[box-shadow:0_0_0_0.2rem_var(--red-100)]' : '' }"
          @update:model-value="() => (development.expectedStart.error = '')"
        />
        <small class="p-error">{{ development.expectedStart.error }}</small>
      </div>
      <div class="flex-auto"></div>
      <p-button label="Submit" @click="handleSubmit" class="min-h-12" />
    </div>
  </prime-dialog>
</template>

<script setup lang="ts">
import PrimeDialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import PrimeTextarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import PButton from 'primevue/button';
import FileUpload, { type FileUploadRemoveEvent, type FileUploadSelectEvent } from 'primevue/fileupload';
import { ref } from 'vue';
import { DevelopmentsTypeOptions } from '@/util/pocketbase-types';
import pb from '@/util/pocketbase';
import { useToast } from 'primevue/usetoast';

const toaster = useToast();

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
  expectedStart: { value: '', error: '' },
  location: { value: {} as any }
});

const handleSubmit = () => {
  if (!development.value.title.value) development.value.title.error = 'Title is required';
  if (!development.value.description.value) development.value.description.error = 'Description is required';
  if (!development.value.type.value) development.value.type.error = 'Type is required';
  if (!development.value.images.value) development.value.images.error = 'Must upload at least one image';
  if (!development.value.proposedBy.value) development.value.proposedBy.error = 'Company is required';
  if (!development.value.expectedStart.value) development.value.expectedStart.error = 'Expected Start is required';

  if (
    development.value.title.error ||
    development.value.description.error ||
    development.value.type.error ||
    development.value.images.error ||
    development.value.proposedBy.error ||
    development.value.expectedStart.error
  )
    return;

  pb.collection('developments')
    .create({
      title: development.value.title.value,
      description: development.value.description.value,
      type: development.value.type.value,
      images: development.value.images.value,
      proposedBy: development.value.proposedBy.value,
      expectedStart: development.value.expectedStart.value,
      latitude: development.value.location.value.lat,
      longitude: development.value.location.value.lng
    })
    .then(() => {
      toaster.add({ severity: 'success', summary: 'Success', detail: `Development succesfully created`, life: 3000 });
      isDialogVisible.value = false;
      emit('close', true);
    })
    .catch(() => {
      toaster.add({ severity: 'error', summary: 'Error', detail: `There was a problem creating the development.`, life: 3000 });
    });
};

const open = (location: object) => {
  isDialogVisible.value = true;
  development.value = {
    title: { value: '', error: '' },
    description: { value: '', error: '' },
    type: { value: undefined, error: '' },
    images: { value: undefined, error: '' },
    proposedBy: { value: pb.authStore.model?.companyName, error: '' },
    expectedStart: { value: '', error: '' },
    location: { value: location }
  };
};
const close = () => (isDialogVisible.value = false);

defineExpose({ open, close });
</script>
