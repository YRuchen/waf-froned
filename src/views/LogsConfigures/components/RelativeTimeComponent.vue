<script setup lang="tsx">
import { useTimeShortcuts } from './useTimeShortcuts'
import { Shortcut, TimeList } from '@/api/logsConfigure/types'
import { ref, watch, reactive, nextTick, onMounted, computed } from 'vue'
import { formatToDateTime } from '@/utils/dateUtil'
import { ElSwitch } from 'element-plus'

const emit = defineEmits(['update:range'])
const exactHour = ref(false)
const minuteList: TimeList[] = [
  { text: '近1分钟', msOffset: 1 * 60 * 1000 },
  { text: '近5分钟', msOffset: 5 * 60 * 1000 },
  { text: '近10分钟', msOffset: 10 * 60 * 1000 },
  { text: '近15分钟', msOffset: 15 * 60 * 1000 },
  { text: '近30分钟', msOffset: 30 * 60 * 1000 }
]
const hourList: TimeList[] = [
  { text: '近1小时', msOffset: 60 * 60 * 1000 },
  { text: '近3小时', msOffset: 3 * 60 * 60 * 1000 },
  { text: '近6小时', msOffset: 6 * 60 * 60 * 1000 },
  { text: '近12小时', msOffset: 12 * 60 * 60 * 1000 }
]
const dayList: TimeList[] = [
  { text: '近1天', msOffset: 1 * 24 * 60 * 60 * 1000 },
  { text: '近3天', msOffset: 3 * 24 * 60 * 60 * 1000 },
  { text: '近7天', msOffset: 7 * 24 * 60 * 60 * 1000 }
]
const nowCutList: TimeList[] = [
  { text: '今天', startOf: 'day' },
  { text: '本周', startOf: 'week' },
  { text: '本月', startOf: 'month' }
]
const lastCutList: TimeList[] = [
  { text: '昨天', startOf: 'day', offset: -1 },
  { text: '前天', startOf: 'week', offset: -1 },
  { text: '上周', startOf: 'month', offset: -1 }
]

const { fixedShortcuts: minuteShortcuts } = useTimeShortcuts(minuteList, exactHour)
const { fixedShortcuts: hourShortcuts } = useTimeShortcuts(hourList, exactHour)
const { fixedShortcuts: dayShortcuts } = useTimeShortcuts(dayList, exactHour)
const { fixedShortcuts: nowShortcuts } = useTimeShortcuts(nowCutList, exactHour)
const { fixedShortcuts: lastShortcuts } = useTimeShortcuts(lastCutList, exactHour)
const firstShortcuts = computed(() => {
  return [
    minuteShortcuts.value || [],
    hourShortcuts.value || [],
    dayShortcuts.value || []
  ]
})
const secondShortcuts = computed(() => {
  return [
    nowShortcuts.value || [],
    lastShortcuts.value || []
  ]
})
const selectedShortcut = ref<Shortcut | null>(null)
const range = ref<[Date, Date]>([new Date(), new Date()])
const handleClick = (short) => {
  selectedShortcut.value = short
  range.value = short.value()
  emit('update:range', short.value(), short.text)
}

// watch(exactHour, () => {
//   if (selectedShortcut.value) {
//     range.value = selectedShortcut.value.value()
//   }
// })

onMounted(() => {
  if (dayShortcuts.value && dayShortcuts.value.length > 2) {
    handleClick(dayShortcuts.value[2])
  }
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center">
      <span>{{ formatToDateTime(range[0]) }}~{{ formatToDateTime(range[1]) }}</span>
      <div>
        <ElSwitch v-model="exactHour" active-text="整点时间" />
      </div>
    </div>
    <div class="grid grid-cols-[3fr_1fr]">
      <div class="flex">
        <div
          class="flex flex-col flex-wrap w-30%"
          v-for="(item, index) in firstShortcuts"
          :key="index"
        >
          <template v-for="(short, shortIndex) in (item || [])" :key="short?.text || `${index}-${shortIndex}`">
            <span
              v-if="short"
              @click="handleClick(short)"
              class="cursor-pointer my-1"
            >
              {{ short.text }}
            </span>
          </template>
        </div>
      </div>
      <div class="flex">
        <div
          class="flex flex-col flex-wrap w-50%"
          v-for="(item, index) in secondShortcuts"
          :key="index"
        >
          <template v-for="(short, shortIndex) in (item || [])" :key="short?.text || `${index}-${shortIndex}`">
            <span
              v-if="short"
              @click="handleClick(short)"
              class="cursor-pointer my-1"
            >
              {{ short.text }}
            </span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
