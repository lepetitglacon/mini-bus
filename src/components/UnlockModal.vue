<script setup lang="ts">
const props = defineProps(['passengerManager'])
</script>

<template>
<div>
	<h2>Last Unlock</h2>

	{{passengerManager.currentState}}

	<div>
		<div v-for="item of Object.values(passengerManager.states)[passengerManager.currentState - 1]">
			{{ item }}
		</div>
	</div>

</div>
</template>

<style scoped>

</style>