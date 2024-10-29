<template>

  <div id="map"></div>
  <button @click="zoomLevel++">Zoom+</button>

</template>

<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import L from 'leaflet'

import 'leaflet/dist/leaflet.css'

import stopsFromJSON from './assets/json/stops.json'
console.log(stopsFromJSON)

const map = ref()
const center = ref([47.25, 6.03333])
const zoomLevel = ref(13)

onMounted(() => {

  map.value = L.map('map', {
    drawControl: true
  })
  map.value.setView(center.value, zoomLevel.value)

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map.value);

})


watch(zoomLevel, newVal => map.value.setView(center.value, newVal))
</script>

<style scoped>
#map { height: 50vh; width: 100vw }
</style>
