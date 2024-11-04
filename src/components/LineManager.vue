<template>

  <div class="container" style="display: flex">
    <div v-for="line of lineStore.lines" :style="{
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
import Line from "@/game/objects/Line";
import {useLinesStore} from "@/stores/lines";

const lineStore = useLinesStore()

lineStore.lines.add(new Line(1, '#00abc4'))
lineStore.lines.add(new Line(2, '#338866'))
lineStore.lines.add(new Line(3, '#884466'))
</script>

<style scoped>
.container {
  position: absolute;
  top: 0;
  left: 25%;
  z-index: 9999999999;
}
</style>