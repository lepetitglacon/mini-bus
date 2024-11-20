<script setup lang="ts">
import {useGameStore} from "@/stores/game";

const props = defineProps(['passengerManager'])
const gameStore = useGameStore()
</script>

<template>
<div class="passengers-container">
	<h2>Last Unlock</h2>

	{{gameStore.level}}

	<div>
		<div v-for="item of Object.values(gameStore.levels)[passengerManager.currentState - 1]">
			{{ item }}
		</div>
	</div>

</div>
</template>

<style scoped>
.passengers-container {
  position: absolute;
}
</style>