<template>
  <Map v-if="gameStore.state !== gameStore.gameStates.GAME_OVER"/>
	<GameOver v-else/>
</template>

<script setup lang="ts">
import './assets/base.css'
import 'leaflet/dist/leaflet.css'
import Map from "@/components/Map.vue";
import {useGameStore} from "@/stores/game";
import GameOver from "@/components/GameOver.vue";

const gameStore = useGameStore()
</script>

<style scoped>
</style>
