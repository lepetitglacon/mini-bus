<template>
  <div id="map"></div>

  <div style="height: 200px; line-break: anywhere">
    <pre v-if="isDrawing">{{drawingLine}}</pre>
    <pre v-if="isDrawing">{{ drawingCurrentStop }}</pre>
  </div>

  <p>stops on map {{stopsOnMap.size}}</p>
  <p>stops in bounds {{stopsInBounds.size}}</p>
  <p>{{zoomLevel}}</p>
</template>

<script setup lang="ts">
import {inject, onMounted, ref, watch} from "vue";
import L, {polyline} from "leaflet";
import {useStopsStore} from "@/stores/stops";
import Stop from "@/game/objects/Stop";
import {useGameStore} from "@/stores/game";

const map = ref()
const center = ref([47.23510156121514, 6.025931239128114])
const zoomLevel = ref(18)
const gameMaxZoomLevel = ref(15)

const dezoomIntervalTime = ref(10000)
const randomStopSpawnIntervalTime = ref(1000)

const stopsLayer = ref<L.LayerGroup>(new L.layerGroup())
const linesLayer = ref<L.LayerGroup>(new L.layerGroup())
const drawLinesLayer = ref<L.LayerGroup>(new L.layerGroup())

const lineManager = inject('lineManager')

const drawSnapDistance = ref(10) // meters
const isDrawing = ref(false)
const isModifying = ref(false)
const drawingLine = ref(null)
const drawingStops = ref(new Set<Stop>())
const drawingCurrentStop = ref(null)

const {stopsOnMap, stopsInBounds, getStopsInBound, addStopOnMap, getClosestStopFromLatLng} = useStopsStore()
const {dezoom} = useGameStore()

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
    const line = lineManager.value.getFreeLine()
    if (line) {
      const closestPointInfo = getClosestStopFromLatLng(map.value, [e.latlng.lat, e.latlng.lng])
      if (closestPointInfo?.stop && closestPointInfo.distance < drawSnapDistance.value) {
        console.log('mousedown snapped to ', closestPointInfo)
        isDrawing.value = true
        drawingLine.value = line
        line.stops.add(closestPointInfo?.stop)
      }
    } else {
      console.info('No line left to draw')
    }
  })
  map.value.on('mousemove', e => {
    if (isDrawing.value) {
      const closestPointInfo = getClosestStopFromLatLng(map.value, [e.latlng.lat, e.latlng.lng])
      if (!closestPointInfo.stop) {
        return
      }
      if (closestPointInfo.distance < drawSnapDistance.value) {
        if (closestPointInfo.stop !== drawingCurrentStop.value) {
          if (drawingLine.value.stops.has(closestPointInfo?.stop)) {
            if (Array.from(drawingLine.value.stops.values())[0] !== closestPointInfo?.stop) {
              drawingLine.value.stops.delete(closestPointInfo?.stop)
            }
          } else {
            drawingLine.value.stops.add(closestPointInfo?.stop)
          }
          drawingCurrentStop.value = closestPointInfo.stop
        }
      } else {
        drawingCurrentStop.value = null
      }

      const polyline = drawingLine.value.getPolyline()
      polyline.getLatLngs().push([e.latlng.lat, e.latlng.lng])

      drawLinesLayer.value.clearLayers()
      drawLinesLayer.value.addLayer(polyline)
    }
  })
  map.value.on('mouseup', e => {
    if (isDrawing.value) {
      const closestPointInfo = getClosestStopFromLatLng(map.value, [e.latlng.lat, e.latlng.lng])
      if (
          closestPointInfo?.stop
          && closestPointInfo.distance < drawSnapDistance.value
      ) {
        console.log('mouseup snapped to ', closestPointInfo)
        if (closestPointInfo?.stop.id === Array.from(drawingLine.value.stops.values())[0].id) {
          drawingLine.value.loop = true
        }
      }

      const line = drawingLine.value
      drawingLine.value.lineOnMap = drawingLine.value.getPolyline()
      drawingLine.value.lineOnMap.on('mousedown', e => {
        console.log(e, line)
        drawingLine.value = line
        isModifying.value = true
      })
      linesLayer.value.addLayer(drawingLine.value.lineOnMap)
      drawLinesLayer.value.clearLayers()

      if (drawingLine.value.stops.size > 1) {
        drawingLine.value.active = true
      } else {
        drawingLine.value.resetFromDrawing()
      }

      isDrawing.value = false
      drawingLine.value = null
      drawingCurrentStop.value = null
    }
  })

  const dezoomInterval = setInterval(() => {
    if (zoomLevel.value > gameMaxZoomLevel.value && dezoom) {
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