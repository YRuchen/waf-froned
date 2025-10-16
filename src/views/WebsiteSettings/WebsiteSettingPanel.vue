<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { useRouter } from 'vue-router'
import { Table, TableColumn } from '@/components/Table'
import { getTableListApi } from '@/api/websiteSettingPanel'
import { useTable } from '@/hooks/web/useTable'
import { TableData } from '@/api/table/types'
import { ref, h, reactive, unref } from 'vue'
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
  ElDialog,
  ElDescriptions,
  ElDescriptionsItem,
  ElRadioGroup,
  ElRadio,
  ElFormItem,
  ElForm,
  ElRow,
  ElCol,
  ElMessage,
  ElSwitch,
  ElInputTag,
  ElMessageBox
} from 'element-plus'
import { BaseButton } from '@/components/Button'
import { Search } from '@/components/Search'
import InputTags from './components/InputTags.vue'
const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getTableListApi({
      page: unref(currentPage),
      pageSize: unref(pageSize)
    })
    return {
      list: res.data.domains,
      total: res.data.pagination.total
    }
  }
})
const { loading, dataList, total, currentPage, pageSize } = tableState
// const { getList, getElTableExpose, delList } = tableMethods
const filterIcon = useIcon({ icon: 'vi-ep:filter' })
const refreshIcon = useIcon({ icon: 'vi-ep:refresh-right' })
interface Params {
  pageIndex?: number
  pageSize?: number
}
interface RuleForm {
  openProtect: string
}
interface LogsConfigureForm {
  recordHeader: boolean
  othersHeader: Array<string>
  statistics: Array<string>
}

const { t } = useI18n()
const accessConfiguration = reactive<any>({
  username: '接入方式',
  telephone: '接入协议'
})
const configureText = [
  {
    title: '接入配置',
    descriptionsItem: [
      {
        label: '接入方式',
        prop: 'username',
        isTag: false
      },
      {
        label: '接入协议',
        prop: 'telephone',
        isTag: true
      }
    ]
  }
]
const columns = reactive<TableColumn[]>([
  {
    field: 'selection',
    type: 'selection'
  },
  {
    field: 'expand',
    type: 'expand',
    slots: {
      default: (data: any) => {
        // const row = data.row
        return (
          <div class="grid grid-cols-3 mx-16 mt-4 mb-8">
            <div>
              {configureText.map((items) => (
                <ElDescriptions title={items.title} column={1}>
                  {items.descriptionsItem.map((item) => (
                    <ElDescriptionsItem label={item.label}>
                      {item.isTag ? (
                        <ElTag type="info">{accessConfiguration[item.prop]}</ElTag>
                      ) : (
                        accessConfiguration[item.prop]
                      )}
                    </ElDescriptionsItem>
                  ))}
                </ElDescriptions>
              ))}
            </div>
          </div>
        )
      }
    }
  },
  {
    field: 'name',
    label: '防护网站',
    sortable: true,
    formatter: (_: Recordable, __: TableColumn, cellValue: string) => {
      return h('span', { class: 'text-blue-500 cursor-pointer' }, cellValue)
    }
  },
  {
    field: 'statusList',
    label: '接入状态',
    formatter: (_: Recordable, __: TableColumn, cellValue: number) => {
      const status = statusListArr.value.find((item) => item.count === cellValue)
      return h(
        ElTag,
        {
          type: cellValue === 1 ? 'success' : cellValue === 2 ? 'danger' : 'info'
        },
        () => status?.name || '未知状态'
      )
    }
  },
  {
    field: 'protectStatusList',
    label: '防护模式',
    slots: {
      default: (data: any) => {
        // const row = data.row
        return (
          <div class="flex items-center">
            <Icon
              icon={
                data.row.protectStatusList == true ? 'ep:circle-check-filled' : 'ep:remove-filled'
              }
              class={data.row.protectStatusList == true ? 'text-[#1ee319]' : ''}
            />
            <div
              class="ml-2 group flex items-center cursor-pointer"
              onClick={(event) => handleEdit(event, data.row.protectStatusList)}
            >
              <span>{data.row.protectStatusList == true ? '启用防护' : '暂停防护'}</span>
              <Icon
                icon="ep:edit-pen"
                class={dialogVisible.value ? 'ml-2' : 'hidden group-hover:block ml-2'}
              />
            </div>
          </div>
        )
      }
    }
  },
  {
    field: 'responseCheckStatusList',
    label: '响应式检测',
    slots: {
      default: (data: any) => {
        // const row = data.row
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <ElSwitch
              modelValue={data.row.responseCheckStatusList}
              size="large"
              onChange={() => {
                const oldValue = data.row.responseCheckStatusList
                ElMessageBox({
                  title: '更改相应数据检测',
                  message: (
                    <div>
                      {data.row.responseCheckStatusList
                        ? '关闭后将导致部分功能和规则失效'
                        : '打开后可能因缓存导致客户端收到信息延迟'}
                      {/* <span
                        style={{ color: '#409EFF', cursor: 'pointer' }}
                        onClick={() => {
                          // 点击“查看详情”后的操作
                          ElMessage.info('这里可以先留位置')
                        }}
                      >
                        查看详情
                      </span> */}
                    </div>
                  ),
                  confirmButtonText: oldValue ? '确定关闭' : '确定开启',
                  cancelButtonText: '取消',
                  type: 'warning',
                  showCancelButton: true,
                  confirmButtonClass: oldValue ? 'button-red' : ''
                })
                  .then(() => {
                    data.row.responseCheckStatusList = !oldValue
                  })
                  .catch(() => {
                    ElMessage({
                      type: 'info',
                      message: '已取消'
                    })
                  })
              }}
            />
          </div>
        )
      }
    }
  },
  {
    field: 'updatedAt',
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
            <ElButton type="primary" link onClick={() => action(data.row, 'edit')}>
              {t('exampleDemo.edit')}
            </ElButton>
            <ElDropdown
              trigger="click"
              onCommand={(cmd) => handleCommand(cmd)}
              v-slots={{
                dropdown: () => (
                  <ElDropdownMenu>
                    <ElDropdownItem command="protect" onClick={() => action(data.row, 'edit')}>
                      防护设置
                    </ElDropdownItem>
                    <ElDropdownItem
                      command="enableLog"
                      onClick={() =>
                        action(data.row, data.row.logsCollection ? 'closeLog' : 'openLog')
                      }
                    >
                      {data.row.logsCollection ? '关闭日志采集' : '开启日志采集'}
                    </ElDropdownItem>
                    <ElDropdownItem
                      command="delete"
                      onClick={() => {
                        ElMessageBox.confirm(
                          '删除后网站将不再受到保护，并且安全策略将丢失，是否确认删除？',
                          '网站删除',
                          {
                            confirmButtonText: '删除',
                            cancelButtonText: '取消',
                            confirmButtonClass: 'button-red',
                            type: 'warning'
                          }
                        )
                          .then(() => {
                            ElMessage({
                              type: 'success',
                              message: 'Delete completed'
                            })
                          })
                          .catch(() => {
                            ElMessage({
                              type: 'info',
                              message: 'Delete canceled'
                            })
                          })
                      }}
                    >
                      删除
                    </ElDropdownItem>
                  </ElDropdownMenu>
                )
              }}
            >
              <ElButton type="primary" link>
                更多
                <Icon icon="ep:arrow-down" />
              </ElButton>
            </ElDropdown>
          </div>
        )
      }
    }
  }
])

