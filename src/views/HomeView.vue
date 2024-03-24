<template>
  <div class="absolute flex justify-between items-center top-0 left-0 w-full z-10 py-4 px-8">
    <span class="font-black text-4xl tracking-wider text-[var(--text-color)]">civox</span>
    <prime-button severity="secondary" icon="pi pi-bars text-xl" raised text size="small" class="bg-white" @click="isSidebarOpen = true" />
  </div>
  <sidebar v-model:visible="isSidebarOpen" position="right" :modal="false" :dismissable="false" @hide="developmentFilter = ''">
    <div class="flex flex-col h-full py-1">
      <div class="flex gap-2 flex-1 flex-col h-full">
        <label>Search Developments</label>
        <input-group>
          <auto-complete
            v-model="developmentFilter"
            :suggestions="filteredDevelopments"
            field="title"
            @complete="filterDevelopments"
            @item-select="(e) => handleMarkerClick(e.value)"
          />
          <input-group-addon><i class="pi pi-search"></i></input-group-addon>
        </input-group>
        <label>Filter Categories</label>
        <multi-select
          v-model="activeCategories"
          :options="Object.values(categories)"
          placeholder="No Categories Selected"
          :max-selected-labels="Object.keys(categories).length - 1"
          selected-items-label="All Selected"
        />
      </div>
      <prime-button v-if="!pb.authStore.isValid" label="Sign In" @click="$router.push({ name: 'login' })" icon="pi pi-sign-in" size="small" />
      <prime-button v-if="pb.authStore.isValid" label="Sign Out" @click="signOut" icon="pi pi-sign-in" size="small" />
    </div>
  </sidebar>
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
      @click="handleMarkerClick(development)"
    />
    <g-map-marker v-if="addPosition" :position="addPosition" />
  </g-map-map>
  <message class="absolute top-20 left-1/2 -translate-x-1/2" :closable="false" severity="secondary" v-show="isAddSelected">
    Left click anywhere to add a development
  </message>
  <toggle-button
    class="absolute bottom-10 right-10 w-16 h-16"
    on-label=""
    off-label=""
    :pt="{ box: 'rounded-full shadow-md' }"
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
import Sidebar from 'primevue/sidebar';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import AutoComplete from 'primevue/autocomplete';
import MultiSelect from 'primevue/multiselect';
import { onMounted, ref, watch } from 'vue';
import pb from '@/util/pocketbase';
import type { DevelopmentsResponse } from '@/util/pocketbase-types';
import { DevelopmentsTypeOptions } from '@/util/pocketbase-types';

enum categories {
  FOOD = 'Food',
  RESIDENTIAL = 'Residential',
  COMMERCE = 'Commerce',
  TRANSPORTATION = 'Transportation',
  RECREATION = 'Recreation',
  HEALTH = 'Health',
  INDUSTRIAL = 'Industrial',
  EDUCATION = 'Education',
  ENVIRONMENTAL = 'Environmental',
  PUBLIC_SERVICES = 'Public Services'
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
} as object & { [key: string]: any };

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
} as object & { [key: string]: any };

const developmentDetailsDialog = ref({} as InstanceType<typeof DevelopmentDetailsDialog>);
const googleMap = ref();
const addDevelopmentDialog = ref();
const showMarkers = ref(true);
const isAddSelected = ref(false);
const addPosition = ref<object | null>(null);
const developments = ref<DevelopmentsResponse[]>([]);
const developmentFilter = ref('');
const filteredDevelopments = ref<DevelopmentsResponse[]>([]);
const isSidebarOpen = ref(false);
const activeCategories = ref(Object.values(categories));

const signOut = () => {
  pb.authStore.clear();
  window.location.reload();
};

const handleMapClick = (event: any) => {
  if (!isAddSelected.value) return;
  addPosition.value = { lat: event.latLng.lat(), lng: event.latLng.lng() };
  googleMap.value.panTo(addPosition.value);
  addDevelopmentDialog.value.open(addPosition.value);
  isAddSelected.value = false;
};

const handleMarkerClick = (development: DevelopmentsResponse) => {
  developmentDetailsDialog.value.open(development.id);
  googleMap.value.panTo({ lat: development.latitude, lng: development.longitude });
};

const filterDevelopments = async (event: any) => {
  filteredDevelopments.value = await pb.collection('developments').getFullList({ filter: `title~'${event.query}'` });
};

const handleZoomChange = (zoom: number) => {
  showMarkers.value = zoom >= 13;
};

const handleAddClose = async (submitted: boolean) => {
  addPosition.value = null;
  if (submitted) developments.value = await pb.collection('developments').getFullList();
};

watch(activeCategories, async (value) => {
  if (!value.length) {
    developments.value = [];
    return;
  }
  developments.value = await pb.collection('developments').getFullList({
    filter: Object.keys(DevelopmentsTypeOptions)
      .filter((val) => value.includes(developmentTypesToCategories[val]))
      .map((val) => `type='${val}'`)
      .join('||'),
    requestKey: null
  });
});

onMounted(async () => {
  developments.value = await pb.collection('developments').getFullList();
});
</script>
