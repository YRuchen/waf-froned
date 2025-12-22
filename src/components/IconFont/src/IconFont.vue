<script setup lang="ts">
import { computed } from 'vue'
import { propTypes } from '@/utils/propTypes'

// 定义 props
const props = defineProps({
  /**图标名称 */
  name: propTypes.string,
  /**图标大小 */
  size: propTypes.number.def(24),
  /**图标颜色 */
  color: propTypes.string,
  /**额外 class */
  className: { type: String, default: '' }
})

// 生成 class
const iconClass = computed(() => {
  return ['icon', 'iconfont', `icon-${props.name}`, props.className].filter(Boolean).join(' ')
})

// 生成 style
const iconStyle = computed(() => ({
  fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
  color: props.color
}))
</script>

<template>
  <span :class="iconClass" :style="iconStyle"></span>
</template>
