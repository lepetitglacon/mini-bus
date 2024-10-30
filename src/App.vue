<template>
  <Engine/>
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

import Engine from "@/components/Engine.vue";

function drawStopsMarkers() {
  getStopsInBound()
  for (const stop of stopsInBounds.values()) {
    if (!stopsInMap.has(stop)) {
      const marker = new L.Marker([stop.latitude, stop.longitude])
      stop.marker = marker
      marker.addTo(map.value)
      stopsInMap.add(stop)
    }
  }
}

function getClosestMarker(latlng) {
  let closestStop = null
  let closestDistance = Number.MAX_VALUE
  for (const [key, stop] of stopsInMap.entries()) {
    const stopPoint = turf.point([stop.latitude, stop.longitude])
    const distance = turf.distance(latlng, stopPoint, 'meters')
    console.log(distance)
    if (distance < closestDistance) {
      closestDistance = distance
      closestStop = stop
    }
  }
  return {
    stop: closestStop,
    distance: closestDistance
  }
}
</script>

<style scoped>

</style>
