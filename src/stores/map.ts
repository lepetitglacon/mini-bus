import {ref, computed, onMounted} from 'vue'
import { defineStore } from 'pinia'
import L from "leaflet";

export const useMapStore = defineStore('map', () => {
  const map = ref()

  onMounted(() => {
    map.value = L.map('map', {
      preferCanvas: true,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
    })
  })

  return {
    map
  }
})