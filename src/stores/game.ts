import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {useLinesStore} from "@/stores/lines";
import {useStopsStore} from "@/stores/stops";
import Item from "@/game/objects/Item";
import Effect from "@/game/objects/Effect";

const weekDays: string[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const gameStates = {
  RUNNING: 'running',
  GAME_OVER: 'game over',
  SHOP: 'shop',
  UNLOCK_MODAL: 'unlock modal',
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
  const currentWeekDayIntervalTime = ref(15000)
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

  const level = ref(0)
  const levels = {
    2: {
      items: [
        Item.ITEMS.Line
      ],
      effects: [

      ]
    },
    200: {
      items: [
        Item.ITEMS.DoubleDecker
      ],
      effects: [
        Effect.EFFECTS.Sub
      ]
    },
    1000: {
      items: [
        Item.ITEMS.Bridge
      ],
      effects: [
        Effect.EFFECTS.Fraud
      ]
    },
    5000: {
      items: [
        Item.ITEMS.Tram
      ],
      effects: [
        Effect.EFFECTS.Controllers
      ]
    }

  }

  function update() {


    // set level
    if (passengers.value >= parseInt(Object.keys(levels)[level.value])) {
      state.value = gameStates.UNLOCK_MODAL
      level.value++
      console.log('LEVEL ', level.value)
    }
  }

  let then = Date.now()
  let now = 0
  let delta = 0
  let reqCancel = 0
  function gameTick() {
    const tickPerSecond = fpsTarget.value
    const interval = 1000/tickPerSecond
    now = Date.now();
    delta = now - then;

    if (delta > interval) {
      then = now - (delta % interval);

      update()

      for (const stop of stopStore.stops) {
        if (stop.passengers.size > 0) {
          for (const passenger of stop.passengers) {
            passenger.update()
          }
        }
      }

      for (const line of lineStore.lines.values()) {
        if (line.active) {
          line.update(delta)
        }
      }
    }

    reqCancel = requestAnimationFrame(gameTick)
    if (state.value === gameStates.GAME_OVER) {
      window.cancelAnimationFrame(reqCancel)
    }
  }
  gameTick()

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
    currentWeekDayInterval,

    level,
    levels
  }
})