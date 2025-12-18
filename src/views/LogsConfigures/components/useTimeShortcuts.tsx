// src/hooks/useTimeShortcuts.ts
import { ref, Ref, isRef, computed } from 'vue'
import dayjs from 'dayjs'
import type { Shortcut, TimeList } from '@/api/logsConfigure/types'

export const useTimeShortcuts = (list: TimeList[] | Ref<TimeList[]>, exactHour = ref(false)) => {
  // list 统一处理为 Ref
  const data = isRef(list) ? list : ref(list)

  /**
   * 模式1：相对时间
   */
  const makeRangeByMs = (msOffset: number): [Date, Date] => {
    const now = new Date()
    const end = new Date(now.getTime())

    // 整点模式
    if (exactHour.value && msOffset >= 60 * 60 * 1000) {
      end.setMinutes(0, 0, 0)
    }

    const start = new Date(end.getTime() - msOffset)
    return [start, end]
  }

  /**
   * 模式2：固定周期时间（今天、本周、本月）
   */
  const makeRangeByPeriod = (startOf: 'day' | 'week' | 'month', offset = 0): [Date, Date] => {
    const now = dayjs()
    const start = now.add(offset, startOf).startOf(startOf)
    const end = now.add(offset, startOf).endOf(startOf)
    return [start.toDate(), end.toDate()]
  }

  /**
   * 响应式生成 fixedShortcuts
   */
  const fixedShortcuts = computed<Shortcut[]>(() =>
    data.value.map((item) => ({
      text: item.text,
      value: () => {
        if (item.msOffset) return makeRangeByMs(item.msOffset)
        if (item.startOf) return makeRangeByPeriod(item.startOf, item.offset ?? 0)

        const now = new Date()
        return [now, now]
      }
    }))
  )

  /**
   * 自定义输入
   */
  const customDays = ref(0)
  const customHours = ref(0)
  const customMinutes = ref(0)

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
