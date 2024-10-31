<template>
  <LineManager ref="lineManager"/>
  <Map ref="map"/>
  <button @click="handleZoom">Zoom+</button>
</template>

<script setup lang="ts">
import {provide, ref} from "vue";
import Map from "./Map.vue";
import LineManager from "./LineManager.vue";

const lineManager = ref()
provide('lineManager', lineManager)

const map = ref()
provide('map', map)

function handleZoom() {
  map.value.zoomLevel++
}

</script>