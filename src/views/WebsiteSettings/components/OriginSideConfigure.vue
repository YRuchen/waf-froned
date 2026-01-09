<script lang="tsx" setup>
import { ref, watch, nextTick, PropType, onMounted, computed, toRefs } from 'vue'

import {
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElTag,
  ElMenu,
  ElMenuItem,
  ElEmpty,
  ElCheckboxGroup,
  ElCheckbox,
  ElInputTag,
  ElPopover,
  ElTooltip,
  ElMessage,
  ElButton,
  type FormInstance,
  type CheckboxValueType
} from 'element-plus'

import { Plus } from '@element-plus/icons-vue'
import Side from './Side.vue'
import { useI18n } from '@/hooks/web/useI18n'
import { useIcon } from '@/hooks/web/useIcon'
import { Icon } from '@/components/Icon'

import { Table, TableColumn } from '@/components/Table'
import { BaseButton } from '@/components/Button'
import { serverGroupItem, TableItem } from '@/api/websiteSettingPanel/types'
import { useErrorShow } from './useErrorShow'

const { t } = useI18n()
const copyIcon = useIcon({ icon: 'vi-ep:copy-document' })
const deleteIcon = useIcon({ icon: 'vi-ep:delete' })

// 使用 useErrorShow 进行统一校验（需要在 columns 之前定义）
const { showErrorTip, hasRowError, hasFieldError, validateServers, tableErrors } = useErrorShow()
const errorMessage = ref('')

// columns 需要响应 tableErrors 的变化，所以使用 computed
const columns = computed<TableColumn[]>(() => {
  // 访问 tableErrors.value 以确保响应式依赖
  void tableErrors.value
  return [
    {
      field: 'protol',
      label: '源站协议',
      width: '130',
      slots: {
        default: ({ row, $index }) => {
          const hasError = hasFieldError($index, 'protol')
          return (
            <ElFormItem prop={`${$index}.protol`} class={hasError ? 'is-error' : ''}>
              <ElSelect
                v-model={row.protol}
                onChange={handleChangeProtol}
                class={hasError ? 'error-input' : ''}
              >
                <ElOption label="HTTP" value="1" />
                <ElOption label="HTTPS" value="2" />
              </ElSelect>
            </ElFormItem>
          )
        }
      }
    },
    {
      field: 'address',
      label: '源站地址',
      minWidth: '230',
      slots: {
        default: ({ row, $index }) => {
          const hasError = hasFieldError($index, 'address')
          return (
            <ElFormItem prop={`${$index}.address`} class={hasError ? 'is-error' : ''}>
              <ElInput
                v-model={row.address}
                placeholder="请填写源站地址"
                class={hasError ? 'error-input' : ''}
              />
            </ElFormItem>
          )
        }
      }
    },
    {
      field: 'port',
      label: '源站端口',
      minWidth: '120',
      slots: {
        default: ({ row, $index }) => {
          const hasError = hasFieldError($index, 'port')
          return (
            <ElFormItem prop={`${$index}.port`} class={hasError ? 'is-error' : ''}>
              <ElInput
                v-model={row.port}
                placeholder="请填写源站端口"
                class={hasError ? 'error-input' : ''}
                onInput={(value: string) => {
                  row.port = value === '' ? undefined : Number(value)
                }}
              />
            </ElFormItem>
          )
        }
      }
    },
    {
      field: 'weight',
      label: '权重',
      minWidth: '120',
      slots: {
        default: ({ row, $index }) => {
          const hasError = hasFieldError($index, 'weight')
          return (
            <ElFormItem prop={`${$index}.weight`} class={hasError ? 'is-error' : ''}>
              <div class="flex flex-items-center">
                <ElInput
                  v-model={row.weight}
                  placeholder="请填写权重"
                  class={hasError ? 'error-input' : ''}
                  onInput={(value: string) => {
                    let val = Number(value)
                    if (val < 0) val = 0
                    else if (val > 100) val = 100
                    row.weight = val
                  }}
                />
              </div>
            </ElFormItem>
          )
        },
        header: ({ column }) => (
          <div class="flex items-center gap-4px">
            <span>{column.label}</span>
            <ElTooltip
              effect="dark"
              content="表示后端服务器收到请求的概率，支持设置 1-100 的任意整数，源站权重之和可以大于 100"
              placement="top"
              popper-style="max-width: 300px; white-space: normal;"
            >
              <Icon
                icon="vi-ep:question-filled"
                class="ml-1 !text-[var(--el-text-color-regular)]"
              />
            </ElTooltip>
          </div>
        )
      }
    },
    {
      field: 'action',
      label: t('tableDemo.action'),
      slots: {
        default: ({ row, $index }) => {
          const deleteDisabled = originListItem.value.servers.length === 1
          const deleteButton = (
            <BaseButton
              link
              icon={deleteIcon}
              disabled={deleteDisabled}
              onClick={() => action('delete', row, $index)}
              class="!m-0"
            />
          )

          return (
            <ElFormItem>
              <div class="flex">
                <BaseButton
                  link
                  icon={copyIcon}
                  disabled={allcount.value == 0}
                  onClick={() => action('edit', row, $index)}
                ></BaseButton>
                {deleteDisabled ? (
                  <ElTooltip
                    effect="dark"
                    content="至少保留一条"
                    placement="top"
                    popper-style="max-width: 300px; white-space: normal;"
                  >
                    {deleteButton}
                  </ElTooltip>
                ) : (
                  deleteButton
                )}
              </div>
            </ElFormItem>
          )
        }
      }
    }
  ]
})

