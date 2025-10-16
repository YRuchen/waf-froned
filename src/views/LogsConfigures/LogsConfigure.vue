<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import { getTableListApi } from '@/api/table'
import { TableData } from '@/api/table/types'
import { ref, h, reactive } from 'vue'
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
  ElTabPane
} from 'element-plus'
import { BaseButton } from '@/components/Button'
import { Search } from '@/components/Search'
const filterIcon = useIcon({ icon: 'vi-ep:filter' })
interface Params {
  pageIndex?: number
  pageSize?: number
}

const { t } = useI18n()

const loading = ref(true)
const isShowFilter = ref(false)
const isTable = ref(false)
const value1 = ref('')
const activeName = ref('first')
const order = ref<string>('asc')
const getTableList = async (params?: Params) => {
  loading.value = false
}

getTableList()
const searchSchema = reactive<FormSchema[]>([
  {
    field: 'runStatus',
    // label: '接入状态',
    component: 'SelectLabel',
    componentProps: {
      placeholder: '请选择',
      label: '域名',
      options: [
        { label: '全部', value: '1' },
        { label: '未接入', value: '2' },
        { label: '配置失败', value: '3' },
        { label: '回源失败', value: '4' }
      ]
    }
  }
])
const filterSchema = reactive<FormSchema[]>([
  {
    field: 'IPAdress',
    // label: 'IP地址',
    component: 'Input',
    componentProps: {
      slots: {
        prepend: () => <>路径</>
      }
    }
  },
  {
    field: 'IPAdress',
    // label: 'IP地址',
    component: 'Input',
    componentProps: {
      slots: {
        prepend: () => <>源IP</>
      }
    }
  },
  {
    field: 'IPAdress',
    // label: 'IP地址',
    component: 'Input',
    componentProps: {
      slots: {
        prepend: () => <>WAF状态码</>
      }
    }
  },
  {
    field: 'runType',
    // label: '接入方式',
    component: 'SelectLabel',
    componentProps: {
      placeholder: '请选择',
      label: '风险等级',
      multiple: true,
      options: [{ label: 'CNAME接入', value: '1' }]
    }
  },
  {
    field: 'IPAdress',
    // label: 'IP地址',
    component: 'Input',
    componentProps: {
      slots: {
        prepend: () => <>规则ID</>
      }
    }
  },
  {
    field: 'IPAdress',
    // label: 'IP地址',
    component: 'Input',
    componentProps: {
      slots: {
        prepend: () => <>日志ID</>
      }
    }
  },
  {
    field: 'runType',
    // label: '接入方式',
    component: 'SelectLabel',
    componentProps: {
      placeholder: '请选择',
      label: '攻击类型',
      multiple: true,
      options: [{ label: 'web漏洞攻击', value: '1' }]
    }
  },
  {
    field: 'runType',
    // label: '接入方式',
    component: 'SelectLabel',
    componentProps: {
      placeholder: '请选择',
      label: '执行动作',
      multiple: true,
      options: [
        { label: '通过', value: '1' },
        { label: '例外', value: '2' },
        { label: '观察', value: '3' },
        { label: '拦截', value: '4' },
        { label: '人机验证', value: '5' },
        { label: '人机验证-拦截', value: '6' },
        { label: 'JS挑战', value: '7' },
        { label: 'JS挑战-拦截', value: '8' },
        { label: '工作量证明', value: '9' },
        { label: '工作量证明-拦截', value: '10' },
        { label: '丢弃', value: '11' },
        { label: '答案优化', value: '12' }
      ]
    }
  }
])
const resetSearchParams = (data: any) => {
  // searchParams.value = data
  // getList()
}
const onExpand = () => {
  isShowFilter.value = !isShowFilter.value
}
const handleClick = () => {}
</script>

<template>
  <ContentWrap :title="t('tableDemo.table')" :message="t('tableDemo.tableDes')">
    <div class="flex">
      <Search :schema="searchSchema" :showSearch="false" :showReset="false" />
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
          title="Title"
          :width="513"
          trigger="click"
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
              <ElTabPane label="User" name="first">User</ElTabPane>
              <ElTabPane label="Config" name="second">
                <ElDatePicker
                  v-model="value1"
                  type="daterange"
                  popper-class="absolute z-50"
                  style="width: 100%"
                  range-separator="To"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                />
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
