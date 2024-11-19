<template>
  <div class="col">
    <div  class="passengers-container">

	    <div class="col">
		    <p>passengers served {{gameStore.passengers}}</p>
	    </div>

	    <div class="col">
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
import {useStopsStore} from "@/stores/stops";
import Passenger from "@/components/Passengers/Passenger.vue";
import {useGameStore} from "@/stores/game";

const stopStore = useStopsStore()
const gameStore = useGameStore()
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