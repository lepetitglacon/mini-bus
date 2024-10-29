<template>

  <div id="map"></div>
  <p>{{ stopsMarkers.size }} stops</p>
  <p>{{ zoomLevel }} zoom</p>
  <button @click="zoomLevel++">Zoom+</button>

</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import L from 'leaflet'

import 'leaflet/dist/leaflet.css'

import stopsFromJSON from './assets/json/stops.json'
console.log(stopsFromJSON)

const map = ref()
const center = ref([47.23510156121514, 6.025931239128114])
const zoomLevel = ref(18)
const bounds = ref<L.LatLngBounds|null>(null)
const stopsMarkers = new Map()

function getStopsInBound() {
  return stopsFromJSON.filter(stop => {
    if (!map.value) {
      return []
    }
    return !stopsMarkers.has(stop.id)
      && map.value?.getBounds().contains([stop.latitude, stop.longitude])
  })
}

function drawStopsMarkers() {
  for (const stop of getStopsInBound()) {
    console.log(stop)
    if (!stopsMarkers.has(stop.id)) {
      const marker = new L.Marker([stop.latitude, stop.longitude])
      marker.addTo(map.value)
      stopsMarkers.set(stop.id, marker)
    }
  }
}

onMounted(() => {

  map.value = L.map('map', {
    zoomControl: false,
    drawControl: true,
  })
  map.value.on('click', e => console.log(e));
  map.value.on('zoomstart', e => zoomLevel.value = e.target._zoom);

  map.value.setView(center.value, zoomLevel.value)
  bounds.value = map.value.getBounds()

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map.value);

  drawStopsMarkers()
})


watch(zoomLevel, newVal => {
  map.value.setZoom(newVal)
  bounds.value = map.value.getBounds()

  drawStopsMarkers()
})
</script>

<style scoped>
#map { height: 50vh}
</style>
