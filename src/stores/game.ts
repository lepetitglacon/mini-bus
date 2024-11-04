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
  const currentWeekDayIntervalTime = ref(10000)
  const currentWeekDayInterval = setInterval(() => {
    currentWeekDay.value = weekDays[weekDays.indexOf(currentWeekDay.value) + 1 % weekDays.length]
    if (weekDays.indexOf(currentWeekDay.value) == 6) {
      console.log('time to upgrade')
    }
  }, currentWeekDayIntervalTime.value)

  return {
    gameStates,
    state,
    reset,

    weekDays,


    passengers,
    dezoom,
    fpsTarget,
    busStopsCharLenght,

    currentWeekDay,
    currentWeekDayIntervalTime,
    currentWeekDayInterval
  }
})