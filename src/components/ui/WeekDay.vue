<script setup lang="ts">
import {useGameStore} from "@/stores/game";

const gameStore = useGameStore()
</script>

<template>
<div class="weekday-container">
	<p>Day : {{ gameStore.currentWeekDay }}</p>
</div>
</template>

<style scoped>
.weekday-container {
	position: absolute;
  top: 0;
	display: flex;
  justify-content: start;
  align-items: start;

	z-index: 400;
	background-color: rgba(255, 255, 255, 0.8);
}
</style>