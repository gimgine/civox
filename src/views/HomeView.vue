<template>
  <g-map-map
    ref="googleMap"
    :center="{ lat: 40.18337107366327, lng: -92.58079673526358 }"
    :zoom="14"
    class="w-full h-full"
    @click="handleMapClick"
    @zoom_changed="handleZoomChange"
    :options="{ disableDefaultUI: true }"
  >
    <g-map-marker
      v-for="development in showMarkers ? developments : []"
      :position="{ lat: development.latitude, lng: development.longitude }"
      :icon="{
        url: '/favicon.ico',
        labelOrigin: { x: 16, y: -10 }
      }"
      :label="development.title"
      @click="developmentDetailsDialog.open(development.id)"
    />
    <g-map-marker v-if="addPosition" :position="addPosition" />
  </g-map-map>
  <span class="absolute top-6 left-10 font-black text-5xl tracking-wider">civox</span>
  <message class="absolute top-10 left-1/2 -translate-x-1/2" :closable="false" severity="secondary" v-show="isAddSelected">
    Left click anywhere to add a development
  </message>
  <prime-button class="absolute top-6 right-10" label="Sign In" @click="$router.push({ name: 'login' })" />
  <toggle-button
    class="absolute bottom-10 right-10 w-16 h-16"
    on-label=""
    off-label=""
    :pt="{ box: 'rounded-full' }"
    v-model:model-value="isAddSelected"
  >
    <template #icon><i class="pi pi-plus text-2xl"></i></template>
  </toggle-button>
  <add-development-dialog ref="addDevelopmentDialog" @close="handleAddClose" />
  <development-details-dialog ref="developmentDetailsDialog" />
</template>

<script setup lang="ts">
import AddDevelopmentDialog from '@/components/AddDevelopmentDialog.vue';
import DevelopmentDetailsDialog from '@/components/DevelopmentDetailsDialog.vue';
import ToggleButton from 'primevue/togglebutton';
import PrimeButton from 'primevue/button';
import Message from 'primevue/message';
import { onMounted, ref } from 'vue';
import pb from '@/util/pocketbase';
import type { DevelopmentsResponse } from '@/util/pocketbase-types';

const developmentDetailsDialog = ref({} as InstanceType<typeof DevelopmentDetailsDialog>);
const googleMap = ref();
const addDevelopmentDialog = ref();
const showMarkers = ref(true);
const isAddSelected = ref(false);
const addPosition = ref<object | null>(null);
const developments = ref<DevelopmentsResponse[]>([]);

const handleMapClick = (event: any) => {
  if (!isAddSelected.value) return;
  addPosition.value = { lat: event.latLng.lat(), lng: event.latLng.lng() };
  googleMap.value.panTo(addPosition.value);
  addDevelopmentDialog.value.open();
  isAddSelected.value = false;
};

const handleZoomChange = (zoom: number) => {
  showMarkers.value = zoom >= 13;
};

const handleAddClose = async (submitted: boolean) => {
  addPosition.value = null;
  if (submitted) developments.value = await pb.collection('developments').getFullList();
};

onMounted(async () => {
  developments.value = await pb.collection('developments').getFullList();
});
</script>