const props = defineProps({
  originList: {
    type: Array as PropType<serverGroupItem[]>,
    default: () => []
  },
  httpPorts: {
    type: Array<string>,
    default: () => []
  },
  httpsPorts: {
    type: Array<string>,
    default: () => []
  }
})

const ruleFormRef = ref<FormInstance>()
const allcount = ref<number>(19)
const poppoverWidth = ref<number>(0)
const referenceRef = ref<HTMLElement>()
const checkList = ref<string[]>([])
const selectedHttp = ref<string[]>([])
const originListItem = ref<serverGroupItem>({
  groupName: '',
  protocol: '',
  accessPorts: [],
  servers: []
})
const { httpPorts, httpsPorts, originList } = toRefs(props)
const allUsedPorts = ref<string[]>([])

const handleChangeProtol = (value: string) => {
  originListItem.value.servers.map(
    (item) => ((item.protol = value), (item.port = value == '1' ? '80' : '443'))
  )
  originListItem.value.protocol = value == '1' ? 'HTTP' : 'HTTPS'
}

// 行样式：错误行标红
const getRowClassName = (_row: any, rowIndex: number) => {
  return hasRowError(rowIndex) ? 'error-row' : ''
}

/** 提交校验函数，使用 useErrorShow 统一校验 */
const submitForm = (): boolean => {
  let valid = true

  // 遍历所有分组
  for (const group of originList.value) {
    const errors = validateServers(group.servers)

    if (errors.length > 0) {
      ElMessage({
        message: `分组 "${group.groupName}" 中存在无效的服务器配置，请检查后重新提交。`,
        type: 'warning'
      })
      valid = false
      break
    }
  }

  return valid
}

const resetForm = () => {
  return false
}

