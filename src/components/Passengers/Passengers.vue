<template>
  <div  class="passengers-container">

    <div class="passengers-inner">

      <div class="">
        <img class="passenger-icon" :src="passengerIcon"> {{gameStore.passengers}}
      </div>

      <div class="">
        <div v-for="passenger of passengerStore.passengers">
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
import {useGameStore} from "@/stores/game";
import Passenger from "@/components/Passengers/Passenger.vue";
import {usePassengerStore} from "@/stores/passengers";

const stopStore = useStopsStore()
const gameStore = useGameStore()
const passengerStore = usePassengerStore()
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


  color: black;
}
.passengers-inner {
	pointer-events: all;
	z-index: 400;

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