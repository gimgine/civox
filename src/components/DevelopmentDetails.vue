<template>
  <prime-dialog class="w-1/3" v-model:visible="isVisible" :header="development?.title" position="left">
    <prime-carousel :value="imageUrls" :num-visible="2">
      <template #item="slotProps">
        <div class="flex items-center justify-center">
          <prime-image :src="slotProps.data" preview />
        </div>
      </template>
    </prime-carousel>

    <div class="flex flex-col gap-3">
      <label class="text-xs" for="description">Description</label>
      <p id="description">{{ development?.description }}</p>

      <div class="flex gap-5">
        <div>
          <label class="text-xs" for="proposedBy">Proposed by</label>
          <p id="proposedBy">{{ development?.proposedBy }}</p>
        </div>
        <div>
          <label class="text-xs" for="expectedStart">Expected Start Date</label>
          <p id="expectedStart">{{ formatDateMonthYear(development?.expectedStart ?? '') }}</p>
        </div>
      </div>
    </div>
  </prime-dialog>
</template>

<script setup lang="ts">
import PrimeDialog from 'primevue/dialog';
import PrimeCarousel from 'primevue/carousel';
import PrimeImage from 'primevue/image';
import pb from '@/util/pocketbase';
import { onMounted, ref } from 'vue';
import type { DevelopmentsResponse } from '@/util/pocketbase-types';
import { formatDateMonthYear } from '@/util/dates';

const isVisible = ref(true);
const development = ref<DevelopmentsResponse>();
const imageUrls = ref<string[]>([]);

onMounted(() => {
  pb.collection('developments')
    .getFirstListItem('id="r3pd3w95pqx1o31"')
    .then((res) => {
      development.value = res;
      res.images.forEach((img) => {
        imageUrls.value.push(pb.getFileUrl(res, img));
      });
    });
});
</script>
