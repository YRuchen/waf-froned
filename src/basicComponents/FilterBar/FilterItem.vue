<template>
  <div class="filter-item">
    <span class="label">{{ label }}</span>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<style scoped>
.filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.label {
  white-space: nowrap;
}
</style>
