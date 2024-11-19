<template>

  <div class="container">

    <div class="">

      <div id="map"></div>
      <StopComponent v-for="stop of stopsOnMap" :stop="stop" :map="map"/>

    </div>

  </div>


</template>

<script setup lang="ts">
import {inject, onMounted, ref, watch} from "vue";
import L, {polyline} from "leaflet";
import {useStopsStore} from "@/stores/stops";
import Stop from "@/game/objects/Stop";
import {default as StopComponent}  from "@/components/stop/Stop.vue";
import {useGameStore} from "@/stores/game";
import {useLinesStore} from "@/stores/lines";
import type Line from "@/game/objects/Line";
import LineManager from "@/components/ui/LineManager.vue";
import Passengers from "@/components/Passengers/Passengers.vue";
import WeekDay from "@/components/ui/WeekDay.vue";
import PassengersManager from "@/game/manager/PassengersManager";
import UnlockModal from "@/components/ui/UnlockModal.vue";
import Shop from "@/components/ui/Shop.vue";

const map = ref()
const center = ref([47.23510156121514, 6.025931239128114])
const zoomLevel = ref(18)
const gameMaxZoomLevel = ref(15)

const dezoomIntervalTime = ref(10000)
const randomStopSpawnIntervalTime = ref(1000)

const stopsLayer = ref<L.LayerGroup>(new L.layerGroup())
const linesLayer = ref<L.LayerGroup>(new L.layerGroup())
const drawLinesLayer = ref<L.LayerGroup>(new L.layerGroup())

const drawSnapDistance = ref(10) // meters
const isDrawing = ref(false)
const drawingLine = ref<Line|null>(null)
const drawingCurrentStop = ref<Stop|null>(null)
const isModifying = ref(false)
const modifyingInfo = ref(null)

const {stopsFromJSON, stopsOnMap, stopsInBounds, getStopsInBound, addStopOnMap, getClosestStopFromLatLng} = useStopsStore()
const gameStore = useGameStore()
const lineStore = useLinesStore()
const stopStore = useStopsStore()

const passengerManager = new PassengersManager()

