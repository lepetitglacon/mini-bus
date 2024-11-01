<template>

  <div>
    <p>{{title}}</p>
    <pre>{{passengers}}</pre>
  </div>

</template>

<script setup lang="ts">
  defineProps([
      'title',
      'passengers'
  ])
</script>