<template>
  <div id="map"></div>
  <p>stops on map {{stopsOnMap.size}}</p>
  <p>stops in bounds {{stopsInBounds.size}}</p>
  <p>{{zoomLevel}}</p>
</template>

<script setup lang="ts">
import {inject, onMounted, ref, watch} from "vue";
import L, {polyline} from "leaflet";
import {useStopsStore} from "@/stores/stops";
import Stop from "@/game/objects/Stop";

const map = ref()
const center = ref([47.23510156121514, 6.025931239128114])
const zoomLevel = ref(18)
const gameMaxZoomLevel = ref(15)

const dezoomIntervalTime = ref(10000)
const randomStopSpawnIntervalTime = ref(3000)


const stopsLayer = ref<L.LayerGroup>(new L.layerGroup())
const linesLayer = ref<L.LayerGroup>(new L.layerGroup())
const drawLinesLayer = ref<L.LayerGroup>(new L.layerGroup())

const isDrawing = ref(false)
const drawingStops = ref(new Set<Stop>())
const drawingInitialStop = ref(null)
const drawSnapDistance = ref(25) // meters

const {stopsOnMap, stopsInBounds, getStopsInBound, addStopOnMap, getClosestStopFromLatLng} = useStopsStore()

onMounted(() => {
  map.value = L.map('map', {
    preferCanvas: true,
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
  })
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map.value);
  map.value.setView(center.value, zoomLevel.value)

  // initial points load
  getStopsInBound(map.value)

  map.value.addLayer(stopsLayer.value)
  map.value.addLayer(linesLayer.value)
  map.value.addLayer(drawLinesLayer.value)

  map.value.on('zoom', e => {
    zoomLevel.value = e.target._zoom
  })

  map.value.on('mousedown', e => {
    const closestPointInfo = getClosestStopFromLatLng(map.value, [e.latlng.lat, e.latlng.lng])
    if (closestPointInfo?.stop && closestPointInfo.distance < drawSnapDistance.value) {
      console.log('snapped to ', closestPointInfo)
      isDrawing.value = true
      drawingStops.value.add(closestPointInfo?.stop)
      drawingInitialStop.value = closestPointInfo?.stop
    }

  })
  map.value.on('mousemove', e => {
    if (isDrawing.value) {
      const coords = []
      for (const stop of drawingStops.value.values()) {
        coords.push([stop.latitude, stop.longitude])
      }
      coords.push([e.latlng.lat, e.latlng.lng])
      const polyline = L.polyline(coords, { color: 'red', stroke: true, weight: 10 })
      drawLinesLayer.value.clearLayers()
      drawLinesLayer.value.addLayer(polyline)
    }
  })
  map.value.on('mouseup', e => {
    const closestPointInfo = getClosestStopFromLatLng(map.value, [e.latlng.lat, e.latlng.lng])
    if (closestPointInfo?.stop?.id != drawingInitialStop.value?.id && closestPointInfo.distance < drawSnapDistance.value) {
      console.log('snapped to ', closestPointInfo)
      const coords = []
      for (const stop of drawingStops.value.values()) {
        coords.push([stop.latitude, stop.longitude])
      }
      coords.push([e.latlng.lat, e.latlng.lng])
      const polyline = L.polyline(coords, { color: 'red', stroke: true, weight: 10 })
      linesLayer.value.addLayer(polyline)
    }

    isDrawing.value = false
    drawingStops.value.clear()
    drawingInitialStop.value = null
    drawLinesLayer.value.clearLayers()
  })

  const dezoomInterval = setInterval(() => {
    if (zoomLevel.value > gameMaxZoomLevel.value) {
      zoomLevel.value--
    }
  }, Math.random() * (dezoomIntervalTime.value - 500) + 500)

  const randomStopSpawnInterval = setInterval(() => {
    const array = Array.from(stopsInBounds.values())
    addStopOnMap(array[Math.floor(Math.random() * array.length)])
  }, randomStopSpawnIntervalTime.value)
})

watch(zoomLevel, (newZoom) => {
  if (newZoom) {
    map.value.setZoom(newZoom)
    getStopsInBound(map.value)
  }
})

watch(stopsOnMap, (stopsOnMap) => {
  for (const stop of stopsOnMap) {
    if (!stopsLayer.value.hasLayer(stop.marker)) {
      stopsLayer.value.addLayer(stop.marker)
    }
  }
})

const stop = new Stop('test 1', [47.23510156121514, 6.025931239128114])
stopsOnMap.add(stop)
const stop2 = new Stop('test 2', [47.2355, 6.0255])
stopsOnMap.add(stop2)

defineExpose({
  map,
  center,
  zoomLevel
})
</script>

<style scoped>
#map { height: 50vh}
</style>