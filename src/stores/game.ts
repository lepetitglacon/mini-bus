import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', () => {

  const passengers = ref(0)
  function addPassenger() {
    passengers.value++
  }

  const dezoom = ref(false)

  return {
    passengers,
    dezoom,
    addPassenger
  }
})