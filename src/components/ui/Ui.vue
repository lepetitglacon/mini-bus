<script setup lang="ts">
import {useGameStore} from "@/stores/game";
import UnlockModal from "@/components/ui/UnlockModal.vue";
import Passengers from "@/components/Passengers/Passengers.vue";
import LineManager from "@/components/ui/LineManager.vue";
import Shop from "@/components/ui/Shop.vue";
import WeekDay from "@/components/ui/WeekDay.vue";

const gameStore = useGameStore()
</script>

<template>

  <div class="ui-container">
    <Shop v-if="gameStore.state === gameStore.gameStates.SHOP"/>
    <UnlockModal v-if="gameStore.state === gameStore.gameStates.UNLOCK_MODAL" :passengerManager="passengerManager"/>
    <Passengers/>
    <LineManager/>
    <WeekDay/>
  </div>

</template>

<style scoped>
.ui-container {
  position: absolute;
  display: flex;

  width: 100vw;
  height: 100vh;

  z-index: 500;
}
</style>