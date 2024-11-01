<template>
  <LineManager ref="lineManager"/>
  <TooltipPane ref="tooltipPane"/>
  <Map ref="map"/>
  <button @click="handleZoom">Zoom+</button>
</template>

<script setup lang="ts">
import {provide, ref} from "vue";
import Map from "./Map.vue";
import LineManager from "./LineManager.vue";
import TooltipPane from "@/components/TooltipPane.vue";

const lineManager = ref()
provide('lineManager', lineManager)

const map = ref()
provide('map', map)

const tooltipPane = ref()
provide('tooltipPane', tooltipPane)

function handleZoom() {
  map.value.zoomLevel++
}

</script>