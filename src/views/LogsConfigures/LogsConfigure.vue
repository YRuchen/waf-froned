<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { ref, onMounted, reactive, computed, watchEffect } from 'vue'
import { FormSchema } from '@/components/Form'
import { useIcon } from '@/hooks/web/useIcon'
import {
  ElPopover,
  ElButton,
  ElTooltip,
  ElRadioGroup,
  ElRadioButton,
  ElTabs,
  ElTabPane,
  ElOption,
  ElCheckbox,
  ElPagination,
  ElTag,
  ElTableColumn,
  ElTable,
  ElMessage,
  ElEmpty,
  ElCollapseItem,
  ElCollapse
} from 'element-plus'
import { BaseButton } from '@/components/Button'
import { Search } from '@/components/Search'
import AbsoluteTimeComponent from './components/AbsoluteTimeComponent.vue'
import RelativeTimeComponent from './components/RelativeTimeComponent.vue'
import HistoryComponent from './components/HistoryComponent.vue'
import { formatToDateTime } from '@/utils/dateUtil'
import { getTableListApi, getLogsApi } from '@/api/logsConfigure'
import { SORTBY } from '@/api/logsConfigure/types'

const filterIcon = useIcon({ icon: 'vi-ep:filter' })
interface Params {
  pageIndex?: number
  pageSize?: number
}

const { t } = useI18n()

