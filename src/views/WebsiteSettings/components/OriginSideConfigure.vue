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
import { OriginItem, TableItem } from '../types'
const { t } = useI18n()
const copyIcon = useIcon({ icon: 'vi-ep:copy-document' })
const deleteIcon = useIcon({ icon: 'vi-ep:delete' })
const plusIcon = useIcon({ icon: 'vi-ep:plus' })
const columns: TableColumn[] = [
  {
    field: 'name',
    label: '源站协议',
    slots: {
      default: ({ row, $index }) => {
        return (
          <ElFormItem
            prop={`${$index}.name`}
            rules={[{ required: true, validator: validateName, trigger: 'change' }]}
          >
            <ElSelect v-model={row.name}>
              <ElOption label="HTTP" value="1" />
              <ElOption label="HTTPS" value="2" />
            </ElSelect>
          </ElFormItem>
        )
      }
    }
  },
  {
    field: 'region',
    label: '源站地址',
    minWidth: '200',
    slots: {
      default: ({ row, $index }) => {
        return (
          <ElFormItem
            prop={`${$index}.region`}
            rules={[{ required: true, validator: validateRegion, trigger: 'blur' }]}
          >
            <ElInput v-model={row.region} placeholder="请填写源站地址" />
          </ElFormItem>
        )
      }
    }
  },
  {
    field: 'count',
    label: '源站端口',
    slots: {
      default: ({ row, $index }) => {
        return (
          <ElFormItem
            prop={`${$index}.count`}
            rules={[{ required: true, validator: validateCount, trigger: 'blur' }]}
          >
            <ElInput v-model={row.count} placeholder="请填写源站端口" />
          </ElFormItem>
        )
      }
    }
  },
  {
    field: 'desc',
    label: '权重',
    slots: {
      default: ({ row, $index }) => {
        return (
          <ElFormItem
            prop={`${$index}.desc`}
            rules={[{ required: true, validator: validatDesc, trigger: 'blur' }]}
          >
            <ElInput v-model={row.desc} placeholder="请填写权重" />
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
    type: Array as PropType<OriginItem[]>,
    default: () => []
  },
  http: {
    type: Array<string>,
    default: () => []
  },
  https: {
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
    if (new Set(tableDataList.value.map((item) => item.name)).size !== 1)
      tableDataList.value.map((item) => (item.name = value))
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

  const nonEmptyRegions = tableDataList.value.filter((item) => item.region)

  const allDomains = nonEmptyRegions.every((item) => domainRegex.test(item.region))
  const allIps = nonEmptyRegions.every((item) => ipRegex.test(item.region))

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
  console.log(3333)
  return false
}
// **********************************************

const checkList = ref<string[]>([])
const inputTagList = ref<string[]>([])
const selectedHttp = ref<string[]>([])
const selectedHttps = ref<string[]>([])
const tableDataList = ref<TableItem[]>([])
const originListItem = ref<Partial<OriginItem>>({})
const originList = ref<OriginItem[]>(props.originList)

const action = (name: string, row?: TableItem, index?: number) => {
  if (name === 'edit' && row) {
    allcount.value--
    tableDataList.value.push({ ...row, count: '' })
  } else if (name === 'delete' && index !== undefined) {
    allcount.value++
    tableDataList.value.splice(index, 1)
  } else if (name === 'add') {
    allcount.value--
    tableDataList.value.push({
      name: '1',
      region: '',
      count: '',
      desc: ''
    })
  }
}
const getTableList = (data: OriginItem) => {
  // ruleFormRef.value?.resetFields()
  originListItem.value = data
  tableDataList.value = data.tableList
  if (activeProtocol.value === 'HTTP') {
    inputTagList.value = checkList.value = data.http
  } else {
    inputTagList.value = checkList.value = data.https
  }
}
const activeProtocol = ref('HTTP')
const ports = computed(() => {
  console.log({ HTTP: props.http, HTTPS: props.https }, 55566)
  return { HTTP: props.http, HTTPS: props.https }
})

const filteredPorts = ref<string[]>([])

const handleSelect = (index: string) => {
  activeProtocol.value = index
  if (activeProtocol.value === 'HTTP') {
    inputTagList.value = checkList.value = originListItem.value.http ?? []
  } else {
    inputTagList.value = checkList.value = originListItem.value.https ?? []
  }
}
const selectPort = (isCheck, port) => {
  if (isCheck) {
    inputTagList.value.push(port)
    if (activeProtocol.value === 'HTTP') {
      selectedHttp.value.push(port)
    } else {
      selectedHttps.value.push(port)
    }
  } else {
    inputTagList.value.splice(inputTagList.value.indexOf(port), 1)
    if (activeProtocol.value === 'HTTP') {
      selectedHttp.value = selectedHttp.value.filter((p) => p !== port)
    } else {
      selectedHttps.value = selectedHttps.value.filter((p) => p !== port)
    }
  }
  // keyword.value = port
  // showPanel.value = false
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
  () => tableDataList.value.map((item) => item.region),
  () => {
    nextTick(() => {
      // 对每一行触发验证
      tableDataList.value.forEach((item, index) => {
        if (item.region) ruleFormRef.value?.validateField(`${index}.region`)
      })
    })
  },
  { deep: true }
)
watch(
  [originListItem, activeProtocol],
  () => {
    const list = ports.value[activeProtocol.value] || []
    const keepHttp = list.filter((p) => !selectedHttp.value.includes(p)) //查出属于当前项中，还没有被使用的tag
    const keepHttps = list.filter((p) => !selectedHttps.value.includes(p)) //查出属于当前项中，还没有被使用的tag
    if (activeProtocol.value === 'HTTP') {
      filteredPorts.value = keepHttp.concat(inputTagList.value)
    } else {
      filteredPorts.value = keepHttps.concat(inputTagList.value)
    }
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
        <span>接入端口输入：</span>
      </div>
      <div class="p-2 bg-[#ededed] m-b-6" v-if="originListItem.id === '1'">
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
            <div class="flex h-40 w-100vw">
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
                  <ElEmpty description="该协议下无端口" />
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
