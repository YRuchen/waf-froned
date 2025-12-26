<script setup lang="ts">
import { ElCard, ElTooltip } from 'element-plus'
import { propTypes } from '@/utils/propTypes'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('content-wrap')

defineProps({
  title: propTypes.string.def(''),
  message: propTypes.string.def('')
})
</script>

<template>
  <div :class="[prefixCls]" shadow="never">
    <div class="wrap-title" v-if="title">
      <span class="text-16px font-700">{{ title }}</span>
      <ElTooltip v-if="message" effect="dark" placement="right">
        <template #content>
          <div class="max-w-200px">{{ message }}</div>
        </template>
        <Icon class="ml-5px" icon="vi-bi:question-circle-fill" :size="14" />
      </ElTooltip>
      <div class="flex pl-20px flex-grow">
        <slot name="header"></slot>
      </div>
    </div>
    <div>
      <slot></slot>
    </div>
  </div>
</template>

<style lang="less" scoped>
@prefix-cls: ~'@{adminNamespace}-content-wrap';
.@{prefix-cls} {
  background-color: var(--app-content-bg-color);
  min-height: calc(100vh - var(--top-tool-height) - var(--top-heard-height));
  padding: 0 var(--app-content-padding);
  .wrap-title {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
  }
}
</style>
