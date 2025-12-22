<template>
  <component :is="currentLayout" v-bind="layoutProps" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CollapsibleLayout from './layouts/CollapsibleLayout.vue'
import CompactLayout from './layouts/CompactLayout.vue'
import SeparatedLayout from './layouts/SeparatedLayout.vue'
import SimpleLayout from './layouts/SimpleLayout.vue'

const props = withDefaults(
  defineProps<{
    mode?: 'auto' | 'simple' | 'collapsed' | 'expanded' | 'compact' | 'separated'
    // 筛选条件配置数组（用于 auto 模式自动判断）
    schema?: Array<any>
    // 用于 auto 模式自动判断的阈值
    simpleThreshold?: number // 小于等于此数量使用 simple 模式
    collapsedThreshold?: number // 大于此数量使用 collapsed 模式
  }>(),
  {
    mode: 'auto',
    schema: () => [],
    simpleThreshold: 3, // 默认：3个及以下使用 simple
    collapsedThreshold: 5 // 默认：超过5个使用 collapsed
  }
)

const currentLayout = computed(() => {
  const { mode, schema = [], simpleThreshold = 3, collapsedThreshold = 5 } = props

  // auto 模式：根据条件数量自动判断
  if (mode === 'auto') {
    const schemaLength = schema.length

    // 条件少：使用 simple 模式（不显示展开/收起）
    if (schemaLength <= simpleThreshold) {
      return SimpleLayout
    }

    // 条件多：使用 collapsed 模式（需要展开/收起）
    if (schemaLength > collapsedThreshold) {
      return CollapsibleLayout
    }

    // 条件中等：使用 compact 模式（压缩显示）
    return CompactLayout
  }

  // 根据 mode 选择布局
  switch (mode) {
    case 'simple':
      return SimpleLayout
    case 'collapsed':
    case 'expanded':
      return CollapsibleLayout
    case 'compact':
      return CompactLayout
    case 'separated':
      return SeparatedLayout
    default:
      return SimpleLayout // 默认使用 simple
  }
})

const layoutProps = computed(() => {
  const { mode, schema, ...restProps } = props
  // 基础props，所有布局组件都需要
  return {
    mode,
    schema,
    ...restProps
  }
})
</script>
