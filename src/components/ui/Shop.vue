<script setup lang="ts">
import {useGameStore} from "@/stores/game";

const gameStore = useGameStore()
</script>

<template>
<div class="shop-container">

  <div class="shop-window">
    <h2>financial boost</h2>

    <div class="shop-item-container">

      <div v-for="item of gameStore.shopItems">

        <button class="shop-item">
          <img class="shop-item-img" :src="item.img"></img>
          <p>{{ item.name }}</p>
        </button>

      </div>

    </div>
  </div>

</div>
</template>

<style scoped>
.shop-container {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  z-index: 99999999;
}
.shop-window {
  background-color: #282828;
  color: white;
  padding: 25px;
  border-radius: 5px;
}
.shop-item {
  background-color: #818181;
  margin: 5px;
  padding: 5px;
  width: 150px;
  height: 150px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  border-radius: 5px;
}
.shop-item-img {
  width: 64px;
  height: 64px;
}
.shop-item-container {
  display: flex;
  justify-content: space-evenly;
}
</style>