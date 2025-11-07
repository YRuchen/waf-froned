<script setup lang="ts">
import { ref } from 'vue'
import { ElDatePicker } from 'element-plus'

const range = ref<[string, string] | ''>('')
</script>

<template>
  <ElDatePicker
    v-model="range"
    type="daterange"
    unlink-panels
    start-placeholder="开始日期"
    end-placeholder="结束日期"
    :teleported="false"
    popper-class="inline-panel"
  />
</template>

<style>
.el-range-editor.el-input__wrapper {
  width: 100% !important;
}
.inline-panel {
  position: static !important;
  transform: none !important;
  display: block !important;
  box-shadow: none !important;
}
</style>
