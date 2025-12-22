<template>
  <div class="filter-bar filter-bar--simple">
    <div>
      <el-button type="primary" :loading="queryLoading" @click="handleQuery">
        {{ actions?.queryText || '新增' }}
      </el-button>
    </div>
    <!-- 筛选条件区域 -->
    <div class="filter-bar__filters">
      <slot name="filters">
        <!-- 默认渲染所有筛选条件，不显示展开/收起 -->
        <FilterItem v-for="item in schema" :key="item.key" :item="item" />
      </slot>
    </div>

    <!-- 操作按钮区域 -->
    <div class="filter-bar__actions">
      <slot name="actions">
        <!-- 默认操作按钮 -->
        <el-button
          v-if="actions?.showQuery !== false"
          type="primary"
          :loading="queryLoading"
          @click="handleQuery"
        >
          {{ actions?.queryText || '查询' }}
        </el-button>
        <el-button v-if="actions?.showReset !== false" :loading="resetLoading" @click="handleReset">
          {{ actions?.resetText || '重置' }}
        </el-button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import FilterItem from '../FilterItem.vue'
import type { FilterSchemaItem } from '../types'

defineProps<{
  schema?: FilterSchemaItem[]
  model?: Record<string, any>
  actions?: {
    showQuery?: boolean
    showReset?: boolean
    queryText?: string
    resetText?: string
    [key: string]: any
  }
  queryLoading?: boolean
  resetLoading?: boolean
  mode?: string
}>()

const emit = defineEmits<{
  query: [model: Record<string, any>]
  reset: [model: Record<string, any>]
}>()

const handleQuery = () => {
  // 获取表单数据并触发查询
  emit('query', {})
}

const handleReset = () => {
  // 重置表单数据并触发重置
  emit('reset', {})
}
</script>

<style lang="less" scoped>
.filter-bar--simple {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;

  .filter-bar__filters {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    flex: 1;
  }

  .filter-bar__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
}
</style>
