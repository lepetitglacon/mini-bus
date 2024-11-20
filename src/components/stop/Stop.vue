<script setup lang="ts">
import {useStopsStore} from "@/stores/stops";

const stopStore = useStopsStore()
</script>

<template>

	<div v-for="stop of stopStore.stopsOnMap">
		{{ stop.name }}
	</div>

</template>

<style scoped>

</style>