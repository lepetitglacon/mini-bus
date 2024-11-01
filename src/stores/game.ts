import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', () => {

  const passengers = ref()

  const dezoom = ref(false)

  return {
    passengers,
    dezoom
  }
})