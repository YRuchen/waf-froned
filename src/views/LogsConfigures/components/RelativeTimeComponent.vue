<script setup lang="tsx">
import { useTimeShortcuts } from './useTimeShortcuts'
import { TimeList } from '@/api/logsConfigure/types'
import { ref, onMounted, reactive, nextTick } from 'vue'
import { ElSwitch } from 'element-plus'
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
const firstList: TimeList[] = [
  { text: '今天', msOffset: 1 * 24 * 60 * 60 * 1000 },
  { text: '本周', msOffset: 3 * 24 * 60 * 60 * 1000 },
  { text: '本月', msOffset: 7 * 24 * 60 * 60 * 1000 }
]
const secondList: TimeList[] = [
  { text: '昨天', msOffset: 1 * 24 * 60 * 60 * 1000 },
  { text: '前天', msOffset: 3 * 24 * 60 * 60 * 1000 },
  { text: '上周', msOffset: 7 * 24 * 60 * 60 * 1000 }
]

const { fixedShortcuts: minuteShortcuts } = useTimeShortcuts(minuteList)
const { fixedShortcuts: hourShortcuts } = useTimeShortcuts(hourList)
const { fixedShortcuts: dayShortcuts } = useTimeShortcuts(dayList)
const firstShortcuts = [minuteShortcuts, hourShortcuts, dayShortcuts]
const secondShortcuts = [firstList, secondList]
</script>

<template>
  <div>
    <div class="flex justify-between items-center">
      <span>时间</span>
      <div>
        整点时间
        <ElSwitch v-model="exactHour" />
      </div>
    </div>
    <div class="grid grid-cols-[3fr_1fr]">
      <div class="flex">
        <div
          class="flex flex-col flex-wrap w-30%"
          v-for="(item, index) in firstShortcuts"
          :key="index"
        >
          <span v-for="short in item" :key="short.text">
            {{ short.text }}
          </span>
        </div>
      </div>
      <div class="flex">
        <div
          class="flex flex-col flex-wrap w-50%"
          v-for="(item, index) in secondShortcuts"
          :key="index"
        >
          <span v-for="short in item" :key="short.text">
            {{ short.text }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
