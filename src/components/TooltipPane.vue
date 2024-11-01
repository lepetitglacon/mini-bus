<template>
<div ref="pane">

</div>
</template>

<script setup lang="ts">
import {ref} from "vue";

const pane = ref()

defineExpose({
  pane
})
</script>

<style scoped>

</style>