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
  ElTag,
  ElCard,
  ElButton,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElIcon
} from 'element-plus'
import { BaseButton } from '@/components/Button'
import { Search } from '@/components/Search'
const filterIcon = useIcon({ icon: 'vi-ep:filter' })
const refreshIcon = useIcon({ icon: 'vi-ep:refresh-right' })
interface Params {
  pageIndex?: number
  pageSize?: number
}

const { t } = useI18n()

const columns: TableColumn[] = [
  {
    field: 'title',
    label: '防护网站',
    sortable: true
  },
  {
    field: 'importance',
    label: '接入状态',
    formatter: (_: Recordable, __: TableColumn, cellValue: number) => {
      return h(
        ElTag,
        {
          type: cellValue === 1 ? 'success' : cellValue === 2 ? 'warning' : 'danger'
        },
        () =>
          cellValue === 1
            ? t('tableDemo.important')
            : cellValue === 2
              ? t('tableDemo.good')
              : t('tableDemo.commonly')
      )
    }
  },
  {
    field: 'display_time',
    label: '防护模式'
  },
  {
    field: 'pageviews',
    label: '响应式检测'
  },
  {
    field: 'pageviews',
    label: '更新时间',
    sortable: true
  },
  {
    field: 'action',
    label: t('tableDemo.action'),
    width: 240,
    slots: {
      default: (data: any) => {
        // const row = data.row
        return (
          <div class="flex">
            <ElButton type="primary" link>
              {t('exampleDemo.edit')}
            </ElButton>
            <ElDropdown
              trigger="click"
              onCommand={(cmd) => handleCommand(cmd)}
              v-slots={{
                dropdown: () => (
                  <ElDropdownMenu>
                    <ElDropdownItem command="protect">防护设置</ElDropdownItem>
                    <ElDropdownItem command="enableLog">开启日志采集</ElDropdownItem>
                    <ElDropdownItem command="disableLog">关闭日志采集</ElDropdownItem>
                    <ElDropdownItem command="delete">删除</ElDropdownItem>
                  </ElDropdownMenu>
                )
              }}
            >
              <ElButton type="primary" link>
                更多
                <Icon icon="ep:arrow-down" />
              </ElButton>
              {/* <template v-slot:dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem>操作1</ElDropdownItem>
                  <ElDropdownItem>操作2</ElDropdownItem>
                </ElDropdownMenu>
              </template> */}
            </ElDropdown>
          </div>
        )
      }
    }
    // slots: {
    //   default: (data) => {
    //     return <span>8888</span>
    //   }
    // }
  }
]

const loading = ref(true)
const resetLoading = ref(false)
const isShowFilter = ref(false)

const tableDataList = ref<TableData[]>([
  {
    id: '1',
    author: 'string',
    title: 'string',
    content: 'string',
    importance: 1,
    display_time: '222',
    pageviews: 11
  }
])
const handleCommand = (cmd) => {}
const getTableList = async (params?: Params) => {
  // const res = await getTableListApi(
  //   params || {
  //     pageIndex: 1,
  //     pageSize: 10
  //   }
  // )
  //   .catch(() => {})
  //   .finally(() => {
  //     loading.value = false
  //   })
  // if (res) {
  //   tableDataList.value = res.data.list
  // }
  loading.value = false
}

getTableList()
// el-card
// “正常”、“未接入”、“配置失败”、“回源失败”
const cardsType = ref([
  {
    name: '域名总数',
    total: 1,
    activeNum: 1,
    notActiveNum: 1,
    failedNum: 1,
    unreachableNum: 2
  },
  {
    name: '未防护域名',
    total: 1,
    activeNum: 1,
    notActiveNum: 1,
    failedNum: 1,
    unreachableNum: 2
  }
])
const statusList = ref([
  { name: '正常', count: 1, color: '#67C23A' },
  { name: '未接入', count: 2, color: '#E6A23C' },
  { name: '配置失败', count: 3, color: '#F56C6C' },
  { name: '回源失败', count: 1, color: '#909399' }
])
const searchSchema = reactive<FormSchema[]>([
  {
    field: 'webName',
    component: 'Input',
    componentProps: {
      slots: {
        prepend: () => <>域名</>
      }
    }
  },
  {
    field: 'runStatus',
    // label: '接入状态',
    component: 'SelectLabel',
    componentProps: {
      placeholder: '请选择',
      label: '接入状态',
      options: [
        { label: '正常', value: '1' },
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
const getList = () => {
  console.log(6666)
}
</script>

<template>
  <ContentWrap :title="t('tableDemo.table')" :message="t('tableDemo.tableDes')">
    <div class="flex justify-between">
      <div class="flex">
        <Search :schema="searchSchema" :showSearch="false" :showReset="false" />
        <BaseButton :icon="filterIcon" plain @click="onExpand">
          {{ t('common.advancedFilter') }}
        </BaseButton>
        <BaseButton :loading="resetLoading" plain :icon="refreshIcon" @click="resetSearchParams">
          {{ t('common.reset') }}
        </BaseButton>
      </div>
      <div>
        <ElButton>批量导入</ElButton>
        <ElButton type="primary">新建站点</ElButton>
      </div>
    </div>
    <Search :schema="filterSchema" :showSearch="false" :showReset="false" v-if="isShowFilter" />
    <Table
      :columns="columns"
      :data="tableDataList"
      :loading="loading"
      :defaultSort="{ prop: 'display_time', order: 'descending' }"
    />
  </ContentWrap>
</template>
