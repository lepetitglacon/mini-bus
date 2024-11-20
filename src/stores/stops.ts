import {ref, computed, type Ref} from 'vue'
import { defineStore } from 'pinia'
import * as turf from '@turf/turf'
import Stop from "@/game/objects/Stop";

import stopsFromJSON from "@/assets/json/stops.json";
import L from "leaflet";
import Passenger from "@/game/objects/Passenger";
import {useLinesStore} from "@/stores/lines";
import {useGameStore} from "@/stores/game";

export const useStopsStore = defineStore('stops', () => {

  const lineStore = useLinesStore()
  const gameStore = useGameStore()

  const stops = ref(new Set<Stop>())
  const stopsInBounds = ref(new Set<Stop>())
  const stopsOnMap = ref(new Set<Stop>())

  const reset = () => {
    for (const stop of stops.value) {
      stop.passengers.clear()
    }

    stopsOnMap.value.clear()
  }

  // load stops from json
  for (const stopJSON of stopsFromJSON) {
    const stop = new Stop(
        stopJSON.id,
        [
          stopJSON.latitude,
          stopJSON.longitude
        ],
        stopJSON.nom
    )
    stops.value.add(stop)
  }

  function getStopsInBound(map: L.Map) {
    for (const stop of Array.from(stops.value.values())) {
      if (map.getBounds().contains([stop.latitude, stop.longitude])
      ) {
        stopsInBounds.value.add(stop)
      }
    }
  }

  function addStopOnMap(stop: Stop) {
    if (!stopsOnMap.value.has(stop)) {
      stopsOnMap.value.add(stop)
    } else {
      // console.log(stop, 'already on map')
    }
  }

  function getClosestStopFromLatLng(map: L.Map, latlng: Number[]) {
    const latlngPoint = turf.point(latlng)
    let closestStop = null
    let closestDistance = Number.MAX_VALUE
    for (const stop of stopsOnMap.value) {
      const distance = turf.distance(turf.point([stop.latitude, stop.longitude]), latlngPoint) * 1000
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

  return {
    reset,

    stopsFromJSON,
    stops,
    stopsInBounds,
    stopsOnMap,

    getStopsInBound,
    addStopOnMap,
    getClosestStopFromLatLng,
  }
})