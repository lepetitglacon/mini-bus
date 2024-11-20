import {ref, computed, type Ref} from 'vue'
import { defineStore } from 'pinia'
import * as turf from '@turf/turf'
import Stop from "@/game/objects/Stop";

import stopsFromJSON from "@/assets/json/stops.json";
import L from "leaflet";
import Passenger from "@/game/objects/Passenger";
import {useLinesStore} from "@/stores/lines";
import {useGameStore} from "@/stores/game";
import {useStopsStore} from "@/stores/stops";

export const usePassengerStore = defineStore('passengers', () => {

  const lineStore = useLinesStore()
  const gameStore = useGameStore()
  const stopsStore = useStopsStore()

  const passengers: Ref<Set<Passenger>> = ref(new Set())
  const passengerSpawnRate = ref(1000)
  const passengerSpawnRateMax = ref(passengerSpawnRate.value * 2)

  // spawn passengers at stops
  setInterval(() => {
    console.log('passenger spawn')
    if (stopsStore.stopsOnMap.size > 1 && gameStore.state !== gameStore.gameStates.GAME_OVER) {
      const stops = Array.from(stopsStore.stopsOnMap.values())
      const randomStop = stops[Math.floor(Math.random() * stops.length)]
      stops.splice(stops.indexOf(randomStop), 1)
      const passenger = new Passenger(stops[Math.floor(Math.random() * stops.length)])
      passengers.value.add(passenger)
      randomStop.passengers.add(passenger)
      randomStop.marker?.fireEvent('game/stop/updateUi')
    }
  }, Math.random() * (passengerSpawnRate.value - passengerSpawnRateMax.value) + passengerSpawnRateMax.value)

  const reset = () => {
    passengers.value.clear()
  }

  return {
    reset,

    passengers,
    passengerSpawnRate,
  }
})