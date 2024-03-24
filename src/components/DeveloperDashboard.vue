<template>
  <confirm-popup />
  <prime-dialog header="Developer Dashboard" v-model:visible="visible" @hide="emits('dialog-close')">
    <div v-show="isLoading" class="flex items-center justify-center h-full">
      <progress-spinner class="h-20" stroke-width="5" :pt="{ circle: '!stroke-[var(--primary-color)]' }" />
    </div>
    <data-table v-show="!isLoading" :value="tableData" striped-rows removable-sort paginator :rows="10" :rows-per-page-options="[10, 25, 50]">
      <column header="Actions">
        <template #body="slotProps">
          <div class="flex gap-2">
            <prime-button
              icon="pi pi-map"
              rounded
              class="w-8 h-8"
              @click="
                () => {
                  emits('locate', {
                    id: slotProps.data.id,
                    longitude: slotProps.data.longitude,
                    latitude: slotProps.data.latitude
                  });
                  visible = false;
                }
              "
            />
            <prime-button icon="pi pi-times" severity="danger" rounded class="w-8 h-8" @click="confirmDelete($event, slotProps.data.id)" />
          </div>
        </template>
      </column>
      <column v-for="c in columns" :key="c.field" :field="c.field" :header="c.header" />
    </data-table>
  </prime-dialog>
</template>

<script setup lang="ts">
import pb from '@/util/pocketbase';
import { FeedbackVoteOptions } from '@/util/pocketbase-types';
import ProgressSpinner from 'primevue/progressspinner';
import ConfirmPopup from 'primevue/confirmpopup';
import DataTable from 'primevue/datatable';
import PrimeButton from 'primevue/button';
import Column from 'primevue/column';
import PrimeDialog from 'primevue/dialog';
import { ref } from 'vue';
import { formatDateMonthYear } from '@/util/dates';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';

const visible = ref(false);
const isLoading = ref(false);
const confirm = useConfirm();
const toast = useToast();

const open = () => {
  visible.value = true;
  reload();
};
defineExpose({ open });

const emits = defineEmits<{ (e: 'locate', data: { id: string; longitude: number; latitude: number }): void; (e: 'dialog-close'): void }>();

const tableData = ref<
  {
    title: string;
    feedbackAmount: number;
    approvalRating: string;
    expectedStart: string;
    id: string;
    latitude: number;
    longitude: number;
  }[]
>([]);

const columns: { field: string; header: string }[] = [
  { field: 'title', header: 'Title' },
  { field: 'expectedStart', header: 'Expected Start' },
  { field: 'feedbackAmount', header: 'Responses' },
  { field: 'approvalRating', header: 'Approval Rating' }
];

const reload = async () => {
  tableData.value = [];
  isLoading.value = true;

  const developmentsResponse = await pb
    .collection('developments')
    .getFullList({ filter: `proposedBy="${pb.authStore.model?.companyName}"`, requestKey: null });

  for (const dev of developmentsResponse) {
    const feedbackResponse = await pb.collection('feedback').getFullList({ filter: `development="${dev.id}"`, requestKey: null });

    let numYay = 0;
    feedbackResponse.forEach((f) => {
      if (f.vote === FeedbackVoteOptions.yay) {
        numYay++;
      }
    });
    let decimal = numYay / feedbackResponse.length;

    const title = dev.title;
    const feedbackAmount = feedbackResponse.length;
    const approvalRating = feedbackAmount > 0 ? `${Math.floor(decimal * 100)}%` : '---';
    const expectedStart = formatDateMonthYear(dev.expectedStart);
    const id = dev.id;
    const latitude = dev.latitude;
    const longitude = dev.longitude;

    tableData.value.push({ title, feedbackAmount, approvalRating, expectedStart, id, latitude, longitude });
  }

  isLoading.value = false;
};

const confirmDelete = (event: any, developmentId: string) => {
  confirm.require({
    target: event.currentTarget,
    message: 'Do you want to delete this record?',
    icon: 'pi pi-info-circle',
    rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
    acceptClass: 'p-button-danger p-button-sm',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    accept: () => {
      pb.collection('developments')
        .delete(developmentId)
        .then(() => {
          toast.add({ severity: 'success', summary: 'Deleted', detail: 'Development was deleted.', life: 3000 });
          reload();
        })
        .catch(() => {
          toast.add({ severity: 'error', summary: 'Error', detail: 'Something went wrong trying to delete.', life: 3000 });
        });
    }
  });
};
</script>
