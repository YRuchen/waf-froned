<script setup lang="tsx">
import { useTimeShortcuts } from './useTimeShortcuts'
import { Shortcut, TimeList } from '@/api/logsConfigure/types'
import { ref, watch, reactive, nextTick, onMounted } from 'vue'

const emit = defineEmits(['update:range'])
const minuteList: TimeList[] = [
  { text: '近7天', msOffset: 7 * 24 * 60 * 60 * 1000 },
  { text: '近30天', msOffset: 30 * 24 * 60 * 60 * 1000 },
  { text: '近90天', msOffset: 90 * 24 * 60 * 60 * 1000 }
]

const { fixedShortcuts: minuteShortcuts } = useTimeShortcuts(minuteList)
const secondShortcuts = [minuteShortcuts]
const selectedShortcut = ref<Shortcut | null>(minuteShortcuts[0])
const range = ref<[Date, Date]>(selectedShortcut.value?.value() ?? [new Date(), new Date()])
const handleClick = (short) => {
  selectedShortcut.value = short
  range.value = short.value()
  emit('update:range', short.text)
}
onMounted(() => {
  if (localStorage.getItem('historyTimeShortcurs')) {
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
            <icon icon="vi-ep:delete"></icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
