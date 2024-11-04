import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import Line from "@/game/objects/Line";


export const useLinesStore = defineStore('lines', () => {

  const lines = ref(new Set<Line>())
  setInitialLines()

  function setInitialLines() {
    lines.value.add(new Line(1, '#00abc4'))
    lines.value.add(new Line(2, '#338866'))
    lines.value.add(new Line(3, '#884466'))
  }

  const reset = () => {
    lines.value.clear()
    setInitialLines()
  }

  function linesAsArray() {
    return Array.from(lines.value.values())
  }

  function getFreeLine() {
    for (const line of lines.value.values()) {
      if (!line.active) {
        return line
      }
    }
    return null
  }

  return {
    reset,

    lines,
    linesAsArray,
    getFreeLine
  }
})