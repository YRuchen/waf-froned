<template>
  <component :is="currentLayout" v-bind="layoutProps" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import CollapsibleLayout from './layouts/CollapsibleLayout.vue'
import CompactLayout from './layouts/CompactLayout.vue'
import SeparatedLayout from './layouts/SeparatedLayout.vue'
import type { FilterSchemaItem } from './types'

// Props 定义
const props = withDefaults(
  defineProps<{
    // 筛选条件配置数组
    schema?: FilterSchemaItem[]
    // 布局模式
    mode?: 'auto' | 'collapsed' | 'expanded' | 'compact' | 'separated'
    // 操作按钮配置
    actions?: {
      showQuery?: boolean
      showReset?: boolean
      showExpand?: boolean
      queryText?: string
      resetText?: string
      expandText?: string
      collapseText?: string
      [key: string]: any
    }
    // 表单数据模型
    model?: Record<string, any>
    // 是否显示标签
    showLabel?: boolean
    // 标签宽度
    labelWidth?: string | number
    // 标签位置
    labelPosition?: 'left' | 'right' | 'top'
    // 是否内联显示
    inline?: boolean
    // 展开/收起的界限字段（用于 collapsed/expanded 模式）
    expandField?: string
    // 查询按钮加载状态
    queryLoading?: boolean
    // 重置按钮加载状态
    resetLoading?: boolean
  }>(),
  {
    schema: () => [],
    mode: 'auto',
    actions: () => ({
      showQuery: true,
      showReset: true,
      showExpand: false,
      queryText: '查询',
      resetText: '重置',
      expandText: '展开',
      collapseText: '收起'
    }),
    model: () => ({}),
    showLabel: true,
    labelWidth: 'auto',
    labelPosition: 'right',
    inline: true,
    expandField: '',
    queryLoading: false,
    resetLoading: false
  }
)

// Emits 定义
const emit = defineEmits<{
  query: [model: Record<string, any>]
  reset: [model: Record<string, any>]
  expand: []
  collapse: []
  change: [field: string, value: any, model: Record<string, any>]
}>()

// 展开/收起状态（用于 collapsed/expanded 模式）
const isExpanded = ref(false)

// 根据 mode 确定当前布局组件
const currentLayout = computed(() => {
  const { mode } = props

  // auto 模式：根据 schema 长度自动判断
  if (mode === 'auto') {
    // 可以根据实际需求调整判断逻辑
    // 例如：如果筛选项超过 4 个，使用 collapsed 模式
    if (props.schema && props.schema.length > 4) {
      return CollapsibleLayout
    }
    // 默认使用 compact 模式
    return CompactLayout
  }

  // 根据 mode 选择布局
  switch (mode) {
    case 'collapsed':
    case 'expanded':
      return CollapsibleLayout
    case 'compact':
      return CompactLayout
    case 'separated':
      return SeparatedLayout
    default:
      return CollapsibleLayout
  }
})

// 计算传递给布局组件的 props
const layoutProps = computed(() => {
  const {
    mode,
    schema,
    actions,
    model,
    showLabel,
    labelWidth,
    labelPosition,
    inline,
    expandField,
    queryLoading,
    resetLoading
  } = props

  // 基础 props，所有布局组件都需要
  const baseProps = {
    schema,
    model,
    showLabel,
    labelWidth,
    labelPosition,
    inline,
    actions,
    queryLoading,
    resetLoading,
    // 事件处理
    onQuery: (queryModel: Record<string, any>) => {
      emit('query', queryModel)
    },
    onReset: (resetModel: Record<string, any>) => {
      emit('reset', resetModel)
    },
    onChange: (field: string, value: any, changeModel: Record<string, any>) => {
      emit('change', field, value, changeModel)
    }
  }

  // 根据不同的布局模式，添加特定的 props
  if (mode === 'collapsed' || mode === 'expanded') {
    return {
      ...baseProps,
      // CollapsibleLayout 特定 props
      isExpanded: isExpanded.value,
      expandField,
      expandText: actions?.expandText || '展开',
      collapseText: actions?.collapseText || '收起',
      onExpand: () => {
        isExpanded.value = true
        emit('expand')
      },
      onCollapse: () => {
        isExpanded.value = false
        emit('collapse')
      }
    }
  }

  if (mode === 'compact') {
    return {
      ...baseProps,
      // CompactLayout 特定 props
      // 紧凑模式隐藏 label，在 placeholder 中体现
      hideLabel: true
    }
  }

  if (mode === 'separated') {
    return {
      ...baseProps,
      // SeparatedLayout 特定 props
      // 分离模式：操作按钮单独一行
      buttonPosition: actions?.buttonPosition || 'right'
    }
  }

  return baseProps
})
</script>
