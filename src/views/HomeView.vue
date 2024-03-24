<template>
  <g-map-map
    ref="googleMap"
    :center="{ lat: 40.18337107366327, lng: -92.58079673526358 }"
    :zoom="14"
    class="w-full h-full"
    @click="handleMapClick"
    @zoom_changed="handleZoomChange"
    :options="{
      disableDefaultUI: true,
      styles: [
        {
          featureType: 'poi', // Points of Interest
          elementType: 'labels', // Targeting labels of POI
          stylers: [{ visibility: 'off' }] // Hide labels
        }
      ]
    }"
  >
    <g-map-marker
      v-for="development in showMarkers ? developments : []"
      :position="{ lat: development.latitude, lng: development.longitude }"
      :label="{
        text: development.title,
        className: `translate-y-8 font-bold`
      }"
    />
    <g-map-marker
      v-for="development in showMarkers ? developments : []"
      :position="{ lat: development.latitude, lng: development.longitude }"
      :label="{
        text: categoriesToIcons[developmentTypesToCategories[development.type]],
        className: `![font-family:'Font_Awesome_5_Free'] font-black !text-white !text-xs`
      }"
      @click="developmentDetailsDialog.open(development.id)"
    />
    <g-map-marker v-if="addPosition" :position="addPosition" />
  </g-map-map>
  <span class="absolute top-6 left-10 font-black text-5xl tracking-wider">civox</span>
  <message class="absolute top-10 left-1/2 -translate-x-1/2" :closable="false" severity="secondary" v-show="isAddSelected">
    Left click anywhere to add a development
  </message>
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

enum categories {
  FOOD,
  RESIDENTIAL,
  COMMERCE,
  TRANSPORTATION,
  RECREATION,
  HEALTH,
  INDUSTRIAL,
  EDUCATION,
  ENVIRONMENTAL,
  PUBLIC_SERVICES
}

const categoriesToIcons = {
  [categories.FOOD]: '\uf2e7',
  [categories.RESIDENTIAL]: '\uf015',
  [categories.COMMERCE]: '\uf54e',
  [categories.TRANSPORTATION]: '\uf1b9',
  [categories.RECREATION]: '\uf70c',
  [categories.HEALTH]: '\uf0fa',
  [categories.INDUSTRIAL]: '\uf807',
  [categories.EDUCATION]: '\uf501',
  [categories.ENVIRONMENTAL]: '\uf4d8',
  [categories.PUBLIC_SERVICES]: '\uf66f'
};

const developmentTypesToCategories = {
  apartmentComplex: categories.RESIDENTIAL,
  singleFamilyHome: categories.RESIDENTIAL,
  condominium: categories.RESIDENTIAL,
  seniorLivingFacility: categories.HEALTH,
  restaurant: categories.FOOD,
  hotel: categories.RESIDENTIAL,
  bank: categories.COMMERCE,
  retailStore: categories.COMMERCE,
  shoppingMall: categories.COMMERCE,
  officeBuilding: categories.COMMERCE,
  factory: categories.INDUSTRIAL,
  warehouse: categories.INDUSTRIAL,
  researchLab: categories.INDUSTRIAL,
  school: categories.EDUCATION,
  hospital: categories.HEALTH,
  policeStation: categories.PUBLIC_SERVICES,
  fireStation: categories.PUBLIC_SERVICES,
  library: categories.PUBLIC_SERVICES,
  park: categories.RECREATION,
  sportsComplex: categories.RECREATION,
  recreationalCenter: categories.RECREATION,
  playground: categories.RECREATION,
  road: categories.TRANSPORTATION,
  bridge: categories.TRANSPORTATION,
  railway: categories.TRANSPORTATION,
  subway: categories.TRANSPORTATION,
  busStation: categories.TRANSPORTATION,
  airport: categories.TRANSPORTATION,
  port: categories.TRANSPORTATION,
  museum: categories.RECREATION,
  theater: categories.RECREATION,
  concertHall: categories.RECREATION,
  historicMonument: categories.PUBLIC_SERVICES,
  communityGarden: categories.ENVIRONMENTAL,
  greenRoof: categories.ENVIRONMENTAL,
  conservationArea: categories.ENVIRONMENTAL,
  wildlifeHabitat: categories.ENVIRONMENTAL,
  solarFarm: categories.ENVIRONMENTAL,
  windTurbine: categories.ENVIRONMENTAL,
  waterTreatmentPlant: categories.ENVIRONMENTAL
};

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
  addDevelopmentDialog.value.open(addPosition.value);
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
