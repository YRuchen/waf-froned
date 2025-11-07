// src/hooks/useTimeShortcuts.ts
import { ref } from 'vue'

import { Shortcut, TimeList } from '@/api/logsConfigure/types'

export const useTimeShortcuts = (fixedList: TimeList[], exactHour = ref(false)) => {
  // 工具函数：从毫秒偏移量生成时间区间
  const makeRange = (msOffset: number): [Date, Date] => {
    const now = new Date()
    let end = new Date(now.getTime())

    // 对于分钟级别，不整点
    if (exactHour.value && msOffset >= 60 * 60 * 1000) {
      end.setMinutes(0, 0, 0) // 整点对齐
    }

    const start = new Date(end.getTime() - msOffset)
    return [start, end]
  }
  // 固定选项
  const fixedShortcuts: Shortcut[] = fixedList.map((item) => ({
    text: item.text,
    value: () => makeRange(item.msOffset)
  }))

  // 自定义输入（天 / 小时 / 分钟）
  const customDays = ref<number>(0)
  const customHours = ref<number>(0)
  const customMinutes = ref<number>(0)

  const getCustomRange = () => {
    const totalMs =
      (customDays.value * 24 * 60 + customHours.value * 60 + customMinutes.value) * 60 * 1000
    return makeRange(totalMs)
  }

  return {
    fixedShortcuts,
    customDays,
    customHours,
    customMinutes,
    getCustomRange
  }
}
