<script setup lang="ts">
import { ref, watch, type PropType } from 'vue'
import { ElDatePicker } from 'element-plus'

const emit = defineEmits(['update:range'])
const props = defineProps({
  selectedRange: {
    type: Array as unknown as PropType<[Date, Date]>,
    default: () => [new Date(), new Date()]
  }
})
const range = ref<[string, string] | ''>('')

watch(range, (val) => {
  emit('update:range', val, '绝对时间')
})
</script>

<style lang="less" scoped>
.active {
  background-color: var(--el-color-primary);
  color: var(--el-color-white);
  border-radius: var(--primary-raduis);
}
</style>
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
