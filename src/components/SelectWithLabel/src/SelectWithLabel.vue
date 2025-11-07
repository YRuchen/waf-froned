<script setup lang="ts">
import { computed } from 'vue'
import { ElSelect, ElOption } from 'element-plus'
import { propTypes } from '@/utils/propTypes'

const props = defineProps({
  // 绑定的值
  modelValue: propTypes.string.def(''),
  // 占位符
  placeholder: propTypes.string.def('请选择'),
  // 左侧label
  label: propTypes.string.def(''),
  // 是都多选
  multiple: propTypes.bool.def(false),
  // option
  options: {
    type: Array as () => { label: string; value: string | number }[],
    default: () => []
  }
})
const emit = defineEmits(['update:modelValue'])
const modelValueRef = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>

<template>
  <div class="custom-select">
    <div class="label">{{ props.label }}</div>
    <ElSelect
      v-model="modelValueRef"
      :placeholder="props.placeholder"
      :multiple="props.multiple"
      collapse-tags
      collapse-tags-tooltip
      style="width: 240px"
    >
      <ElOption v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
    </ElSelect>
  </div>
</template>
<style scoped>
.custom-select {
  display: flex;
  align-items: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  width: 300px !important;
}
.custom-select .label {
  padding: 0 12px;
  background-color: #fff !important; /* 白色背景 */
  border-right: 1px solid #dcdfe6;
  /* white-space: nowrap; */
}
.custom-select .el-select {
  flex: 1;
  border: none;
}
/* .custom-select .el-select__tags {
  display: flex;
  flex-wrap: wrap;
} */
</style>
