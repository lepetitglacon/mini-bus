<script setup lang="ts">
import {inject, onMounted, ref} from "vue";
import L from "leaflet";

const props = defineProps(['stop'])
const map = ref(props.map)

onMounted(() => {
  const marker = ref(new L.Marker([props.stop.latitude, props.stop.longitude], {
    // icon: props.stop.customIcon,
    // title: props.stop.name,
    riseOnHover: true
  }))
  console.log(map)
})
</script>

<template>

</template>

<style scoped>

</style>