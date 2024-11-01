import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', () => {

  const passengers = ref(0)

  const dezoom = ref(false)

  return {
    passengers,
    dezoom
  }
})