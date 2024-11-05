<template>
  <div class="col">
    <div  class="passengers-container">
      <div v-for="passenger of stopStore.passengers">
        <Passenger
          :passenger="passenger"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useStopsStore} from "@/stores/stops";
import Passenger from "@/components/Passengers/Passenger.vue";

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