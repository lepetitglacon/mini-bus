import { ref, computed } from 'vue'
import { defineStore } from 'pinia'


export const useStatsStore = defineStore('stats', () => {

  const passengersServed = ref(0)

  return {
    passengersServed
  }
})