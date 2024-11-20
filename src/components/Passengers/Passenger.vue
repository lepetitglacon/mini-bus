<script setup lang="ts">
import {computed, ref} from "vue";

const props = defineProps(['passenger'])

const style = computed(() => {
  return {
    backgroundColor: (timeLeft.value < 10) ? '#FF0000' : (timeLeft.value < 30) ? '#dfc617' : '#78e45a',
  }
})
const now = ref(Date.now())
const timeLeft = computed(() => {
  return ((props.passenger.waitingTimeStart + props.passenger.waitingTimeMax - now.value) / 1000).toFixed()
})

setInterval(() => {
now.value = Date.now()
}, 1000)
</script>

<template>
  <div>
    <p>{{ passenger.destination?.id }} <span :style="style">{{ timeLeft }}</span></p>
  </div>
</template>

<style scoped>
.time-left {

}
</style>