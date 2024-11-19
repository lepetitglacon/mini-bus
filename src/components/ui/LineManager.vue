<template>

  <div class="container" style="display: flex">
    <div v-for="line of lineStore.lines" class="line" :style="{
          backgroundColor: line.color,
          width: '100px',
          height: '100px',
          opacity: line.active ? '50%' : '100%'
         }">
      <pre>loop: {{line.loop}}</pre>
    </div>
  </div>

</template>

<script setup lang="ts">
import {useLinesStore} from "@/stores/lines";

const lineStore = useLinesStore()
</script>

<style scoped>
.container {
  position: absolute;
  bottom: 5vh;
  width: 100%;
  z-index: 9999999999;

  display: flex;
  justify-content: center;
}
.line {
  margin-right: 10px;
  margin-left: 10px;
  border-radius: 30%;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
</style>