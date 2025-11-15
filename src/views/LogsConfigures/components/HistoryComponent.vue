<script setup lang="tsx">
import { useTimeShortcuts } from './useTimeShortcuts'
import { Shortcut, TimeList } from '@/api/logsConfigure/types'
import { ref, watch, reactive, nextTick, onMounted } from 'vue'

const emit = defineEmits(['update:range'])
let minuteList: TimeList[] = []

const { fixedShortcuts: minuteShortcuts } = useTimeShortcuts(minuteList)
const secondShortcuts = [minuteShortcuts]
const selectedShortcut = ref<Shortcut | null>(minuteShortcuts[0])
const range = ref<[Date, Date]>(selectedShortcut.value?.value() ?? [new Date(), new Date()])
const handleClick = (short) => {
  selectedShortcut.value = short
  range.value = short.value()
  emit('update:range', short.value(), short.text)
}
onMounted(() => {
  if (localStorage.getItem('historyTimeShortcurs')) {
    const stored = localStorage.getItem('historyTimeShortcurs')
    minuteList = stored ? JSON.parse(stored) : []
  } else {
    minuteList = [
      { text: '近7天', msOffset: 7 * 24 * 60 * 60 * 1000 },
      { text: '近30天', msOffset: 30 * 24 * 60 * 60 * 1000 },
      { text: '近90天', msOffset: 90 * 24 * 60 * 60 * 1000 }
    ]
    localStorage.setItem('historyTimeShortcurs', JSON.stringify(minuteList))
  }
})
</script>

<template>
  <div>
    <div class="grid">
      <div class="flex">
        <div
          class="flex flex-col flex-wrap w-100% mx-6"
          v-for="(item, index) in secondShortcuts"
          :key="index"
        >
          <div
            v-for="short in item"
            :key="short.text"
            @click="handleClick(short)"
            class="cursor-pointer my-2 flex justify-between"
          >
            <span>{{ short.text }}</span>
            <Icon icon="vi-ep:delete" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
