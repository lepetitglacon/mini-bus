import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as turf from '@turf/turf'
import Stop from "@/game/objects/Stop";

import stopsFromJSON from "@/assets/json/stops.json";
import L from "leaflet";
import Passenger from "@/game/objects/Passenger";
import type Line from "@/game/objects/Line";


export const useLinesStore = defineStore('lines', () => {

  const lines = ref(new Set<Line>())

  function linesAsArray() {
    return Array.from(lines.value.values())
  }

  function getFreeLine() {
    for (const line of lines.value.values()) {
      if (!line.active) {
        return line
      }
    }
    return null
  }

  return {
    lines,
    linesAsArray,
    getFreeLine
  }
})