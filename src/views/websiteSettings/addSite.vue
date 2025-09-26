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
</script>

<template>
  <div class="flex">
    <ElRow class="flex-1">
      <ElCol :span="6">
        <ElAnchor
          :container="containerRef"
          direction="vertical"
          type="default"
          :bound="320"
          :default-active="'#part1'"
          @click="handleClick"
        >
          <ElAnchorLink href="#part1" title="part1" />
          <ElAnchorLink href="#part2" title="part2" />
          <ElAnchorLink href="#part3" title="part3" />
          <ElAnchorLink href="#part4" title="part4" />
        </ElAnchor>
      </ElCol>
      <ElCol :span="18">
        <div ref="containerRef" class="h-screen overflow-y-auto">
          <div
            id="part1"
            style="height: 300px; background: rgba(255, 0, 0, 0.02); margin-top: 30px"
          >
            part1
          </div>
          <div
            id="part2"
            style="height: 300px; background: rgba(0, 255, 0, 0.02); margin-top: 30px"
          >
            part2
          </div>
          <div
            id="part3"
            style="height: 300px; background: rgba(0, 0, 255, 0.02); margin-top: 30px"
          >
            part3
          </div>
          <div
            id="part4"
            style="height: 300px; background: rgba(0, 0, 255, 0.02); margin-top: 30px"
          >
            part5555555555555
          </div>
        </div>
      </ElCol>
    </ElRow>
    <div class="w-20%"> </div>
  </div>
</template>