onMounted(() => {
  map.value = L.map('map', {
    preferCanvas: true,
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
  })
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map.value);
  map.value.setView(center.value, zoomLevel.value)

  // initial points load
  getStopsInBound(map.value)

  map.value.addLayer(stopsLayer.value)
  map.value.addLayer(linesLayer.value)
  map.value.addLayer(drawLinesLayer.value)

  map.value.on('zoom', e => {
    zoomLevel.value = e.target._zoom
  })

  map.value.on('mousedown', e => {
    const line = lineStore.getFreeLine()
    if (line) {
      const closestPointInfo = getClosestStopFromLatLng(map.value, [e.latlng.lat, e.latlng.lng])
      console.log(closestPointInfo)
      if (closestPointInfo?.stop && closestPointInfo.distance < drawSnapDistance.value) {
        console.log('mousedown snapped to ', closestPointInfo)
        isDrawing.value = true
        drawingLine.value = line
        line.stops.add(closestPointInfo?.stop)
      }
    } else {
      console.info('No line left to draw')
    }
  })
  map.value.on('mousemove', e => {
    if (!isDrawing.value && !isModifying.value) {
      return
    }
    if (!drawingLine.value) {
      return console.log('No drawing line')
    }
    const closestPointInfo = getClosestStopFromLatLng(map.value, [e.latlng.lat, e.latlng.lng])
    if (!closestPointInfo.stop) {
      return console.log('No closest point')
    }

    if (closestPointInfo.distance < drawSnapDistance.value) {
      if (closestPointInfo.stop !== drawingCurrentStop.value) {

        if (drawingLine.value.stops.has(closestPointInfo?.stop)) {
          if (Array.from(drawingLine.value.stops.values())[0] !== closestPointInfo?.stop || isModifying.value) {
            drawingLine.value.stops.delete(closestPointInfo?.stop)
            if (isModifying.value) {
              const closestSegmentInfo = drawingLine.value.findClosestSegment([e.latlng.lat, e.latlng.lng])
              modifyingInfo.value = closestSegmentInfo
            }
          }
        } else {
          if (isModifying.value) {
            const newSetArray = Array.from(drawingLine.value.stops.values())
            newSetArray.splice(modifyingInfo.value.index2, 0, closestPointInfo.stop)
            drawingLine.value.stops = new Set(newSetArray)
          } else {
            drawingLine.value.stops.add(closestPointInfo?.stop)
          }
        }

        drawingCurrentStop.value = closestPointInfo.stop
      }
    } else {
      drawingCurrentStop.value = null
    }

    const polyline = drawingLine.value.getPolyline()
    if (isModifying.value) {
      if (drawingLine.value.loop) {
        polyline.getLatLngs().push(polyline.getLatLngs()[0])
      }
      // on refait l'ordre du set
      if (!modifyingInfo.value) {
        const closestSegmentInfo = drawingLine.value.findClosestSegment([e.latlng.lat, e.latlng.lng])
        modifyingInfo.value = closestSegmentInfo
      }
      if (modifyingInfo.value.index2 > 0) {
        polyline.getLatLngs().splice(modifyingInfo.value.index2, 0, [e.latlng.lat, e.latlng.lng])
      } else {
        polyline.getLatLngs().push([e.latlng.lat, e.latlng.lng])
      }
    } else {
      // on ajoute le curseur actuel à la fin des points
      polyline.getLatLngs().push([e.latlng.lat, e.latlng.lng])
    }

    drawLinesLayer.value.clearLayers()
    drawLinesLayer.value.addLayer(polyline)

  })
  map.value.on('mouseup', e => {
    if (!drawingLine.value) {
      return
    }
    if (isDrawing.value || isModifying.value) {
      const closestPointInfo = getClosestStopFromLatLng(map.value, [e.latlng.lat, e.latlng.lng])
      if (!closestPointInfo?.stop) {
        return
      }

      if (closestPointInfo.distance < drawSnapDistance.value) {
        console.log('mouseup snapped to ', closestPointInfo)
        if (
            closestPointInfo?.stop === Array.from(drawingLine.value.stops.values())[0]
            && drawingLine.value.stops.size > 2
        ) {
          drawingLine.value.loop = true
        } else {
          drawingLine.value.loop = false
        }
      } else {
        if (drawingLine.value.stops.size <= 2) {
          drawingLine.value.loop = false
        }
      }

      if (isModifying.value) {
        drawingLine.value.layerGroup.removeLayer(drawingLine.value.lineLayer)
        drawLinesLayer.value.removeLayer(drawingLine.value.layerGroup)
      }

      const line = drawingLine.value
      drawingLine.value.lineLayer = drawingLine.value.getPolyline()
      drawingLine.value.lineLayer.on('mousedown', e => {
        console.log('mousedown on line', e, line)
        drawingLine.value = line
        isModifying.value = true
        linesLayer.value.removeLayer(drawingLine.value.layerGroup)
      })

      drawingLine.value.layerGroup.addLayer(drawingLine.value.lineLayer)
      linesLayer.value.addLayer(drawingLine.value.layerGroup)
      drawLinesLayer.value.clearLayers()

      if (drawingLine.value.stops.size > 1) {
        drawingLine.value.active = true
      } else {
        drawLinesLayer.value.removeLayer(drawingLine.value.layerGroup)
        drawingLine.value.removeFromMap()
      }

      isDrawing.value = false
      isModifying.value = false
      drawingLine.value = null
      drawingCurrentStop.value = null
      modifyingInfo.value = null
    }
  })

  const dezoomInterval = setInterval(() => {
    if (zoomLevel.value > gameMaxZoomLevel.value && gameStore.dezoom) {
      zoomLevel.value--
    }
  }, Math.random() * (dezoomIntervalTime.value - 500) + 500)

  // const randomStopSpawnInterval = setInterval(() => {
  //   const array = Array.from(stopsInBounds.values())
  //   addStopOnMap(array[Math.floor(Math.random() * array.length)])
  // }, randomStopSpawnIntervalTime.value)



  let then = Date.now()
  let now = 0
  let delta = 0
  let reqCancel = 0
  function gameTick() {
    const tickPerSecond = gameStore.fpsTarget
    const interval = 1000/tickPerSecond
    now = Date.now();
    delta = now - then;

    if (delta > interval) {
      then = now - (delta % interval);

	  passengerManager.update()

      for (const stop of stopStore.stops) {
        if (stop.passengers.size > 0) {
          for (const passenger of stop.passengers) {
            passenger.update()
          }
        }
      }

      for (const line of lineStore.lines.values()) {
        if (line.active) {
          line.update(delta)
        }
      }
    }

    reqCancel = requestAnimationFrame(gameTick)
    if (gameStore.state === gameStore.gameStates.GAME_OVER) {
      window.cancelAnimationFrame(reqCancel)
    }
  }
  gameTick()
})

watch(zoomLevel, (newZoom) => {
  if (newZoom) {
    map.value.setZoom(newZoom)
    getStopsInBound(map.value)
  }
})

watch(stopsOnMap, (old, stopsOnMap) => {
  for (const stop of stopsOnMap) {
    if (!stopsLayer.value.hasLayer(stop.marker)) {
      stopsLayer.value.addLayer(stop.marker)
    }
  }
})

// const stop = new Stop('test 1', [47.23595, 6.02525], 'Test 1')
// stopsOnMap.add(stop)
// const stop2 = new Stop('test 2', [47.2355, 6.0255], 'Test 2')
// stopsOnMap.add(stop2)

defineExpose({
  map,
  center,
  zoomLevel
})
</script>

<style>
.container {
  display: flex;
  width: 100vw;
}
.col {
  flex-basis: 50%;
}

#map {
  width: 100vw;
  height: 100vh;
}

.fpsTarget-container {
  display: flex;
  flex-direction: column;
  width: 200px;
}

.custom-div-icon {
  background-color: white;

}
.stop-marker {
  background-color: #616161;
  width: 100px;
  text-align: center;
  color: white;
  font-weight: 900;
}
.stop-marker-stops {
  display: flex;
  flex-direction: column;
  background-color: white;
  width: 100px;
  text-align: center;
}
.stop-marker-pin {
  width: 100px;
  text-align: center;
}

.bus-marker {
  font-weight: 900;
  font-size: 25px;
  background-color: #616161;
}
.bus-marker-passenger {
  position: absolute;
  display: flex;
  flex-direction: column;
  font-weight: 700;
  text-align: center;
  color: white;
}
</style>