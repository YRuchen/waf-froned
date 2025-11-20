<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { useRouter } from 'vue-router'
import { Table, TableColumn } from '@/components/Table'
import {
  getTableListApi,
  updateFieldsApi,
  getCountApi,
  deleteFieldsApi
} from '@/api/websiteSettingPanel'
import {
  LoadBalancingList,
  ProtectStatusRuleForm,
  LogsConfigureForm
} from '@/api/websiteSettingPanel/types'
import { useTable } from '@/hooks/web/useTable'
import { ref, h, reactive, unref, computed } from 'vue'
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
  ElTooltip,
  ElMessageBox,
  ElEmpty
} from 'element-plus'
import { BaseButton } from '@/components/Button'
import { Search } from '@/components/Search'
import InputTags from './components/InputTags.vue'
const filterIcon = useIcon({ icon: 'vi-ep:filter' })
const refreshIcon = useIcon({ icon: 'vi-ep:refresh-right' })
/**列表数据请求获取 */
const { tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getTableListApi({
      page: unref(currentPage),
      pageSize: unref(pageSize),
      ...unref(searchParams),
      ...unref(searchParamsFilter)
    })
    handleGetCount()
    return {
      list: res.data.domains,
      total: res.data.pagination.total
    }
  }
})
const { loading, dataList } = tableState
const { getList } = tableMethods

