<template>
  <LineCreator ref="lineCreator"/>
  <Map ref="map"/>
  <button @click="handleZoom">Zoom+</button>
</template>

<script setup lang="ts">
import {provide, ref} from "vue";
import Map from "./Map.vue";
import LineCreator from "./LineCreator.vue";

const lineCreator = ref()
provide('lineCreator', lineCreator)

const map = ref()
provide('map', map)

function handleZoom() {
  map.value.zoomLevel++
}

</script>