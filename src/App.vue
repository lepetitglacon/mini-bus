<template>

  <div id="map"></div>
  <p>{{ stopsInMap.size }} stops</p>
  <p>{{ zoomLevel }} zoom</p>
  <button @click="zoomLevel++">Zoom+</button>

</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import * as turf from 'turf'
import L from 'leaflet'

// leaflet plugins
import 'leaflet-draw';

// assets
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css';

// data
import stopsFromJSON from './assets/json/stops.json'
import {Stop} from "@/game/Stop";

console.log(stopsFromJSON)

const map = ref()
const center = ref([47.23510156121514, 6.025931239128114])
const zoomLevel = ref(18)
const bounds = ref<L.LatLngBounds|null>(null)
const drawnItems = new L.FeatureGroup();
const stops = new Set()
const stopsInMap = new Set()

for (const stopJSON of stopsFromJSON) {
	const stop = new Stop(stopJSON.id)

	// TODO fill stop info

	stops.add(stop)
}

function getStopsInBound() {
  return Array.from(stops.values()).filter(stop => {
    if (!map.value) {
      return []
    }
    return !stopsInMap.has(stop.id)
      && map.value?.getBounds().contains([stop.latitude, stop.longitude])
  })
}

function drawStopsMarkers() {
  for (const stop of getStopsInBound()) {
    console.log(stop)
    if (!stopsInMap.has(stop.id)) {
      const marker = new L.Marker([stop.latitude, stop.longitude])
      marker.addTo(map.value)
      stopsInMap.set(stop.id, marker)
    }
  }
}

function getClosestMarker(latlng) {
	const currentClickPoint = turf.point(latlng)
	for (const [key, stop] of stopsInMap.entries()) {
		console.log(stop)
		const stopPoint = turf.point([stop.latitude, stop.longitude])
		const distance = turf.distance(latlng)
		console.log(distance)
	}


	return {
		position: [latlng.lat, latlng.lng],
		distance: 0
	}
}

onMounted(() => {

  map.value = L.map('map', {
    zoomControl: false,
    drawControl: true,
  })
  map.value.on('click', e => {
	  console.log(e)

	  if (getClosestMarker([e.latlng.lat, e.latlng.lng]).distance < 0.5) {

	  }


  });
  map.value.on('zoomstart', e => zoomLevel.value = e.target._zoom);
	map.value.on(L.Draw.Event.CREATED, (e) => {
		const layer = e.layer;
		drawnItems.addLayer(layer); // Add the new layer to drawnItems
	});

	map.value.addLayer(drawnItems);


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
