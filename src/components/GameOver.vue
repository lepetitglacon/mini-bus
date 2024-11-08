<script setup lang="ts">

import {useGameStore} from "@/stores/game";

const gameStore = useGameStore()
function handleRetry() {
	gameStore.reset()
	// TODO
}
</script>

<template>
	<div class="game-over-container">
		<p>Your passengers waited for to long</p>
		<button @click="handleRetry">Retry</button>
	</div>
</template>

<style scoped>
.game-over-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>