<script setup lang="ts">
import {useGameStore} from "@/stores/game";

const gameStore = useGameStore()
</script>

<template>
<div class="shop-container">

  <h2>financial boost</h2>

  <div v-for="items of gameStore.shopItems">
    <p>{{ items.name }}</p>
  </div>

</div>
</template>

<style scoped>
.shop-container {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  z-index: 99999999;
  background-color: #282828;
  color: white;
}
</style>