const loading = ref(true)
const isShowFilter = ref(false)
const isTable = ref(false)
const activeName = ref('first')
const sortBy = ref<string>(SORTBY.ASC)
const options = ref()
interface Params {
  domain: Array<string>
}
// 查询的输入项
const searchParams = ref<Params>({
  domain: []
})
// search组件
const searchExpose = ref<any>(null)
// search组件的入口方法
const register = (expose: any) => {
  searchExpose.value = expose
}
const apiOptions = ref<any>([])
const domainArr = ref<any>([])
const handleChange = (vals: string[]) => {
  const allOption = 'all'
  const allValues = apiOptions.value.map((i) => i.value)
  const allCount = allValues.length

  // --- 全选被点击 ---
  if (vals.includes(allOption)) {
    if (vals.length === 1) {
      // 第一次点击“全部”
      domainArr.value = [...allValues]
    } else if (vals.length > domainArr.value.length) {
      // 从部分选中到全选
      domainArr.value = [...allValues]
    } else {
      // 取消“全部”选中
      domainArr.value = vals.filter((v) => v !== allOption)
    }
    apiOptions.value.map((v) =>
      v.value == 'all'
        ? (v.isIndeterminate = domainArr.value.length != apiOptions.value.length)
        : null
    )

    searchExpose.value?.setValues?.({
      domain: domainArr.value.includes(allOption) ? [allOption] : domainArr.value
    })
    return
  }

  // --- 普通多选逻辑 ---
  domainArr.value = vals.filter((v) => v !== allOption)

  // 当所有项都选中时自动补上“全部”
  if (domainArr.value.length === allCount - 1) {
    domainArr.value = [...allValues]
    searchExpose.value?.setValues?.({ domain: [allOption] })
  } else {
    searchExpose.value?.setValues?.({ domain: domainArr.value })
  }
  apiOptions.value.map((v) =>
    v.value == 'all'
      ? (v.isIndeterminate =
          domainArr.value.length != 0 ? domainArr.value.length != apiOptions.value.length : false)
      : null
  )
}
const searchSchema = reactive<FormSchema[]>([
  {
    field: 'domain',
    label: '域名',
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      options: [],
      slots: {
        default: (options: any[]) => {
          return (
            <>
              {options.map((opt) => (
                <ElOption key={opt.value} label={opt.label} value={opt.value}>
                  {{
                    default: () => (
                      <ElCheckbox
                        model-value={domainArr.value.includes(opt.value)}
                        indeterminate={opt.isIndeterminate}
                      >
                        {opt.label}
                      </ElCheckbox>
                    )
                  }}
                </ElOption>
              ))}
            </>
          )
        }
      },
      on: {
        change: handleChange
      }
    },
    optionApi: async () => {
      const res = await getTableListApi({ page: 1, pageSize: 1000 })
      const domains = res.data.domains.map((opt: any) => ({
        label: opt.hostname,
        value: opt.hostname
      }))
      apiOptions.value = [{ label: '全部', value: 'all', isIndeterminate: false }, ...domains]
      return apiOptions.value
    }
  }
])
const filterSchema = reactive<FormSchema[]>([
  {
    field: 'path',
    component: 'Input',
    label: '路径',
    formItemProps: {
      labelWidth: '2.4rem'
    }
  },
  {
    field: 'srcIp',
    component: 'Input',
    label: '源IP',
    formItemProps: {
      labelWidth: '2.4rem'
    }
  },
  {
    field: 'statusCode',
    component: 'Input',
    label: 'WAF状态码',
    formItemProps: {
      labelWidth: '5.8rem'
    }
  },
  {
    field: 'severity',
    component: 'Select',
    label: '风险等级',
    componentProps: {
      placeholder: '请选择',
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      options: [
        { label: '严重', value: 'Critical' },
        { label: '高危', value: 'High' },
        { label: '中危', value: 'Medium' },
        { label: '低危', value: 'Low' }
      ]
    }
  },
  {
    field: 'ruleId',
    component: 'Input',
    label: '规则ID',
    formItemProps: {
      labelWidth: '3.3rem'
    }
  },
  {
    field: 'logId',
    component: 'Input',
    label: '日志ID',
    formItemProps: {
      labelWidth: '3.3rem'
    }
  },
  {
    field: 'attack',
    component: 'Select',
    label: '攻击类型',
    componentProps: {
      placeholder: '请选择',
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      // TODO: 以下注释掉的，是暂时不做的功能
      options: [
        { label: 'web漏洞攻击', value: 'WebVulnerability' }
        // { label: '黑名单', value: 'Black' },
        // { label: '地理位置封禁', value: 'GeoBlack' },
        // { label: 'CC/HTTP Flood', value: 'HttpFlood' }
      ]
    }
  },
  {
    field: 'runType',
    component: 'Select',
    label: '执行动作',
    componentProps: {
      placeholder: '请选择',
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      // TODO: 以下注释掉的，是暂时不做的功能
      options: [
        { label: '通过', value: 'Pass' },
        { label: '例外', value: 'Permit' },
        { label: '观察', value: 'Observe' },
        { label: '拦截', value: 'Block' },
        { label: '人机验证', value: 'HumanVerify' },
        { label: '人机验证-拦截', value: 'HumanVerifyBlock' },
        { label: 'JS挑战', value: 'JS' },
        { label: 'JS挑战-拦截', value: 'JSBlock' },
        // { label: '工作量证明', value: '9' },
        // { label: '工作量证明-拦截', value: '10' },
        { label: '丢弃', value: 'Drop' }
        // { label: '答案优化', value: '12' }
      ]
    }
  }
])
// 搜索
const handleSearch = (params: Params) => {
  searchParams.value = params
  getLogs()
}
const resetSearchParams = (data: Params) => {
  searchParams.value = data
  getLogs()
}
const onExpand = () => {
  isShowFilter.value = !isShowFilter.value
}
const handleClick = () => {}
/**获取域名 */
const getTableList = async () => {
  const res = await getTableListApi()
  loading.value = false
  options.value = res.data.domains
}
const selectedRange = ref<[Date, Date]>([new Date(), new Date()])
const selectRangeText = ref('')
/**渲染时间 */
const handleRangeUpdate = (displayRange, rangeText) => {
  selectedRange.value = displayRange
  selectRangeText.value = rangeText
  getLogs()
}
const displayText = computed(() => {
  if (!selectedRange.value) return '请选择时间范围'
  if (selectRangeText.value == '绝对时间') {
    const [start, end] = selectedRange.value
    return `${formatToDateTime(start)} ~ ${formatToDateTime(end)}`
  }
  return selectRangeText.value
})

const currentPage2 = ref(5)
const limit = ref(20)
const total = ref(10)
const pageInfo = ref<any>({})
const background = ref(false)
const disabled = ref(false)
const tableList = ref<any[]>([])
const rawColumns = ref<Array<{ prop: string; label: string }>>([])
/**切换分页 */
const handleCurrentChange = (val: any, action: string) => {
  const data = action == 'before' ? { beforeCursor: val } : { afterCursor: val }
  getLogs(data)
}
/**首字符转大小写 */
const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
/**获取列表 */
const getLogs = async (params?: any) => {
  const res = await getLogsApi({
    startTsMs: String(new Date(selectedRange.value[0]).getTime()),
    endTsMs: String(new Date(selectedRange.value[1]).getTime()),
    limit: limit.value,
    sortBy: sortBy.value,
    ...params,
    ...searchParams.value,
    domain: domainArr.value.includes('all') ? '' : domainArr.value
  })

  tableList.value = res.data.list.map((item) => ({
    ...Object.fromEntries(Object.entries(item).map(([key, value]) => [capitalize(key), value])),
    display: true
  }))
  limit.value = res.data.limit
  total.value = Number(res.data.total) || 0
  pageInfo.value = res.data.pageInfo

  const entries = Object.entries(tableList.value[0] ?? []) as [string, any][]
  const time = entries.find(([key]) => key === 'TimeFriendly')
  const others = entries.filter(([key]) => key !== 'TimeFriendly')

  rawColumns.value = [...(time ? [[time[0], time[1]]] : []), ...others].map(([key]) => ({
    prop: key,
    label: key === 'TimeFriendly' ? '时间' : key
  }))
  // rawColumns.value = Object.entries(tableList.value[0] ?? []).map(([key]) => ({
  //   prop: key,
  //   label: key == 'TimeFriendly' ? '时间' : key
  // }))
}
const excludes = ['TimeFriendly', 'display']
/**处理展示数据  */
const displayList = (item) => {
  return Object.fromEntries(Object.entries(item).filter(([key]) => !excludes.includes(key)))
}
/**排序 */
const handleSortBy = (val) => {
  sortBy.value = val
  getLogs()
}
const currentIndex = ref(0) // 当前高亮list

