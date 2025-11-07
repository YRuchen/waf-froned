<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import { TableData } from '@/api/table/types'
import { ref, onMounted, reactive, nextTick } from 'vue'
import { FormSchema } from '@/components/Form'
import { useIcon } from '@/hooks/web/useIcon'
import { Icon } from '@iconify/vue'
import {
  ElDatePicker,
  ElPopover,
  ElButton,
  ElTooltip,
  ElRadioGroup,
  ElRadioButton,
  ElTabs,
  ElTabPane,
  ElOption,
  ElCheckbox
} from 'element-plus'
import { BaseButton } from '@/components/Button'
import { Search } from '@/components/Search'
import AbsoluteTimeComponent from './components/AbsoluteTimeComponent.vue'
import RelativeTimeComponent from './components/RelativeTimeComponent.vue'
import { getTableListApi } from '@/api/vulnerabilityProtection'
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
const order = ref<string>('asc')
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
    componentProps: {
      slots: {
        prepend: () => <>路径</>
      }
    }
  },
  {
    field: 'srcIp',
    component: 'Input',
    componentProps: {
      slots: {
        prepend: () => <>源IP</>
      }
    }
  },
  {
    field: 'statusCode',
    component: 'Input',
    componentProps: {
      slots: {
        prepend: () => <>WAF状态码</>
      }
    }
  },
  {
    field: 'severity',
    component: 'SelectLabel',
    componentProps: {
      placeholder: '请选择',
      label: '风险等级',
      multiple: true,
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
    componentProps: {
      slots: {
        prepend: () => <>规则ID</>
      }
    }
  },
  {
    field: 'logId',
    component: 'Input',
    componentProps: {
      slots: {
        prepend: () => <>日志ID</>
      }
    }
  },
  {
    field: 'attack',
    component: 'SelectLabel',
    componentProps: {
      placeholder: '请选择',
      label: '攻击类型',
      multiple: true,
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
    component: 'SelectLabel',
    componentProps: {
      placeholder: '请选择',
      label: '执行动作',
      multiple: true,
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
  // getList()
}
const resetSearchParams = (data: Params) => {
  searchParams.value = data
  // getList()
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
onMounted(() => {})
</script>

<template>
  <ContentWrap :title="t('tableDemo.table')" :message="t('tableDemo.tableDes')">
    <div class="flex">
      <Search
        :schema="searchSchema"
        :showSearch="false"
        :showReset="false"
        labelWidth="60px"
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
      labelWidth="160"
      layout="inline"
      @search="resetSearchParams"
      @reset="resetSearchParams"
      v-if="isShowFilter"
    />
    <div class="flex items-center gap-6">
      <ElRadioGroup v-model="isTable">
        <ElRadioButton :value="false">原始</ElRadioButton>
        <ElRadioButton :value="true">表格</ElRadioButton>
      </ElRadioGroup>
      <ElTooltip content="时间排序" placement="top" effect="light">
        <ElButton plain>
          <template #default>
            <span>时间</span>
            <div class="flex flex-col ml-2">
              <Icon
                icon="ep:caret-top"
                class="cursor-pointer"
                :class="order === 'asc' ? '' : 'text-gray-400'"
                @click="order = 'asc'"
              ></Icon>
              <Icon
                icon="ep:caret-bottom"
                class="cursor-pointer"
                :class="order === 'desc' ? '' : 'text-gray-400'"
                @click="order = 'desc'"
              ></Icon>
            </div>
          </template>
        </ElButton>
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
                <span>这是插入的地方</span>
                <Icon icon="ep:calendar" class="ml-2" />
              </template>
            </ElButton>
          </template>
          <template #default>
            <ElTabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
              <ElTabPane label="相对时间" name="first">
                <RelativeTimeComponent />
              </ElTabPane>
              <ElTabPane label="绝对时间" name="second">
                <AbsoluteTimeComponent />
              </ElTabPane>
              <ElTabPane label="Role" name="third">Role</ElTabPane>
              <ElTabPane label="Task" name="fourth">Task</ElTabPane>
            </ElTabs>
          </template>
        </ElPopover>
      </div>
    </div>
  </ContentWrap>
</template>
