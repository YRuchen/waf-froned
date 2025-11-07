// src/hooks/useTimeShortcuts.ts
import { ref } from 'vue'

import { Shortcut, TimeList } from '@/api/logsConfigure/types'

export const useTimeShortcuts = (fixedList: TimeList[]) => {
  // 工具函数：从毫秒偏移量生成时间区间
  const makeRange = (msOffset: number): [Date, Date] => {
    const end = new Date()
    const start = new Date(end.getTime() - msOffset)
    return [start, end]
  }
  /**
 * [
    { text: '最近1分钟', value: () => makeRange(1 * 60 * 1000) },
    { text: '最近5分钟', value: () => makeRange(5 * 60 * 1000) },
    { text: '最近1小时', value: () => makeRange(60 * 60 * 1000) },
    { text: '最近7天', value: () => makeRange(7 * 24 * 60 * 60 * 1000) },
    { text: '最近30天', value: () => makeRange(30 * 24 * 60 * 60 * 1000) }
  ]
 */
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
