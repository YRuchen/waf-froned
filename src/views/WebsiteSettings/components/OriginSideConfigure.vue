<script lang="tsx" setup>
import { ref, watch, nextTick, PropType, onMounted, computed } from 'vue'

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
  type FormInstance,
  type FormRules,
  type FormItemRule
} from 'element-plus'

import Side from './Side.vue'
import { useI18n } from '@/hooks/web/useI18n'
import { useIcon } from '@/hooks/web/useIcon'

import { Table, TableColumn } from '@/components/Table'
import { BaseButton } from '@/components/Button'
import { serverGroupItem, TableItem } from '@/api/websiteSettingPanel/types'
const { t } = useI18n()
const copyIcon = useIcon({ icon: 'vi-ep:copy-document' })
const deleteIcon = useIcon({ icon: 'vi-ep:delete' })
const plusIcon = useIcon({ icon: 'vi-ep:plus' })
const columns: TableColumn[] = [
  {
    field: 'protol',
    label: '源站协议',
    slots: {
      default: ({ row, $index }) => {
        return (
          <ElFormItem
            prop={`${$index}.protol`}
            rules={[{ required: true, validator: validateName, trigger: 'change' }]}
          >
            <ElSelect v-model={row.protol}>
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
    minWidth: '200',
    slots: {
      default: ({ row, $index }) => {
        return (
          <ElFormItem
            prop={`${$index}.address`}
            rules={[{ required: true, validator: validateRegion, trigger: 'blur' }]}
          >
            <ElInput v-model={row.address} placeholder="请填写源站地址" />
          </ElFormItem>
        )
      }
    }
  },
  {
    field: 'port',
    label: '源站端口',
    slots: {
      default: ({ row, $index }) => {
        return (
          <ElFormItem
            prop={`${$index}.port`}
            rules={[{ required: true, validator: validateCount, trigger: 'blur' }]}
          >
            <ElInput v-model={row.port} placeholder="请填写源站端口" />
          </ElFormItem>
        )
      }
    }
  },
  {
    field: 'weight',
    label: '权重',
    slots: {
      default: ({ row, $index }) => {
        return (
          <ElFormItem
            prop={`${$index}.weight`}
            rules={[{ required: true, validator: validatDesc, trigger: 'blur' }]}
          >
            <ElInput v-model={row.weight} placeholder="请填写权重" />
          </ElFormItem>
        )
      }
    }
  },
  {
    field: 'action',
    label: t('tableDemo.action'),
    width: 240,
    slots: {
      default: ({ row, $index }) => {
        return (
          <ElFormItem>
            <BaseButton
              link
              icon={copyIcon}
              disabled={allcount.value == 0}
              onClick={() => action('edit', row, $index)}
            ></BaseButton>
            <BaseButton
              link
              icon={deleteIcon}
              disabled={tableDataList.value.length === 1}
              onClick={() => action('delete', row, $index)}
            ></BaseButton>
          </ElFormItem>
        )
      }
    }
  }
]

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
const validateName = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入源站协议'))
  } else {
    if (new Set(tableDataList.value.map((item) => item.protol)).size !== 1)
      tableDataList.value.map((item) => (item.protol = value))
    callback()
  }
}
const validateRegion = (rule: any, value: any, callback: any) => {
  const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/
  const ipRegex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

  if (!value) {
    return callback(new Error('源站地址不能为空'))
  }

  const isDomain = domainRegex.test(value)
  const isIp = ipRegex.test(value)

  if (!isDomain && !isIp) {
    return callback(new Error('源站地址格式不对，请输入正确的域名地址或IP地址'))
  }

  const nonEmptyRegions = tableDataList.value.filter((item) => item.address)

  const allDomains = nonEmptyRegions.every((item) => domainRegex.test(item.address))
  const allIps = nonEmptyRegions.every((item) => ipRegex.test(item.address))

  if ((isDomain && !allDomains) || (isIp && !allIps)) {
    return callback(new Error('源地址不支持混合回源'))
  }

  return callback()
}
const validateCount = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请填写源站端口'))
  } else {
    callback()
  }
}
const validatDesc = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请填写权重'))
  } else {
    callback()
  }
}

const submitForm = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!ruleFormRef.value) {
      resolve(false)
      return
    }
    ruleFormRef.value.validate((valid) => {
      resolve(valid)
    })
  })
}

