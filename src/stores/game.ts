import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import Stop from "@/game/objects/Stop";

import stopsFromJSON from "@/assets/json/stops.json";
import L from "leaflet";


export const useGameStore = defineStore('game', () => {

  const passengers = ref()

  const dezoom = ref(false)

  return {
    passengers,
    dezoom
  }
})