const nextItem = (activeName) => {
  tableList.value[activeName].display = true
}
const prevItem = (activeName) => {
  tableList.value[activeName].display = false
}

/**复制 */
const handleCopy = (item) => {
  navigator.clipboard.writeText(JSON.stringify(item, null, 2))
  ElMessage({
    message: '复制成功',
    type: 'success'
  })
}

const formatValue = (val: any) => {
  if (typeof val === 'object') {
    return JSON.stringify(val)
  }
  return val
}

// 自动计算宽度
const columns = ref(
  rawColumns.value.map((col) => ({
    ...col,
    width: 100 // 初始值，后面会自动覆盖
  }))
)

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')!
ctx.font = '14px Arial'

watchEffect(() => {
  if (!tableList.value?.length) {
    columns.value = rawColumns.value.map((col) => ({
      ...col,
      width: 120 // 默认宽度
    }))
    return
  }

  const padding = 32 // 单元格左右留白
  const minWidth = 80

  columns.value = rawColumns.value.map((col) => {
    // ==== 计算表头宽度 ====
    let maxWidth = ctx.measureText(col.label).width

    // ==== 遍历所有行 ====
    for (const row of tableList.value) {
      const cellValue = row[col.prop]

      // 对象 → 转成字符串显示
      let text = ''
      if (typeof cellValue === 'object' && cellValue !== null) {
        text = Object.entries(cellValue)
          .map(([k, v]) => `${k}:${v}`)
          .join(', ')
      } else {
        text = String(cellValue ?? '')
      }

      const width = ctx.measureText(text).width
      if (width > maxWidth) {
        maxWidth = width
      }
    }

    // ==== 加 padding 并保证最小宽度 ====
    const computedWidth = Math.ceil(maxWidth + padding)
    return {
      ...col,
      width: Math.max(minWidth, computedWidth)
    }
  })
})

onMounted(() => {
  getLogs()
})
</script>
<style scoped>
.log-content {
  background-color: #ffffff !important;
  padding: 16px;
  border-radius: var(--primary-raduis);
}
</style>

