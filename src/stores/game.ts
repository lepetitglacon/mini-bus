import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', () => {

  const passengers = ref(0)
  const dezoom = ref(false)
  const fpsTarget = ref(60)
  const busStopsCharLenght = ref(6)

  const gameOver = ref(false)

  return {
    passengers,
    dezoom,
    fpsTarget,
    busStopsCharLenght,
    gameOver
  }
})