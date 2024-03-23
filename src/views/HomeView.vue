<template>
  <google-map
    api-key="AIzaSyC-mFZCyXPzuN8X_wJHOQ8qR-EitpDH1r4"
    :center="center"
    :zoom="15"
    class="w-full h-full !cursor-not-allowed"
    disable-default-ui
    @click="handleMapClick"
  >
    <marker :options="{ position: center, label: 'Hello' }" />
  </google-map>
  <span class="absolute top-6 left-10 font-black text-5xl tracking-wider">civox</span>
  <message class="absolute top-10 left-1/2 -translate-x-1/2" :closable="false" severity="secondary" v-show="isAddSelected"
    >Left click anywhere to add a development. Move around using the scroll wheel.</message
  >
  <toggle-button
    class="absolute bottom-10 right-10 w-16 h-16"
    on-label=""
    off-label=""
    :pt="{ box: 'rounded-full' }"
    v-model:model-value="isAddSelected"
  >
    <template #icon><i class="pi pi-plus text-2xl"></i></template>
  </toggle-button>
</template>

<script setup lang="ts">
import { GoogleMap, Marker } from 'vue3-google-map';
import ToggleButton from 'primevue/togglebutton';
import Message from 'primevue/message';
import { ref } from 'vue';

const API_KEY = import.meta.env.PROD ? import.meta.env.VITE_GOOGLE_MAPS_API_KEY_PROD : import.meta.env.VITE_GOOGLE_MAPS_API_KEY_DEV;
const center = { lat: 40.689247, lng: -74.044502 };

const isAddSelected = ref(false);
const mapMarkers = ref<any[]>([]);

const handleMapClick = (event: any) => {
  if (!isAddSelected) return;
  mapMarkers.value.push({ lat: event.latLng.lat(), lng: event.latLng.lng() });
  isAddSelected.value = false;
};
</script>