const resetLoading = ref(false)
const isShowFilter = ref(false)
const dialogVisible = ref(false)
const showLogsConfigure = ref(false)
const showStatistics = ref(false)
const logsConfigureForm = ref<LogsConfigureForm>({
  recordHeader: false,
  othersHeader: [],
  statistics: []
})
const showInputTags = ref(false)
const ruleForm = ref<RuleForm>({
  openProtect: '1'
})
const dialogTitle = ref<string>('')
const tableRef = ref<InstanceType<typeof Table>>()
const totalSelection = ref<number>(0)
const tagsList = ref<string[]>([])
const { push } = useRouter()
// el-card
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
// “正常”、“未接入”、“配置失败”、“回源失败”
const statusListArr = ref([
  { name: '正常', count: 1, color: '#67C23A' },
  { name: '未接入', count: 2, color: '#E6A23C' },
  { name: '配置失败', count: 3, color: '#F56C6C' },
  { name: '回源失败', count: 1, color: '#909399' }
])
const searchSchema = reactive<FormSchema[]>([
  {
    field: 'name',
    component: 'Input',
    componentProps: {
      slots: {
        prepend: () => <>防护网站</>
      }
    }
  },
  {
    field: 'statusList',
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
    field: 'targetIp',
    // label: 'IP地址',
    component: 'Input',
    componentProps: {
      slots: {
        prepend: () => <>IP地址</>
      }
    }
  },
  {
    field: 'domainSources',
    // label: '接入方式',
    component: 'SelectLabel',
    componentProps: {
      placeholder: '请选择',
      label: '接入方式',
      options: [{ label: 'CNAME接入', value: 'CNAME接入' }]
    }
  },
  {
    field: 'attackIn3days',
    // label: '3天攻击监控',
    component: 'SelectLabel',
    componentProps: {
      placeholder: '请选择',
      label: '3天攻击监控',
      multiple: true,
      options: [
        { label: '未发现攻击', value: 'false' },
        { label: '发现攻击', value: 'true' }
      ]
    }
  },
  {
    field: 'pretendModule',
    // label: '防护模式',
    component: 'SelectLabel',
    componentProps: {
      placeholder: '请选择',
      label: '防护模式',
      multiple: true,
      options: [{ label: '启用防护', value: '1' }]
    }
  },
  {
    field: 'logEnableStatusList',
    // label: '日志采集',
    component: 'SelectLabel',
    componentProps: {
      placeholder: '请选择',
      label: '日志采集',
      multiple: true,
      options: [
        { label: '关闭', value: false },
        { label: '开启', value: true }
      ]
    }
  },
  {
    field: 'publicServerStatusList',
    // label: '回源方式',
    component: 'SelectLabel',
    componentProps: {
      placeholder: '请选择',
      label: '回源方式',
      multiple: true,
      options: [
        { label: '公网回源', value: true },
        { label: '内网回源', value: false }
      ]
    }
  },
  // {
  //   field: 'VPCID',
  //   label: 'VPC ID',
  //   component: 'Input'
  // },
  {
    field: 'responseCheckStatusList',
    // label: '响应数据检测',
    component: 'SelectLabel',
    componentProps: {
      placeholder: '请选择',
      label: '响应数据检测',
      multiple: true,
      options: [
        { label: '关闭', value: false },
        { label: '开启', value: true }
      ]
    }
  }
])

