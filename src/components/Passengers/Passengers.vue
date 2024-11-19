<template>
  <div  class="passengers-container">

    <div class="passengers-inner">

      <div class="">
        <img class="passenger-icon" :src="passengerIcon"> {{gameStore.passengers}}
      </div>

      <div class="">
        <div v-for="passenger of stopStore.passengers">
          <Passenger
              :passenger="passenger"
          />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import passengerIcon from '@/assets/img/passenger.png'

import {useStopsStore} from "@/stores/stops";
import Passenger from "@/components/Passengers/Passenger.vue";
import {useGameStore} from "@/stores/game";

const stopStore = useStopsStore()
const gameStore = useGameStore()
</script>

<style scoped>
.passengers-container {
  position: absolute;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: end;

  width: 100vw;
  height: 100vh;

  z-index: 400;

  color: black;
}
.passengers-inner {

  height: 80vh;
  width: 20vw;
  border-radius: 10px;
  padding: 10px;

  background-color: rgba(255, 255, 255, 0.6);
}
.passenger-icon {
  height: 32px;
}
</style>