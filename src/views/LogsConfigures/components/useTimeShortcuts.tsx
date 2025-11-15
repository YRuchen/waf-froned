// src/hooks/useTimeShortcuts.ts
import { ref } from 'vue'
import dayjs from 'dayjs'
import type { Shortcut, TimeList } from '@/api/logsConfigure/types'

export const useTimeShortcuts = (fixedList: TimeList[], exactHour = ref(false)) => {
  /**
   * 模式1：相对时间（近X分钟/小时/天）
   */
  const makeRangeByMs = (msOffset: number): [Date, Date] => {
    const now = new Date()
    const end = new Date(now.getTime())

    // 整点时间模式，仅在大于1小时的时间段生效
    if (exactHour.value && msOffset >= 60 * 60 * 1000) {
      end.setMinutes(0, 0, 0)
    }

    const start = new Date(end.getTime() - msOffset)
    return [start, end]
  }

  /**
   * 模式2：固定时间段（今天、本周、本月、昨天、上周等）
   */
  const makeRangeByPeriod = (startOf: 'day' | 'week' | 'month', offset = 0): [Date, Date] => {
    const now = dayjs()
    const start = now.add(offset, startOf).startOf(startOf)
    const end = now.add(offset, startOf).endOf(startOf)
    return [start.toDate(), end.toDate()]
  }

  /**
   * 统一封装
   */
  const fixedShortcuts: Shortcut[] = fixedList.map((item) => {
    return {
      text: item.text,
      value: () => {
        // 优先级：msOffset > startOf
        if (item.msOffset) {
          return makeRangeByMs(item.msOffset)
        } else if (item.startOf) {
          return makeRangeByPeriod(item.startOf as any, item.offset ?? 0)
        } else {
          const now = new Date()
          return [now, now]
        }
      }
    }
  })

  /**
   * 自定义输入（天/小时/分钟）
   */
  const customDays = ref<number>(0)
  const customHours = ref<number>(0)
  const customMinutes = ref<number>(0)

  const getCustomRange = () => {
    const totalMs =
      (customDays.value * 24 * 60 + customHours.value * 60 + customMinutes.value) * 60 * 1000
    return makeRangeByMs(totalMs)
  }

  return {
    fixedShortcuts,
    customDays,
    customHours,
    customMinutes,
    getCustomRange
  }
}
