import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {useLinesStore} from "@/stores/lines";
import {useStopsStore} from "@/stores/stops";

const weekDays: string[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const gameStates = {
  RUNNING: 'running',
  GAME_OVER: 'game over',
  SHOP: 'shop',
}

export const useGameStore = defineStore('game', () => {

  const lineStore = useLinesStore()
  const stopStore = useStopsStore()

  const state = ref(gameStates.RUNNING)
  const reset = () => {

    lineStore.reset()
    stopStore.reset()

    state.value = gameStates.RUNNING
  }

  const passengers = ref(0)
  const dezoom = ref(false)
  const fpsTarget = ref(60)
  const busStopsCharLenght = ref(6)

  const currentWeekDay = ref(weekDays[0])
  const currentWeekDayIntervalTime = ref(1000)
  const currentWeekDayInterval = setInterval(() => {
    if (state.value !== gameStates.SHOP) {
      currentWeekDay.value = weekDays[weekDays.indexOf(currentWeekDay.value) + 1]
      if (weekDays.indexOf(currentWeekDay.value) == 6) {
        console.log('time to upgrade')
        state.value = gameStates.SHOP
      }
    }
  }, currentWeekDayIntervalTime.value)

  const shopItems = ref([
    {
      'name': 'Line'
    },
    {
      'name': 'Bridge'
    },
    {
      'name': 'Tram'
    },
    {
      'name': 'Double Decker'
    }
  ])

  return {
    gameStates,
    state,
    reset,

    weekDays,
    shopItems,

    passengers,
    dezoom,
    fpsTarget,
    busStopsCharLenght,

    currentWeekDay,
    currentWeekDayIntervalTime,
    currentWeekDayInterval
  }
})