const { t } = useI18n()
/**对扩展页面字段进行格式化 */
const accessConfiguration = (prop, item) => {
  switch (prop) {
    case 'protol':
      if (item.httpsEnabled == true && item.httpEnabled == true) return ['HTTP', 'HTTPS']
      else if (item.httpEnabled == true) return ['HTTP']
      else if (item.httpsEnabled == true) return ['HTTPS']
      else return []
    case 'publicServer':
      if (item.publicServer) return ['公网回源']
      break
    case 'loadBalancing':
      return [LoadBalancingList.find((i) => i.key === item.loadBalancing)?.label]
    default:
      return [item[prop]]
  }
}
/**列表扩展页面字段 */
const configureText = [
  {
    title: '接入配置',
    descriptionsItem: [
      {
        label: '接入方式',
        prop: 'hostname',
        isTag: false
      },
      {
        label: '接入协议',
        prop: 'protol',
        isTag: true,
        isFormat: true
      }
    ]
  },
  {
    title: '回源配置',
    descriptionsItem: [
      {
        label: '回源方式',
        prop: 'domainSource',
        isTag: false
      },
      {
        label: '源站地址',
        prop: 'hostname',
        isTag: true,
        isFormat: true
      },
      {
        label: '负载均衡',
        prop: 'loadBalancing'
      }
    ]
  }
]
/**列表字段 */
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
            {configureText.map((items) => (
              <ElDescriptions title={items.title} column={1}>
                {items.descriptionsItem.map((item) => (
                  <ElDescriptionsItem label={item.label}>
                    {accessConfiguration(item.prop, data.row)?.map((label) =>
                      item.isTag ? (
                        <ElTag type="info" class={'mr-1'}>
                          {label}
                        </ElTag>
                      ) : (
                        label
                      )
                    )}
                    {/* <ElTag type="info">{accessConfiguration(item.prop, data.row)}</ElTag> */}
                  </ElDescriptionsItem>
                ))}
              </ElDescriptions>
            ))}
          </div>
        )
      }
    }
  },
  {
    field: 'hostname',
    label: '防护网站',
    sortable: true,
    formatter: (_: Recordable, __: TableColumn, cellValue: string) => {
      return h('span', { class: 'text-blue-500 cursor-pointer' }, cellValue)
    }
  },
  {
    field: 'status',
    label: '接入状态',
    formatter: (_: Recordable, __: TableColumn, cellValue: string) => {
      const status = statusListArr.value.find((item) => item.key === cellValue)
      return h(
        ElTag,
        {
          type:
            cellValue === 'DOMAIN_STATUS_ACTIVE'
              ? 'success'
              : cellValue === 'DOMAIN_STATUS_UPSTREAM_FAILED'
                ? 'danger'
                : 'info'
        },
        () => status?.name || '未知状态'
      )
    }
  },
  {
    field: 'protectStatus',
    label: '防护模式',
    slots: {
      default: (data: any) => {
        // const row = data.row
        return (
          <div class="flex items-center">
            <Icon
              icon={data.row.protectStatus == true ? 'ep:circle-check-filled' : 'ep:remove-filled'}
              class={data.row.protectStatus == true ? 'text-[#1ee319]' : ''}
            />
            <div
              class="ml-2 group flex items-center cursor-pointer"
              onClick={(event) => handleEdit(event, data.row)}
            >
              <span>{data.row.protectStatus == true ? '启用防护' : '暂停防护'}</span>
              <Icon icon="ep:edit-pen" class="hidden group-hover:block ml-2" />
            </div>
          </div>
        )
      }
    }
  },
  {
    field: 'responseCheckStatus',
    label: '响应数据检测',
    slots: {
      default: (data: any) => {
        // const row = data.row
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <ElSwitch
              modelValue={data.row.responseCheckStatus}
              size="large"
              onChange={() => {
                const oldValue = data.row.responseCheckStatus
                ElMessageBox({
                  title: '更改相应数据检测',
                  message: (
                    <div>
                      {data.row.responseCheckStatus
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
                  .then(async () => {
                    const res = await updateFieldsApi({
                      patchField: 'DOMAIN_PATCH_FIELD_RESPONSE_CHECK_STATUS',
                      domainId: data.row.id,
                      responseCheckStatus: !data.row.responseCheckStatus
                    })
                    if (res.code == 200)
                      ElMessage.success(data.row.responseCheckStatus ? '关闭成功' : '开启成功')
                    getList()
                  })
                  .catch(() => {})
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
              v-slots={{
                dropdown: () => (
                  <ElDropdownMenu>
                    <ElDropdownItem
                      command="protect"
                      onClick={() => action(data.row, 'protect')}
                      style="display:none"
                    >
                      防护设置
                    </ElDropdownItem>
                    <ElDropdownItem command="enableLog" onClick={() => action(data.row, 'logs')}>
                      {data.row.logEnabled ? '关闭日志采集' : '开启日志采集'}
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
                          .then(async () => {
                            await deleteFieldsApi(data.row.id)
                            ElMessage({
                              type: 'success',
                              message: '删除成功'
                            })
                            getList()
                          })
                          .catch(() => {})
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
const showStatHeaders = ref(false)
const logsConfigureForm = ref<LogsConfigureForm>({
  logAllHeaders: false,
  logExcludeHeaders: [],
  statHeaders: []
})
const showInputTags = ref(false)
/**更改防护状态表单 */
const ruleForm = ref<ProtectStatusRuleForm>({
  protectStatus: false,
  domainId: ''
})
const dialogTitle = ref<string>('')
const tableRef = ref<InstanceType<typeof Table>>()
const totalSelection = ref<any>([])
const { currentRoute, push } = useRouter()
/**统计定义 */
const cardList = ref({
  totalCount: 0,
  unprotected: 0,
  statusCountMapTotal: {},
  statusCountMapUnprotected: {}
})
/**统计 */
const handleGetCount = async () => {
  const res = await getCountApi()
  cardList.value = res.data
}
/**统计数据拼接 */
const cardsType = computed(() => [
  {
    title: '域名总数',
    count: cardList.value.totalCount,
    statusMap: cardList.value.statusCountMapTotal
  },
  {
    title: '未防护域名',
    count: cardList.value.unprotected,
    statusMap: cardList.value.statusCountMapUnprotected
  }
])
/**统计的标签和颜色转义 */
const filterMap = (key: any) => {
  return statusListArr.value.find((status) => status.value == key)
}
// “正常”、“未接入”、“配置失败”、“回源失败”
const statusListArr = ref([
  { name: '正常', count: 1, key: 'DOMAIN_STATUS_ACTIVE', value: 1, color: '#67C23A' },
  { name: '未接入', count: 1, key: 'DOMAIN_STATUS_UNSPECIFIED', value: 0, color: '#E6A23C' },
  { name: '配置失败', count: 1, key: 'DOMAIN_STATUS_FAILED', value: 2, color: '#F56C6C' },
  { name: '回源失败', count: 1, key: 'DOMAIN_STATUS_UPSTREAM_FAILED', value: 3, color: '#909399' }
])
/**搜索字段 */
const searchSchema = reactive<FormSchema[]>([
  {
    field: 'name',
    component: 'Input',
    label: '防护网站'
  },
  {
    field: 'statusList',
    label: '接入状态',
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      options: [
        { label: '正常', value: '1' },
        { label: '未接入', value: '0' },
        { label: '配置失败', value: '2' },
        { label: '回源失败', value: '3' }
      ]
    }
  }
])
/**高级搜索字段 */
const filterSchema = reactive<FormSchema[]>([
  {
    field: 'targetIp',
    label: 'IP地址',
    component: 'Input'
  },
  {
    field: 'domainSources',
    label: '接入方式',
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      options: [{ label: 'CNAME接入', value: 'CNAME接入' }]
    }
  },
  {
    field: 'attackIn3days',
    label: '3天攻击监控',
    component: 'Select',
    formItemProps: {
      labelWidth: '100px'
    },
    componentProps: {
      placeholder: '请选择',
      multiple: true,
      options: [
        { label: '未发现攻击', value: 'false' },
        { label: '发现攻击', value: 'true' }
      ]
    }
  },
  {
    field: 'protectStatusList',
    label: '防护模式',
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      multiple: true,
      options: [
        { label: '启用防护', value: true },
        { label: '关闭防护', value: false }
      ]
    }
  },
  {
    field: 'logEnableStatusList',
    label: '日志采集',
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      multiple: true,
      options: [
        { label: '关闭', value: false },
        { label: '开启', value: true }
      ]
    }
  },
  {
    field: 'publicServerStatusList',
    label: '回源方式',
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
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
    label: '响应数据检测',
    component: 'Select',
    formItemProps: {
      labelWidth: '100px'
    },
    componentProps: {
      placeholder: '请选择',
      multiple: true,
      options: [
        { label: '关闭', value: false },
        { label: '开启', value: true }
      ]
    }
  }
])

/**编辑防护模式 */
const handleEdit = (event: any, row: any) => {
  event.stopPropagation()
  dialogVisible.value = true
  dialogTitle.value = row.protectStatus === true ? '启用防护' : '编辑防护'
  ruleForm.value.protectStatus = row.protectStatus
  ruleForm.value.domainId = row.id
}
/**提交编辑防护模式 */
const updateFields = async (patchField: string, data: any) => {
  const res = await updateFieldsApi({ ...data, patchField: patchField })
  if (res.code == 200) ElMessage.success(data.logEnabled ? '开启成功' : '关闭成功')
  getList()
}
/**列表操作 */
const action = (row, name) => {
  switch (name) {
    case 'edit':
      push({
        path: '/websiteSettings/editSitePanel',
        query: { id: row.id }
      })
      break
    case 'logs':
      updateFields('DOMAIN_PATCH_FIELD_LOG_ENABLED', {
        domainId: row.id,
        logEnabled: !row.logEnabled
      })
      break

    default:
      break
  }
}
/**列表多选监听 */
const handleSelectionChange = (val) => {
  totalSelection.value = val
}
/**日志管理 */
const handleLogsConfigure = () => {
  showLogsConfigure.value = true
  logsConfigureForm.value.logExcludeHeaders = []
  logsConfigureForm.value.statHeaders = []
  logsConfigureForm.value.logAllHeaders = false
  showInputTags.value = false
  showStatHeaders.value = false
}
/**日志配置提交 */
const handleSubmitEdit = async () => {
  const res = await updateFieldsApi({
    ...logsConfigureForm.value,
    patchField: 'DOMAIN_PATCH_FIELD_LOG_ALL_HEADERS',
    batchDomainIds: totalSelection.value.map((item) => item.id)
  })
  showLogsConfigure.value = false
  if (res.code == 200) ElMessage.success('编辑成功')
  getList()
}
const handleProtect = async () => {
  const res = await updateFieldsApi({
    ...ruleForm.value,
    patchField: 'DOMAIN_PATCH_FIELD_PROTECT_STATUS'
  })
  dialogVisible.value = false
  if (res.code == 200) ElMessage(ruleForm.value.protectStatus ? '启用防护成功' : '暂停防护成功')
  getList()
}
/**查询 */
// search组件
const searchExpose = ref<any>(null)
const searchExposeFilter = ref<any>(null)
// 查询的输入项
const searchParams = ref<{ statusList: string; name: string } | any>({})
const searchParamsFilter = ref<any>({})
// search组件的入口方法
const register = (expose: any) => {
  searchExpose.value = expose
}
const registerFilter = (expose: any) => {
  searchExposeFilter.value = expose
}
// 搜索
const handleSearch = (params: Record<string, any>) => {
  searchParams.value = params
  getList()
}
const handleFilterSearch = (params: Record<string, any>) => {
  searchParamsFilter.value = params
  getList()
}

/**重置按钮 */
const resetSearchParams = () => {
  searchParams.value = {}
  searchExpose.value?.reset?.()
  searchParamsFilter.value = {}
  searchExposeFilter.value?.reset?.()
  getList()
}
/**卡片的搜索 */
const handleCardSearch = (key, title) => {
  searchParams.value.statusList = key
  if (title === '未防护域名') {
    searchParamsFilter.value.protectStatusList = false
  }
  getList()
}
</script>
<style>
.button-red {
  background-color: #d50d0d !important;
  border-color: #d50d0d !important;
}
</style>
<template>
  <ContentWrap :title="currentRoute.meta.title">
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
          <p>{{ item.title }}</p>
          <p>{{ item.count }}</p>
        </div>

        <!-- 分割线 -->
        <div class="w-px bg-gray-300 mx-4 h-30px"></div>

        <!-- 右边状态列表 -->
        <div class="flex items-center space-x-4 flex-1">
          <div
            v-for="(value, key) in item.statusMap"
            :key="key"
            class="flex items-center space-x-2"
          >
            <span
              class="inline-block w-2.5 h-2.5 rounded-full"
              :style="{ backgroundColor: filterMap(key)?.color }"
            ></span>
            <span class="text-sm cursor-pointer" @click="handleCardSearch(key, item.title)">
              {{ filterMap(key)?.name }} <strong>{{ value }}</strong>
              <Icon icon="ep:arrow-right" />
            </span>
          </div>
        </div>
      </ElCard>
    </div>
    <div class="flex justify-between">
      <div class="flex">
        <Search
          :schema="searchSchema"
          :showSearch="false"
          :showReset="false"
          labelWidth="80px"
          labelPosition="left"
          :autoSearch="true"
          :autoSearchDebounce="1000"
          @search="handleSearch"
          @register="register"
        />
        <BaseButton :icon="filterIcon" plain @click="() => (isShowFilter = !isShowFilter)">
          {{ t('common.advancedFilter') }}
        </BaseButton>
        <BaseButton :loading="resetLoading" plain :icon="refreshIcon" @click="resetSearchParams">
          {{ t('common.reset') }}
        </BaseButton>
      </div>
      <div>
        <ElButton @click="getList()">
          <Icon icon="ep:refresh-right" />
        </ElButton>
      </div>
      <div>
        <ElButton type="primary" @click="push('/websiteSettings/addSitePanel')">新建站点</ElButton>
      </div>
    </div>
    <div v-if="isShowFilter">
      <Search
        :schema="filterSchema"
        :showSearch="false"
        :showReset="false"
        labelWidth="80px"
        labelPosition="left"
        :autoSearch="true"
        :autoSearchDebounce="1000"
        @search="handleFilterSearch"
        @register="registerFilter"
      />
    </div>
    <Table
      ref="tableRef"
      :columns="columns"
      :data="dataList"
      :loading="loading"
      height="450"
      @selection-change="handleSelectionChange"
      row-key="id"
    >
      <template #empty>
        <ElEmpty>
          <template #description>
            <span class="align-middle">暂无数据</span>
            <ElButton link type="primary" @click="push('/websiteSettings/addSitePanel')">
              新建站点
            </ElButton>
          </template>
        </ElEmpty>
      </template>
    </Table>
    <div class="mt-4">
      <span class="mr-4">已选择{{ totalSelection.length ?? 0 }}条</span>
      <!-- <ElButton size="large" :disabled="totalSelection.length === 0">添加到域名组</ElButton> -->
      <ElButton size="large" :disabled="totalSelection.length === 0" @click="handleLogsConfigure"
        >日志配置</ElButton
      >
    </div>
  </ContentWrap>
  <ElDialog v-model="dialogVisible" :title="dialogTitle" width="600">
    <ElForm ref="ruleFormRef" :model="ruleForm" label-width="auto" label-position="left">
      <ElFormItem label="域名名称" prop="name">
        <ElRadioGroup v-model="ruleForm.protectStatus">
          <ElRow>
            <ElCol :span="24">
              <ElRadio :value="true">启用防护</ElRadio>
              <span class="text-xs text-gray-500 ml-6">按WAF当前策略配置开启防护</span>
            </ElCol>
            <ElCol :span="24">
              <ElRadio :value="false">暂停防护</ElRadio>
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
        <ElButton size="large" @click="dialogVisible = false">取消</ElButton>
        <ElButton size="large" type="primary" @click="handleProtect">确定</ElButton>
      </div>
    </template>
  </ElDialog>
  <!-- 日志配置 -->
  <ElDialog v-model="showLogsConfigure" title="日志配置" width="40%">
    <div class="h-400px">
      <span class="bg-[#fef8eb] px-2 py-2 flex items-center mb-3">
        <Icon icon="ep:warning-filled" class="text-[#eaa92d] mr-2 text-xl" />
        当前已选择 {{ totalSelection.length }} 项域名，以下配置提交后，将替换当前日志配置
      </span>
      <ElForm ref="ruleFormRef" :model="logsConfigureForm" label-width="auto" label-position="left">
        <ElFormItem label="记录全量Header" prop="logAllHeaders">
          <ElSwitch v-model="logsConfigureForm.logAllHeaders" />
          <span class="ml-2" v-if="logsConfigureForm.logAllHeaders">
            将记录流量中全部Header字段，部分字段在Headers中，开启可能导致日志存储空间增加
          </span>
          <p class="ml-2" v-else>
            <span>仅将记录通用的常见Header字段，</span>
            <!-- <ElButton link type="primary">查看常见Header</ElButton> -->
          </p>
        </ElFormItem>
        <template v-if="logsConfigureForm.logAllHeaders">
          <ElFormItem label=" " prop="logExcludeHeaders">
            <ElButton link type="primary" @click="showInputTags = !showInputTags">
              配置例外Header({{ logsConfigureForm.logExcludeHeaders.length }})
              <Icon :icon="showInputTags ? 'ep:arrow-up' : 'ep:arrow-down'" class="m-r-2" />
            </ElButton>
            <ElTooltip
              effect="dark"
              content="防止日志存储量过大，可配置无需记录的Header头字段名"
              placement="top"
            >
              <Icon icon="ep:question-filled" class="ml-1" />
            </ElTooltip>
            <InputTags
              v-model:tagsList="logsConfigureForm.logExcludeHeaders"
              :limit="100"
              v-if="showInputTags"
            />
          </ElFormItem>
          <ElFormItem label=" " prop="statHeaders">
            <ElButton link type="primary" @click="showStatHeaders = !showStatHeaders">
              配置统计Header({{ logsConfigureForm.statHeaders.length }})
              <Icon :icon="showStatHeaders ? 'ep:arrow-up' : 'ep:arrow-down'" class="m-r-2" />
            </ElButton>
            <ElTooltip
              effect="dark"
              content="在记录的Header范围内，配置需要统计、分析、告警的Header头字段名"
              placement="top"
            >
              <Icon icon="ep:question-filled" class="ml-1" />
            </ElTooltip>
            <span class="text-gray-500 text-xs">
              此实例已配置 {{ logsConfigureForm.statHeaders.length }} 条，最多 100
              条，对所有域名生效
            </span>
            <InputTags
              v-model:tagsList="logsConfigureForm.statHeaders"
              :max="100"
              v-if="showStatHeaders"
            />
          </ElFormItem>
        </template>
      </ElForm>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <ElButton size="large" @click="showLogsConfigure = false">取消</ElButton>
        <ElButton size="large" type="primary" @click="handleSubmitEdit">确定</ElButton>
      </div>
    </template>
  </ElDialog>
</template>