<template>
  <ContentWrap class="log-content">
    <div class="flex">
      <Search
        :schema="searchSchema"
        :showSearch="false"
        :showReset="false"
        labelWidth="2.5rem"
        :autoSearch="true"
        :autoSearchDebounce="1000"
        @search="handleSearch"
        @register="register"
      />
      <BaseButton :icon="filterIcon" plain @click="onExpand">
        {{ isShowFilter ? '隐藏快捷筛选' : '展开快捷筛选' }}
      </BaseButton>
    </div>
    <Search
      :schema="filterSchema"
      labelWidth="4rem"
      layout="inline"
      @search="resetSearchParams"
      @reset="resetSearchParams"
      v-if="isShowFilter"
    />
    <div class="flex items-center gap-6">
      <div class="flex items-center">
        <ElRadioGroup v-model="isTable">
          <ElRadioButton :value="false">原始</ElRadioButton>
          <ElRadioButton :value="true">表格</ElRadioButton>
        </ElRadioGroup>
      </div>
      <ElTooltip content="时间排序" placement="top" effect="light">
        <ElTag type="info" effect="plain" size="large">
          <div class="flex flex-items-center">
            <span>时间</span>
            <div class="flex flex-col ml-2">
              <Icon
                icon="ep:caret-top"
                class="cursor-pointer"
                :class="sortBy === SORTBY.ASC ? '!text-gray-900' : '!text-gray-300'"
                @click="handleSortBy(SORTBY.ASC)"
              />
              <Icon
                icon="ep:caret-bottom"
                class="cursor-pointer"
                :class="sortBy === SORTBY.DESC ? '!text-gray-900' : '!text-gray-300'"
                @click="handleSortBy(SORTBY.DESC)"
              />
            </div>
          </div>
        </ElTag>
      </ElTooltip>
      <div class="ml-10">
        <span class="mr-2">调整时间范围</span>
        <ElPopover
          placement="bottom"
          :width="680"
          trigger="click"
          append-to-body
          persistent
          popper-class="overflow-visible"
        >
          <template #reference>
            <ElButton plain>
              <template #default>
                <span>{{ displayText }}</span>
                <Icon icon="ep:calendar" class="ml-2" />
              </template>
            </ElButton>
          </template>
          <template #default>
            <ElTabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
              <ElTabPane label="相对时间" name="first">
                <RelativeTimeComponent @update:range="handleRangeUpdate" />
              </ElTabPane>
              <ElTabPane label="绝对时间" name="second">
                <AbsoluteTimeComponent @update:range="handleRangeUpdate" />
              </ElTabPane>
              <ElTabPane label="历史记录" name="third">
                <HistoryComponent @update:range="handleRangeUpdate" />
              </ElTabPane>
            </ElTabs>
          </template>
        </ElPopover>
      </div>
      <div class="ml-auto flex items-center">
        <ElButton
          link
          type="primary"
          class="!border !border-gray-300"
          :disabled="!pageInfo.hasPrev"
          @click="handleCurrentChange(pageInfo.beforeCursor, 'before')"
        >
          <Icon icon="vi-ep:arrow-left"></Icon>
        </ElButton>
        <ElButton
          link
          type="primary"
          class="!border !border-gray-300 mr-2"
          :disabled="!pageInfo.hasNext"
          @click="handleCurrentChange(pageInfo.afterCursor, 'after')"
        >
          <Icon icon="vi-ep:arrow-right"></Icon>
        </ElButton>
        <ElPagination
          v-model:current-page="currentPage2"
          v-model:page-size="limit"
          :page-sizes="[10, 20, 50, 100]"
          size="small"
          :disabled="disabled"
          :background="background"
          layout="sizes"
          :total="total"
          @size-change="getLogs"
        />
      </div>
    </div>
    <div class="overflow-auto h-70vh mt-4" ref="scrollContainer" v-if="!isTable">
      <div v-for="(item, index) in tableList" :key="index" class="m-2">
        <div
          :id="`log-item-${index}`"
          class="grid grid-cols-[1%_5%_70%] gap-5"
          :class="currentIndex === index ? 'bg-gray-100 border border-blue-300' : ''"
          @mouseenter="currentIndex = index"
        >
          <p>{{ index + 1 }}</p>
          <div class="break-words whitespace-normal">
            {{ item.TimeFriendly }}
          </div>
          <div>
            <div>
              <ElButton link type="primary">
                <Icon icon="vi-ep:copy-document" @click="handleCopy(item)"></Icon>
              </ElButton>
              <ElButton
                link
                type="primary"
                class="!border !border-gray-300"
                @click="() => nextItem(index)"
              >
                <Icon icon="vi-ep:arrow-down"></Icon>
              </ElButton>
              <ElButton
                link
                type="primary"
                class="!border !border-gray-300"
                @click="() => prevItem(index)"
              >
                <Icon icon="vi-ep:arrow-up"></Icon>
              </ElButton>
            </div>
            <div
              v-for="(value, key) in displayList(item)"
              :key="key"
              class="text-sm text-gray-600 py-1"
              :class="item.display ? 'block' : 'hidden'"
            >
              <ElTag type="info" color="rgb(197 197 199)">
                <strong>{{ key }}:</strong>
              </ElTag>
              {{ value }}
            </div>
            <!-- <ElCollapse v-model="activeNames" :before-collapse="beforeCollapse">
              <ElCollapseItem :name="index">
                <template #icon>
                  <span @click.stop></span>
                </template>
                <template #title> </template>
              </ElCollapseItem>
            </ElCollapse> -->
          </div>
        </div>
      </div>
    </div>
    <div class="overflow-hidden h-68vh mt-4" v-else>
      <ElTable :data="tableList" border height="96%" v-if="tableList.length">
        <ElTableColumn type="index"> </ElTableColumn>
        <ElTableColumn
          v-for="(col, index) in columns"
          :key="index"
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
        >
          <template #default="scope">
            <span>{{ formatValue(scope.row[col.prop]) }}</span>
          </template>
        </ElTableColumn>
      </ElTable>
      <ElTable :data="tableList" border height="96%" v-else>
        <ElTableColumn label="时间" align="center"> </ElTableColumn>
        <template #empty>
          <ElEmpty> </ElEmpty>
        </template>
      </ElTable>
    </div>
  </ContentWrap>
</template>
