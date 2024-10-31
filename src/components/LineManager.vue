<template>

  <div style="display: flex">
    <div v-for="line of lines" :style="{
          backgroundColor: line.color,
          width: '100px',
          height: '100px',
          opacity: line.active ? '50%' : '100%'
         }">
      <pre>active: {{line.active}}</pre>
      <pre>loop: {{line.loop}}</pre>
    </div>
  </div>

</template>

<script setup lang="ts">

import {ref} from "vue";
import Line from "@/game/objects/Line";

const lines = ref<Set<Line>>(new Set())
lines.value.add(new Line(1))
lines.value.add(new Line(2, '#884466'))

function getFreeLine() {
  for (const line of lines.value.values()) {
    if (!line.active) {
      return line
    }
  }
  return null
}

defineExpose({
  lines,
  getFreeLine
})

</script>