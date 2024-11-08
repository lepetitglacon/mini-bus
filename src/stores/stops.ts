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

  const passengers: Ref<Set<Passenger>> = ref(new Set())
  const passengerSpawnRate = ref(1000)
  const passengerSpawnRateMax = ref(passengerSpawnRate.value * 2)

  const reset = () => {
    passengers.value.clear()

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

  // spawn passengers at stops
  setInterval(() => {
    if (stopsOnMap.value.size > 1 && gameStore.state !== gameStore.gameStates.GAME_OVER) {
      const stops = Array.from(stopsOnMap.value.values())
      const randomStop = stops[Math.floor(Math.random() * stops.length)]
      stops.splice(stops.indexOf(randomStop), 1)

      const passenger = new Passenger(stops[Math.floor(Math.random() * stops.length)])
      passengers.value.add(passenger)
      randomStop.passengers.add(passenger)
      randomStop.marker?.fireEvent('game/stop/updateUi')
    }
  }, Math.random() * (passengerSpawnRate.value - passengerSpawnRateMax.value) + passengerSpawnRateMax.value)

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

  function getDestinationGraph() {
    const graph = {}
    for (const stop of stopsOnMap.value) {
      for (const line of lineStore.lines) {
        const stops = line.getStopsAsArray()

        if (line.stops.has(stop)) {
          if (!graph[stop.id]) {
            graph[stop.id] = []
          }

          const index = stops.indexOf(stop)
          if (line.loop) {
            graph[stop.id].push()
          } else {
            if (index === stops.length - 1) {
              graph[stop.id].push({
                stop: stops[index - 1],
                time: turf.distance(
                    [stop.latitude, stop.longitude],
                    [stops[index - 1].latitude, stops[index - 1].longitude]
                )
              })
            } else if (index === 0) {
              graph[stop.id].push({
                stop: stops[index + 1],
                time: turf.distance(
                    [stop.latitude, stop.longitude],
                    [stops[index + 1].latitude, stops[index + 1].longitude]
                )
              })
            } else {
              graph[stop.id].push({
                stop: stops[index + 1],
                time: turf.distance(
                    [stop.latitude, stop.longitude],
                    [stops[index + 1].latitude, stops[index + 1].longitude]
                )
              })
              graph[stop.id].push({
                stop: stops[index - 1],
                time: turf.distance(
                    [stop.latitude, stop.longitude],
                    [stops[index - 1].latitude, stops[index - 1].longitude]
                )
              })
            }
          }
        }
      }
    }
    return graph
  }

  function findShortestPathFromStopIds(graph: object, start: string, end: string) {
    const distances = {};
    const previousStops = {};
    const queue = new Set();

    // Initialize distances and queue
    for (const stop in graph) {
      distances[stop] = Infinity;
      previousStops[stop] = null;
      queue.add(stop);
    }
    distances[start] = 0;

    while (queue.size) {
      // Get the stop with the smallest distance in queue
      let currentStop = null;
      for (const stop of queue) {
        if (currentStop === null || distances[stop] <= distances[currentStop]) {
          currentStop = stop;
        }
      }

      // If the destination stop is reached, break
      if (currentStop === end) break;
      queue.delete(currentStop);

      // Update distances for each neighbor
      for (const neighbor of graph[currentStop]) {
        const alternate = distances[currentStop] + neighbor.time;
        if (alternate < distances[neighbor.destination]) {
          distances[neighbor.destination] = alternate;
          previousStops[neighbor.destination] = { stop: currentStop, line: neighbor.line };
        }
      }
    }

    // Reconstruct path from start to end
    const path = [];
    let stop = end;
    while (stop) {
      path.push(stop);
      stop = previousStops[stop] && previousStops[stop].stop;
    }

    return path.reverse();
  }

  return {
    reset,

    stops,
    stopsInBounds,
    stopsOnMap,

    passengers,
    passengerSpawnRate,

    getStopsInBound,
    addStopOnMap,
    getClosestStopFromLatLng,
    getDestinationGraph,
    findShortestPathFromStopIds
  }
})