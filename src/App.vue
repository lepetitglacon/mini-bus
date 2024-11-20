<template>

  <Ui/>
  <Map/>
  <GameOver v-if="gameStore.state === gameStore.gameStates.GAME_OVER"/>

</template>

<script setup lang="ts">
import './assets/base.css'
import 'leaflet/dist/leaflet.css'
import {useGameStore} from "@/stores/game";
import Map from "@/components/Map.vue";
import Ui from "@/components/ui/Ui.vue";
import GameOver from "@/components/GameOver.vue";

const gameStore = useGameStore()
</script>

<style scoped>
</style>