const resetForm = () => {
  return false
}
// **********************************************

const checkList = ref<string[]>([])
const inputTagList = ref<string[]>([])
const selectedHttp = ref<string[]>([])
const tableDataList = ref<TableItem[]>([])
const originListItem = ref<Partial<serverGroupItem>>({})
const originList = ref<serverGroupItem[]>(props.originList)
const allUsedPorts = ref<string[]>([])

const action = (name: string, row?: TableItem, index?: number) => {
  if (name === 'edit' && row) {
    allcount.value--
    tableDataList.value.push({ ...row, port: '' })
  } else if (name === 'delete' && index !== undefined) {
    allcount.value++
    tableDataList.value.splice(index, 1)
  } else if (name === 'add') {
    allcount.value--
    tableDataList.value.push({
      address: '',
      port: '',
      weight: '',
      protol: ''
    })
  }
}
const activeProtocol = ref('HTTP')

const ports = computed(() => ({ HTTP: [...props.httpPorts], HTTPS: [...props.httpsPorts] }))

const filteredPorts = ref<string[]>([])
/**过滤数据 */
const filterPort = () => {
  const protocolPorts: string[] = ports.value[activeProtocol.value]
  // 使用中端口号
  const port = (originListItem.value?.accessPorts ?? []).filter((port) =>
    protocolPorts.includes(port)
  )

  inputTagList.value = port
  checkList.value = port
  const result = protocolPorts.filter((port) => !allUsedPorts.value.includes(port)).concat(port)
  filteredPorts.value = protocolPorts.filter((port) => result.includes(port))
}
const getTableList = (data: serverGroupItem) => {
  originListItem.value = data
  tableDataList.value = data.servers.map((item) => ({
    ...item,
    protol: data.protocol == 'PROTOCOL_UNSPECIFIED' ? '' : data.protocol
  }))
  allUsedPorts.value = originList.value.map((items) => items.accessPorts).flat()
  filterPort()
}
/***自定义接入端的端口选择 */
const handleSelect = (index: string) => {
  activeProtocol.value = index
  filterPort()
}
const selectPort = (isCheck, port) => {
  if (isCheck) {
    inputTagList.value.push(port)
    selectedHttp.value.push(port)
  } else {
    inputTagList.value.splice(inputTagList.value.indexOf(port), 1)
    selectedHttp.value = selectedHttp.value.filter((p) => p !== port)
  }
}
const handleChange = (val: string[]) => {
  // 拦截输入，只保留原来的标签（删除时还是会生效）
  if (val.length) {
    // 删除标签时允许
    inputTagList.value = JSON.parse(JSON.stringify(checkList.value))
    console.log(checkList.value)
  } else {
    // 输入新增时，回退
    checkList.value = checkList.value
  }
}
watch(
  () => tableDataList.value.map((item) => item.address),
  () => {
    nextTick(() => {
      // 对每一行触发验证
      tableDataList.value.forEach((item, index) => {
        if (item.address) ruleFormRef.value?.validateField(`${index}.address`)
      })
    })
  },
  { deep: true }
)
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
<style></style>
<template>
  <div class="flex">
    <Side @change="getTableList" :originList="originList" />
    <div class="flex-1 p-20px border-1 border-solid border-#ebeef5">
      <div class="m-b-2">
        <ElTag type="info" effect="dark" class="m-r-2">如果</ElTag>
        <span>接入端口输入</span>
      </div>
      <div class="p-2 bg-[#ededed] m-b-6" v-if="originListItem.groupName === '默认分组'">
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
                v-model="inputTagList"
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
                  <ElCheckboxGroup v-model="checkList">
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
      <ElForm ref="ruleFormRef" :model="tableDataList" label-position="left">
        <Table
          :columns="columns"
          :data="tableDataList"
          :defaultSort="{ prop: 'display_time', order: 'descending' }"
        />
      </ElForm>

      <BaseButton :icon="plusIcon" class="m-y-3" @click="action('add')" v-if="allcount > 0">
        添加
      </BaseButton>
      <span class="m-x-3 color-[#7e7777]" v-if="allcount > 0">还可添加{{ allcount }}个</span>
    </div>
  </div>
</template>
