<template>
  <div class="col">
    <div  class="passengers-container">
      <div v-for="passenger of stopStore.passengers">
        {{ passenger.destination.id }} {{ passenger.waitingTimeStart + passenger.waitingTimeMax - Date.now()}}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useGameStore} from "@/stores/game";
import {useLinesStore} from "@/stores/lines";
import {useStopsStore} from "@/stores/stops";

const gameStore = useGameStore()
const lineStore = useLinesStore()
const stopStore = useStopsStore()
</script>

<style scoped>
.passengers-container {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  height: 25vh;

  background-color: #616161;
  color: white;
}
</style>