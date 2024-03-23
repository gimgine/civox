<template>
  <google-map :api-key="API_KEY" :center="center" :zoom="15" class="w-full h-full" disable-default-ui>
    <marker :options="{ position: center }" />
  </google-map>
  <span class="absolute top-6 left-10 font-black text-5xl tracking-wider">civox</span>
</template>

<script setup lang="ts">
import { GoogleMap, Marker } from 'vue3-google-map';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const center = { lat: 40.689247, lng: -74.044502 };
</script>