const handleCommand = (cmd) => {}
const getTableList = async (params?: Params) => {
  loading.value = false
}

getTableList()
const resetSearchParams = (data: any) => {
  // searchParams.value = data
  // getList()
}
/**高级筛选事件 */
const onExpand = () => {
  isShowFilter.value = !isShowFilter.value
}
/**tbale的点击下拉事件 */
const toggleRowExpansion = (row: Recordable) => {
  if (!tableRef.value) return
  ;(tableRef.value as any).elTableRef?.toggleRowExpansion(row)
}
/**编辑防护模式 */
const handleEdit = (event: any, protectStatusList: boolean) => {
  event.stopPropagation()
  dialogVisible.value = true
  dialogTitle.value = protectStatusList === true ? '启用防护' : '编辑防护'
}
/**提交编辑防护模式 */
const handleSubmitEdit = () => {
  ElMessage.success('编辑成功')
}
/**列表操作 */
const action = (row, name) => {
  switch (name) {
    case 'edit':
      push({
        path: '/websiteSettings/addSitePanel',
        query: { type: name }
      })
      break
    case 'openLog':
      break
    case 'edit':
      push({
        path: '/websiteSettings/addSitePanel',
        query: { type: name }
      })
      break

    default:
      break
  }
}
/**列表多选监听 */
const handleSelectionChange = (val) => {
  totalSelection.value = val?.length
}
/**日志管理 */
const handleLogsConfigure = () => {
  showLogsConfigure.value = true
  tagsList.value = []
  logsConfigureForm.value.statistics = []
  logsConfigureForm.value.recordHeader = false
  showInputTags.value = false
  showStatistics.value = false
}
</script>
<style>
.button-red {
  background-color: #d50d0d !important;
  border-color: #d50d0d !important;
}
</style>
<template>
  <ContentWrap :title="t('tableDemo.table')" :message="t('tableDemo.tableDes')">
    <div class="flex w-full mb-4">
      <ElCard
        :class="[
          'flex-1 h-24 flex items-center p-4',
          index !== cardsType.length - 1 ? 'mr-24' : ''
        ]"
        body-class="flex items-center"
        v-for="(item, index) in cardsType"
        :key="index"
      >
        <!-- 左边块 -->
        <div class="flex-shrink-0">
          <p>{{ item.name }}</p>
          <p>{{ item.total }}</p>
        </div>

        <!-- 分割线 -->
        <div class="w-px bg-gray-300 mx-4 h-30px"></div>

        <!-- 右边状态列表 -->
        <div class="flex items-center space-x-4 flex-1">
          <div
            v-for="status in statusListArr"
            :key="status.name"
            class="flex items-center space-x-2"
          >
            <span
              class="inline-block w-2.5 h-2.5 rounded-full"
              :style="{ backgroundColor: status.color }"
            ></span>
            <span class="text-sm">
              {{ status.name }} <b>{{ status.count }}</b>
            </span>
          </div>
          <Icon icon="ep:arrow-right" />
        </div>
      </ElCard>
    </div>
    <div class="flex justify-between">
      <div class="flex">
        <Search :schema="searchSchema" :showSearch="false" :showReset="false" labelWidth="160px" />
        <BaseButton :icon="filterIcon" plain @click="onExpand">
          {{ t('common.advancedFilter') }}
        </BaseButton>
        <BaseButton :loading="resetLoading" plain :icon="refreshIcon" @click="resetSearchParams">
          {{ t('common.reset') }}
        </BaseButton>
      </div>
      <div>
        <ElButton>批量导入</ElButton>
        <ElButton type="primary" @click="push('/websiteSettings/addSitePanel')">新建站点</ElButton>
      </div>
    </div>
    <div v-if="isShowFilter">
      <Search :schema="filterSchema" :showSearch="false" :showReset="false" labelWidth="160px" />
    </div>
    <Table
      ref="tableRef"
      :columns="columns"
      :data="dataList"
      :loading="loading"
      @row-click="toggleRowExpansion"
      @selection-change="handleSelectionChange"
      row-key="title"
      :defaultSort="{ prop: 'protectStatusList', order: 'descending' }"
    />
    <div class="mt-4">
      <span class="mr-4">已选择{{ totalSelection }}条</span>
      <ElButton size="large" :disabled="totalSelection === 0">添加到域名组</ElButton>
      <ElButton size="large" :disabled="totalSelection === 0" @click="handleLogsConfigure"
        >日志配置</ElButton
      >
    </div>
  </ContentWrap>
  <ElDialog v-model="dialogVisible" :title="dialogTitle" width="600">
    <ElForm ref="ruleFormRef" :model="ruleForm" label-width="auto" label-position="left">
      <ElFormItem label="域名名称" prop="name">
        <ElRadioGroup v-model="ruleForm.openProtect">
          <ElRow>
            <ElCol :span="24">
              <ElRadio value="1">启用防护</ElRadio>
              <span class="text-xs text-gray-500 ml-6">按WAF当前策略配置开启防护</span>
            </ElCol>
            <ElCol :span="24">
              <ElRadio value="2">暂停防护</ElRadio>
              <span class="text-xs text-gray-500 ml-6">
                仅执行转发不进行检测，该模式下已配置的防护策略不生效
              </span>
            </ElCol>
          </ElRow>
        </ElRadioGroup>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton size="large">取消</ElButton>
        <ElButton size="large" type="primary" @click="handleSubmitEdit">确定</ElButton>
      </div>
    </template>
  </ElDialog>
  <!-- 日志配置 -->
  <ElDialog v-model="showLogsConfigure" title="日志配置" width="40%">
    <span class="bg-[#fef8eb] px-2 py-2 flex items-center mb-3">
      <Icon icon="ep:warning-filled" class="text-[#eaa92d] mr-2 text-xl" />
      当前已选择 {{ totalSelection }} 项域名，以下配置提交后，将替换当前日志配置
    </span>
    <ElForm ref="ruleFormRef" :model="logsConfigureForm" label-width="auto" label-position="left">
      <ElFormItem label="记录全量Header" prop="recordHeader">
        <ElSwitch v-model="logsConfigureForm.recordHeader" />
        <span>仅将记录通用的常见Header字段，</span>
        <ElButton link type="primary">查看常见Header</ElButton>
      </ElFormItem>
      <template v-if="logsConfigureForm.recordHeader">
        <ElFormItem label=" " prop="othersHeader">
          <ElButton link type="primary" @click="showInputTags = !showInputTags">
            配置例外Header({{ tagsList.length }})
            <Icon :icon="showInputTags ? 'ep:arrow-up' : 'ep:arrow-down'" class="m-r-2" />
          </ElButton>
          <InputTags
            :tagsList="tagsList"
            :limit="100"
            @update:tagsList="(val) => (tagsList = val)"
            v-if="showInputTags"
          />
        </ElFormItem>
        <ElFormItem label=" " prop="statistics">
          <ElButton link type="primary" @click="showStatistics = !showStatistics">
            配置统计Header({{ logsConfigureForm.statistics.length }})
            <Icon :icon="showStatistics ? 'ep:arrow-up' : 'ep:arrow-down'" class="m-r-2" />
          </ElButton>
          <ElInputTag
            class="!min-h-[100px] !items-start"
            v-model="logsConfigureForm.statistics"
            :max="100"
            placeholder="请输入，回车分隔"
            v-if="showStatistics"
          />
        </ElFormItem>
      </template>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton size="large" @click="showLogsConfigure = false">取消</ElButton>
        <ElButton size="large" type="primary" @click="handleSubmitEdit">确定</ElButton>
      </div>
    </template>
  </ElDialog>
</template>
