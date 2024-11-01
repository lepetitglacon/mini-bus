<template>
  <div id="map"></div>
  <p>passengers {{passengers}}</p>

  <div style="height: 200px; line-break: anywhere">
    <pre v-if="isDrawing || isModifying">{{drawingLine}}</pre>
    <pre v-if="isDrawing || isModifying">{{ drawingCurrentStop }}</pre>
  </div>

  <p>stops on map {{stopsOnMap.size}}</p>
  <p>stops in bounds {{stopsInBounds.size}}</p>
  <p>{{zoomLevel}}</p>
</template>

<script setup lang="ts">
import {inject, onMounted, ref, watch} from "vue";
import L, {polyline} from "leaflet";
import {useStopsStore} from "@/stores/stops";
import Stop from "@/game/objects/Stop";
import {useGameStore} from "@/stores/game";
import type Line from "@/game/objects/Line";

const map = ref()
const center = ref([47.23510156121514, 6.025931239128114])
const zoomLevel = ref(18)
const gameMaxZoomLevel = ref(15)

const dezoomIntervalTime = ref(10000)
const randomStopSpawnIntervalTime = ref(1000)

const stopsLayer = ref<L.LayerGroup>(new L.layerGroup())
const linesLayer = ref<L.LayerGroup>(new L.layerGroup())
const drawLinesLayer = ref<L.LayerGroup>(new L.layerGroup())

const lineManager = inject('lineManager')

const drawSnapDistance = ref(10) // meters
const isDrawing = ref(false)
const drawingLine = ref<Line|null>(null)
const drawingCurrentStop = ref<Stop|null>(null)
const isModifying = ref(false)
const modifyingInfo = ref(null)

const {stopsOnMap, stopsInBounds, getStopsInBound, addStopOnMap, getClosestStopFromLatLng} = useStopsStore()
const {dezoom, passengers} = useGameStore()

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
    const line = lineManager.value.getFreeLine()
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
    if (zoomLevel.value > gameMaxZoomLevel.value && dezoom) {
      zoomLevel.value--
    }
  }, Math.random() * (dezoomIntervalTime.value - 500) + 500)

  const randomStopSpawnInterval = setInterval(() => {
    const array = Array.from(stopsInBounds.values())
    addStopOnMap(array[Math.floor(Math.random() * array.length)])
  }, randomStopSpawnIntervalTime.value)


  const fps = 60
  const interval = 1000/fps
  let then = Date.now()
  let now = 0
  let delta = 0
  function gameTick(elapsedTime: number) {
    now = Date.now();
    delta = now - then;

    if (delta > interval) {
      then = now - (delta % interval);

      for (const line of lineManager.value.lines.values()) {
        if (line.active) {
          line.update()
        }
      }
    }

    requestAnimationFrame(gameTick)
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

const stop = new Stop('test 1', [47.23510156121514, 6.025931239128114], 'Test 1')
stopsOnMap.add(stop)
const stop2 = new Stop('test 2', [47.2355, 6.0255], 'Test 2')
stopsOnMap.add(stop2)

defineExpose({
  map,
  center,
  zoomLevel
})
</script>

<style>
#map { height: 50vh}

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
</style>