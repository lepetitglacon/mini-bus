<script setup lang="ts">

import {useGameStore} from "@/stores/game";

const gameStore = useGameStore()
function handleRetry() {
	gameStore.reset()
	// TODO
}
</script>

<template>
	<div>
		<p>Your passengers waited for to long</p>
		<button @click="handleRetry">Retry</button>
	</div>
</template>

<style scoped>

</style>