const action = (name: string, row?: TableItem, index?: number) => {
  if (name === 'edit' && row) {
    allcount.value--
    originListItem.value.servers.push({ ...row, port: '' })
  } else if (name === 'delete' && index !== undefined) {
    allcount.value++
    originListItem.value.servers.splice(index, 1)
  } else if (name === 'add') {
    allcount.value--
    originListItem.value.servers.push({
      address: '',
      port: '',
      weight: '0',
      protol: ''
    })
  }
}
const activeProtocol = ref('HTTP')
const ports = computed(() => {
  return {
    HTTP: [...httpPorts.value],
    HTTPS: [...httpsPorts.value]
  }
})
const filteredPorts = ref<string[]>([])
/**过滤数据 */
const filterPort = () => {
  const protocolPorts: string[] = ports.value[activeProtocol.value]
  // 使用中端口号
  const port = (originListItem.value?.accessPorts ?? []).filter((port) =>
    protocolPorts.includes(port)
  )

  originListItem.value.accessPorts = port
  checkList.value = port
  const result = protocolPorts.filter((port) => !allUsedPorts.value.includes(port)).concat(port)
  filteredPorts.value = protocolPorts.filter((port) => result.includes(port))
  if (originListItem.value.accessPorts.length === filteredPorts.value.length) {
    checkAll.value = true
    isIndeterminate.value = false
  } else if (originListItem.value.accessPorts.length > 0) {
    isIndeterminate.value = true
    checkAll.value = false
  } else {
    isIndeterminate.value = false
    checkAll.value = false
  }
}
const sideRef = ref<InstanceType<typeof Side>>()
// 操作分组的时候，右侧table也跟着改变
const getTableList = async (data: serverGroupItem) => {
  ruleFormRef.value?.clearValidate()
  errorMessage.value = ''
  originListItem.value = data
  originListItem.value.servers = data.servers.map((item) => ({
    ...item,
    protol: data.protocol == 'PROTOCOL_UNSPECIFIED' ? '' : data.protocol
  }))
  allUsedPorts.value = originList.value.map((items) => items.accessPorts).flat()
  filterPort()
  if (!sideRef.value) return
  sideRef.value.activeGroupId = data.groupName
}
/***自定义接入端的端口选择 */
const handleSelect = (index: string) => {
  activeProtocol.value = index
  filterPort()
}
const selectPort = (isCheck, port) => {
  if (isCheck) {
    originListItem.value?.accessPorts.push(port)
    selectedHttp.value.push(port)
  } else {
    originListItem.value.accessPorts.splice(originListItem.value.accessPorts.indexOf(port), 1)
    selectedHttp.value = selectedHttp.value.filter((p) => p !== port)
  }
}
const handleChange = () => {
  originListItem.value.accessPorts = JSON.parse(JSON.stringify(checkList.value))
}
/**全选 */
const checkAll = ref(false)
const isIndeterminate = ref(false)
const handleCheckAllChange = (val: CheckboxValueType) => {
  checkList.value = val ? filteredPorts.value : []
  originListItem.value.accessPorts = val ? filteredPorts.value : []
  isIndeterminate.value = false
}
const handleCheckedCitiesChange = (value: CheckboxValueType[]) => {
  const checkedCount = value.length
  checkAll.value = checkedCount === filteredPorts.value.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < filteredPorts.value.length
}

watch(
  () => sideRef.value?.activeGroupId,
  () => {
    nextTick(() => {
      // 重新校验当前分组
      errorMessage.value = showErrorTip(originListItem.value.servers)
    })
  },
  { deep: true }
)

