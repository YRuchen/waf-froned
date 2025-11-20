<script setup lang="tsx">
import { useTimeShortcuts } from './useTimeShortcuts'
import { Shortcut, TimeList } from '@/api/logsConfigure/types'
import { ref, watch, reactive, computed, onMounted } from 'vue'

const emit = defineEmits(['update:range'])

// 创建响应式的历史记录列表
const getDefaultHistory = (): TimeList[] => {
  return [
    { text: '近7天', msOffset: 7 * 24 * 60 * 60 * 1000 },
    { text: '近30天', msOffset: 30 * 24 * 60 * 60 * 1000 },
    { text: '近90天', msOffset: 90 * 24 * 60 * 60 * 1000 }
  ]
}

const loadHistoryFromStorage = (): TimeList[] => {
  const stored = localStorage.getItem('historyTimeShortcurs')
  if (stored) {
    const parsed = JSON.parse(stored)
    return parsed?.length > 0 ? parsed : getDefaultHistory()
  } else {
    return getDefaultHistory()
  }
}

// 使用 ref 存储历史记录，确保响应式更新
const minuteList = ref<TimeList[]>(loadHistoryFromStorage())

// 将 ref 传递给 useTimeShortcuts，这样它会响应式更新
const { fixedShortcuts: minuteShortcuts } = useTimeShortcuts(minuteList)
const selectedShortcut = ref<Shortcut | null>(null)
const range = ref<[Date, Date]>([new Date(), new Date()])

// 初始化选中项
watch(
  minuteShortcuts,
  (shortcuts) => {
    if (shortcuts.length > 0 && !selectedShortcut.value) {
      selectedShortcut.value = shortcuts[0]
      range.value = shortcuts[0].value()
      emit('update:range', shortcuts[0].value(), shortcuts[0].text)
    }
  },
  { immediate: true }
)

const handleClick = (short) => {
  selectedShortcut.value = short
  range.value = short.value()
  emit('update:range', short.value(), short.text)
}

const handleDelete = (e, index) => {
  e.stopPropagation()
  // 检查删除的是否是当前选中的项
  const deletedShortcut = minuteShortcuts.value[index]
  const isDeletingSelected = selectedShortcut.value?.text === deletedShortcut?.text
  
  // 从响应式列表中删除
  minuteList.value.splice(index, 1)
  // 更新 localStorage
  localStorage.setItem('historyTimeShortcurs', JSON.stringify(minuteList.value))
  
  // 如果删除的是当前选中的项，或者删除后列表发生变化，自动选中第一项
  if (isDeletingSelected && minuteShortcuts.value.length > 0) {
    selectedShortcut.value = minuteShortcuts.value[0]
    range.value = minuteShortcuts.value[0].value()
    emit('update:range', minuteShortcuts.value[0].value(), minuteShortcuts.value[0].text)
  }
}

onMounted(() => {})
</script>

<template>
  <div>
    <div class="grid">
      <div class="flex">
        <div class="flex flex-col flex-wrap w-100% mx-6">
          <div
            v-for="(short, index) in minuteShortcuts"
            :key="short.text"
            @click="handleClick(short)"
            class="cursor-pointer my-2 flex justify-between"
          >
            <span>{{ short.text }}</span>
            <Icon icon="vi-ep:delete" @click.stop="(e) => handleDelete(e, index)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
