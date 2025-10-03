<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import { getTableListApi } from '@/api/table'
import { TableData } from '@/api/table/types'
import { ref, h, reactive } from 'vue'
import { FormSchema } from '@/components/Form'
import { useIcon } from '@/hooks/web/useIcon'
import { Icon } from '@iconify/vue'
import {
  ElTag,
  ElCard,
  ElButton,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElIcon,
  ElRow,
  ElCol,
  ElAnchor,
  ElAnchorLink
} from 'element-plus'
import { BaseButton } from '@/components/Button'
import { Search } from '@/components/Search'
const filterIcon = useIcon({ icon: 'vi-ep:filter' })
const refreshIcon = useIcon({ icon: 'vi-ep:refresh-right' })

const { t } = useI18n()
const containerRef = ref<HTMLElement | null>(null)

const handleClick = (e: MouseEvent) => {
  e.preventDefault()
}
const sections = [
  { id: 'part1', title: 'part1', height: '300px', bg: 'rgba(255, 0, 0, 0.02)' },
  { id: 'part2', title: 'part2', height: '300px', bg: 'rgba(0, 255, 0, 0.02)' },
  { id: 'part3', title: 'part3', height: '300px', bg: 'rgba(0, 0, 255, 0.02)' },
  {
    id: 'part4',
    title: 'part4',
    height: '100%',
    bg: 'rgba(0, 0, 255, 0.02)',
    content: 'part5555555555555'
  }
]
</script>
<style scoped>
:deep(.el-anchor__link) {
  padding: 11px 0 !important;
  font-size: 18px;
}
:deep(.el-anchor.el-anchor--vertical .el-anchor__marker) {
  height: 37px;
}
.container:not(:first-child) {
  margin-top: 30px;
}
</style>

<template>
  <div class="flex">
    <div class="flex-1">
      <div class="h-100px" style="background: rgba(0, 0, 255, 0.02)" id="part0"></div>
      <ElRow class="mt-5">
        <ElCol :span="4">
          <ElAnchor
            :container="containerRef"
            type="underline"
            direction="vertical"
            :bound="300"
            :offset="30"
            default-active="#part0"
            @click="handleClick"
            class="flex flex-col gap-3 text-lg font-medium"
          >
            <ElAnchorLink
              v-for="section in sections"
              :key="section.id"
              :href="`#${section.id}`"
              :title="section.title"
            />
          </ElAnchor>
        </ElCol>
        <ElCol :span="20">
          <div ref="containerRef" class="h-screen overflow-y-auto">
            <div
              v-for="section in sections"
              :key="section.id"
              :id="section.id"
              class="container"
              :style="`height: ${section.height}; background: ${section.bg}; `"
            >
              <div class="flex items-center gap-2">
                <!-- 前面的小色块 -->
                <span class="w-1 h-12 bg-blue-500 rounded-sm"></span>
                <!-- 文字 -->
                <span class="font-size-8">{{ section.title }}</span>
              </div>
            </div>
          </div>
        </ElCol>
      </ElRow>
    </div>

    <div class="w-20%"> </div>
  </div>
</template>