// 监听服务器数据变化，实时校验
watch(
  () => originListItem.value.servers,
  () => {
    errorMessage.value = showErrorTip(originListItem.value.servers)
  },
  { deep: true }
)
watch([httpPorts, httpsPorts], () => {
  filterPort()
})
onMounted(() => {
  allcount.value = 19
  poppoverWidth.value = referenceRef.value?.offsetWidth ?? 0
})
defineExpose({
  submitForm,
  resetForm,
  getTableList
})
</script>
<style lang="less" scoped>
.content-wrap {
  border-top-right-radius: var(--primary-raduis);
  border-bottom-right-radius: var(--primary-raduis);
  padding-left: 20px;
  padding-right: 20px;
  border: 1px solid #ebeef5;
}
.grounp-content {
  border-radius: var(--primary-raduis);
  padding: 0.5rem;
  background-color: #ededed;
  margin-bottom: 1rem;
}
</style>
<template>
  <div class="grid grid-cols-[15%_83%] h-530px">
    <Side @change="getTableList" v-model:originList="originList" ref="sideRef" />
    <div class="content-wrap">
      <div class="my-2">
        <ElTag type="info" effect="dark" class="m-r-2">如果</ElTag>
        <span>接入端口输入</span>
      </div>
      <div class="grounp-content" v-if="originListItem.groupName === '默认分组'">
        <p>全部端口</p>
        <p class="color-[#7e7777]">
          无需设置生效的接入端口范围，默认应用到所有未自定义配置回源规则的接入端口上
        </p>
      </div>
      <div v-else>
        <!-- 下方左右布局选择面板 -->
        <ElPopover placement="bottom" :width="poppoverWidth">
          <template #reference>
            <!-- 输入框 -->
            <div ref="referenceRef">
              <ElInputTag
                v-model="originListItem.accessPorts"
                :max="10"
                prefix-icon="Search"
                @change="handleChange"
              >
                <template #prefix>
                  <span>{{ activeProtocol }}</span>
                </template>
              </ElInputTag>
            </div>
          </template>
          <template #default>
            <div class="flex h-40 w-full">
              <!-- 左侧协议分类 -->
              <div class="w-40 border-r h-full">
                <ElMenu
                  :default-active="activeProtocol"
                  mode="vertical"
                  class="h-full"
                  @select="handleSelect"
                >
                  <ElMenuItem index="HTTP">HTTP</ElMenuItem>
                  <ElMenuItem index="HTTPS">HTTPS</ElMenuItem>
                </ElMenu>
              </div>

              <!-- 右侧端口列表 -->
              <div class="flex-1 ml-3">
                <template v-if="filteredPorts.length > 0">
                  <ElCheckbox
                    v-model="checkAll"
                    :indeterminate="isIndeterminate"
                    @change="handleCheckAllChange"
                  >
                    全部
                  </ElCheckbox>
                  <ElCheckboxGroup v-model="checkList" @change="handleCheckedCitiesChange">
                    <ElCheckbox
                      v-for="port in filteredPorts"
                      :key="port"
                      :value="port"
                      @change="
                        (isCheck) => {
                          selectPort(isCheck, port)
                        }
                      "
                    >
                      {{ port }}
                    </ElCheckbox>
                  </ElCheckboxGroup>
                </template>
                <template v-else>
                  <ElEmpty description="该协议下无端口" class="w-full" :image-size="40" />
                </template>
              </div>
            </div>
          </template>
        </ElPopover>
      </div>
      <div class="m-b-2">
        <ElTag type="info" effect="dark" class="m-r-2">那么</ElTag>
        <span>回源到源站地址：</span>
      </div>
      <ElForm ref="ruleFormRef" :model="originListItem.servers" label-position="left">
        <Table
          :columns="columns"
          :data="originListItem.servers"
          :row-class-name="getRowClassName"
          max-height="330"
          class="table-wrap"
        />
        <span v-if="errorMessage" class="text-[var(--el-color-danger)]">
          {{ errorMessage }}
        </span>
      </ElForm>
      <div class="mt-3">
        <ElButton type="primary" plain size="small" @click="action('add')" v-if="allcount > 0">
          <ElIcon :size="24"><Plus /></ElIcon>
          添加
        </ElButton>
        <span class="m-x-3 color-[#7e7777]" v-if="allcount > 0">还可添加{{ allcount }}个</span>
      </div>
    </div>
  </div>
</template>
<style lang="less">
.table-wrap {
  .el-form-item {
    margin: 0 !important;
  }

  // 错误行标红
  :deep(.error-row) {
    background-color: var(--el-color-danger-light-9) !important;

    &:hover {
      background-color: var(--el-color-danger-light-8) !important;
    }
  }

  // 错误输入框标红
  :deep(.error-input) {
    .el-input__wrapper {
      box-shadow: 0 0 0 1px var(--el-color-danger) inset !important;
    }

    &.is-focus .el-input__wrapper {
      box-shadow: 0 0 0 1px var(--el-color-danger) inset !important;
    }
  }

  :deep(.el-select.error-input) {
    .el-input__wrapper {
      box-shadow: 0 0 0 1px var(--el-color-danger) inset !important;
    }

    &.is-focus .el-input__wrapper {
      box-shadow: 0 0 0 1px var(--el-color-danger) inset !important;
    }
  }

  // ElFormItem 错误状态
  :deep(.el-form-item.is-error) {
    .el-input__wrapper {
      box-shadow: 0 0 0 1px var(--el-color-danger) inset !important;
    }
  }
}
</style>
