<script lang="tsx" setup>
import { reactive, ref, h, nextTick, watch, onMounted } from 'vue'

import { Table, TableColumn } from '@/components/Table'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElSwitch,
  ElCheckbox,
  ElRadio,
  ElRadioGroup,
  ElButton,
  ElInputNumber,
  ElTooltip,
  ElInputTag,
  ElRow,
  ElCol,
  ElSelect,
  ElOption,
  ElDescriptions,
  ElDescriptionsItem,
  ElTag,
  ElDialog,
  ElEmpty,
  ElTable,
  ElTableColumn,
  ElCheckboxGroup,
  type FormInstance,
  type FormRules,
  type FormItemRule
} from 'element-plus'

import originConfigure from './originConfigure.vue'
import { OriginItem } from '../types'
import { log } from 'console'
const columns: TableColumn[] = [
  {
    field: 'selection',
    type: 'selection'
  },
  {
    field: 'name',
    label: '加密套件'
  },
  {
    field: 'nameList',
    label: 'TLS协议版本',
    formatter: (_: Recordable, __: TableColumn, cellValue: Array<string>) => {
      return cellValue.map((item) =>
        h(ElTag, { type: 'info', style: 'margin-right: 4px' }, () => item)
      )
    }
  }
]

interface RuleForm {
  name: string
  region: string
  count: string
  date1: string
  date2: string
  delivery: boolean
  location: string
  http: string[]
  https: string[]
  resource: string
  desc: string
  book: string
  SNLConfigure: boolean
  numberInput: number
  bodyNum: number
  createOverTime: number
  writeOverTime: number
  readOverTime: number
  retryCount: number
  customClient: string
  customizeHeader: string
  originList: OriginItem[]
}
interface RuleFormTLS {
  checkList: Array<string>
  tableList: Array<any>
}
const sections = [
  { id: 'part1', title: '防护域名' },
  { id: 'part2', title: '基础配置' },
  { id: 'part3', title: '源站配置' },
  { id: 'part4', title: '代理配置' },
  { id: 'part5', title: '日志配置' },
  { id: 'part6', title: '网络参数配置', height: '100%' }
]

const createConfig = (
  title: string,
  prop: string,
  unit: string,
  min: number,
  max: number,
  defaultValue: number
) => ({
  title,
  prop,
  unit,
  min,
  max,
  default: defaultValue,
  describe: `${title}，支持 ${min}–${max} ${unit}，默认：${defaultValue} ${unit}`
})

const InternetParamsConfiguration = [
  createConfig('请求body最大值', 'bodyNum', 'MB', 1, 10240, 60),
  createConfig('建连超时时间', 'createOverTime', '秒', 4, 120, 30),
  createConfig('写连接超时时间', 'writeOverTime', '秒', 30, 3600, 60),
  createConfig('读连接超时时间', 'readOverTime', '秒', 30, 3600, 60),
  createConfig('回源重试次数', 'retryCount', '次', 1, 10, 3)
]
const getRules = (items: any): FormItemRule[] => {
  return [
    {
      required: true,
      message: `请输入${items.title}`,
      trigger: ['blur', 'change']
    },
    {
      type: 'number',
      min: items.min,
      max: items.max,
      message: `${items.title}范围为 ${items.min}–${items.max} ${items.unit}`,
      trigger: ['blur', 'change']
    }
  ]
}

const parentFormRef = ref<FormInstance>()
const isSelectHttps = ref<boolean>()
const isSelectHttp = ref<boolean>()
const showTLSDialog = ref<boolean>(false)
const total = ref<number>(0)
const ruleFormTLS = ref<RuleFormTLS>({
  checkList: [],
  tableList: [{ name: '111', nameList: ['2222', '333'] }]
})
const filteredTLS = ref<Array<string>>(['TLSv1', 'TLSv1.1', 'TLSv1.2', 'TLSv1.3'])
const openTLSConfigure = ref<boolean>(true)
const loading = ref<boolean>(false)
const showErrorTips = ref<boolean>(false)
const selected = ref<Array<any>>([])
const ruleFormTLSRef = ref<FormInstance>()
const tableRef = ref<InstanceType<typeof ElTable>>()
const childRef = ref<InstanceType<typeof originConfigure>>()
const ruleForm = reactive<RuleForm>({
  name: 'Hello',
  region: '',
  count: '',
  date1: '',
  date2: '',
  delivery: false,
  location: '',
  http: ['80'],
  https: [],
  resource: '',
  customClient: '',
  customizeHeader: '',
  desc: '',
  book: '', // 证书选择
  SNLConfigure: false,
  numberInput: 0,
  bodyNum: 60,
  createOverTime: 30,
  writeOverTime: 60,
  readOverTime: 60,
  retryCount: 3,
  originList: [
    {
      id: '1',
      label: '默认分组',
      tableList: [
        {
          name: '1',
          region: '',
          count: '',
          desc: ''
        }
      ],
      http: [],
      https: []
    }
  ]
})
const options = [{ value: 1, label: 1 }]
const rules = reactive<FormRules<RuleForm>>({
  name: [
    { required: true, message: 'Please input Activity name', trigger: 'blur' },
    { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' }
  ],
  region: [
    {
      required: true,
      message: 'Please select Activity zone',
      trigger: 'change'
    }
  ],
  count: [
    {
      required: true,
      message: 'Please select Activity count',
      trigger: 'change'
    }
  ],
  date1: [
    {
      type: 'date',
      required: true,
      message: 'Please pick a date',
      trigger: 'change'
    }
  ],
  date2: [
    {
      type: 'date',
      required: true,
      message: 'Please pick a time',
      trigger: 'change'
    }
  ],
  location: [
    {
      required: true,
      message: 'Please select a location',
      trigger: 'change'
    }
  ],
  http: [
    {
      type: 'array',
      required: true,
      message: 'Please select at least one activity type',
      trigger: 'blur'
    }
  ],
  https: [
    {
      type: 'array',
      required: true,
      message: '请输入HTTP',
      trigger: 'blur'
    }
  ],
  resource: [
    {
      required: true,
      message: '请输入HTTPS',
      trigger: 'blur'
    }
  ],
  desc: [{ required: true, message: 'Please input activity form', trigger: 'blur' }]
})

const handleSave = async () => {
  let parentValid = false
  if (!parentFormRef.value) return
  parentValid = await new Promise<boolean>((resolve) => {
    parentFormRef.value!.validate((valid) => {
      resolve(valid)
    })
  })
  let childValid = false
  if (!childRef.value) return
  childValid = await childRef.value[0]?.submitForm()
  if (parentValid && childValid) {
    console.log('父组件和子组件表单都校验通过，可以提交')
  } else {
    console.log('父组件和子组件表单都校验不通过', ruleForm)
  }
}

const resetForm = () => {
  if (!parentFormRef.value) return
  parentFormRef.value.resetFields()
}
const handlrEditTLS = () => {
  showTLSDialog.value = true
}
const handleCloseDialog = () => {
  showTLSDialog.value = false
}
const onRegister = (_parent: any, elTableRef: any) => {
  tableRef.value = elTableRef.value
}
const handleSubmit = () => {
  selected.value = tableRef.value?.getSelectionRows?.() || []
  showErrorTips.value = !(ruleFormTLS.value.checkList.length !== 0 && selected.value.length !== 0)
  showTLSDialog.value = false
}
</script>
<template>
  <div class="ml-48 flex-1 p-6 flex flex-col">
    <ElForm
      ref="parentFormRef"
      class="w-90% h-full"
      :model="ruleForm"
      :rules="rules"
      label-width="auto"
      label-position="left"
    >
      <div
        v-for="section in sections"
        :key="section.id"
        :id="section.id"
        :style="`height: ${section.height};`"
      >
        <div class="flex items-center gap-2 my-4">
          <!-- 前面的小色块 -->
          <span class="w-1 h-6 bg-blue-500 rounded-sm"></span>
          <!-- 文字 -->
          <span class="font-size-4">{{ section.title }}</span>
        </div>
        <template v-if="section.title == '防护域名'">
          <ElFormItem label="防护名称" prop="name">
            <div class="flex flex-items-center w-full">
              <ElTooltip
                effect="dark"
                content="如需同时配置泛域名和域名主体本身，请分别配置。如：需要同时配置*.b.a.com和b.a.com，需要分别接入域名并配置策略。"
                placement="top-start"
              >
                <Icon icon="ep:question-filled" class="m-r-2"></Icon>
              </ElTooltip>
              <ElInput
                v-model="ruleForm.name"
                placeholder="请填写需要防护的域名，支持泛域名或精确域名"
              />
            </div>
          </ElFormItem>
        </template>
        <template v-if="section.title == '基础配置'">
          <ElFormItem label="回源方式" prop="resource">
            <ElRadioGroup v-model="ruleForm.resource">
              <ElRadio value="Sponsorship">公网回源</ElRadio>
            </ElRadioGroup>
          </ElFormItem>

          <ElFormItem label="协议类型" :required="true">
            <ElRow class="w-full">
              <ElCol>
                <ElFormItem>
                  <ElCheckbox v-model="isSelectHttp" label="HTTP" />
                </ElFormItem>
              </ElCol>
              <ElCol v-if="isSelectHttp">
                <ElFormItem prop="http">
                  <ElInputTag v-model="ruleForm.http" :max="10" prefix-icon="Search"> </ElInputTag>
                </ElFormItem>
              </ElCol>
              <ElCol>
                <ElFormItem>
                  <ElCheckbox v-model="isSelectHttps" label="HTTPS" />
                </ElFormItem>
              </ElCol>
              <ElCol v-if="isSelectHttps">
                <ElFormItem prop="https">
                  <ElInputTag v-model="ruleForm.https" :max="10" prefix-icon="Search"> </ElInputTag>
                </ElFormItem>
              </ElCol>
            </ElRow>
          </ElFormItem>
          <template v-if="isSelectHttps">
            <ElFormItem label="证书选择" prop="resource">
              <ElSelect v-model="ruleForm.book" placeholder="Select" style="width: 240px">
                <ElOption
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
              <ElButton link type="primary">刷新</ElButton>
              <ElButton link type="primary">新增证书</ElButton>
            </ElFormItem>
            <ElFormItem label="SNL配置" prop="SNLConfigure">
              <ElSwitch v-model="ruleForm.SNLConfigure" />
              <ElInput
                v-if="ruleForm.SNLConfigure"
                placeholder="可自定义SNL的host，若不填写则跟随流量中的host"
              ></ElInput>
            </ElFormItem>
            <ElFormItem label="TLS配置" prop="delivery">
              <div class="flex flex-col items-start">
                <ElButton link type="primary" @click="openTLSConfigure = !openTLSConfigure">
                  {{ openTLSConfigure ? '展开配置' : '收起配置' }}
                  <Icon
                    :icon="openTLSConfigure ? 'ep:arrow-down' : 'ep:arrow-up'"
                    class="m-r-2"
                  ></Icon>
                </ElButton>
                <div class="flex flex-col" v-if="!openTLSConfigure">
                  <div>
                    <span>允许使用的TLS加密版本和加密套件，不匹配请求将默认丢弃</span>
                    <ElButton link type="primary" @click="handlrEditTLS">编辑配置</ElButton>
                  </div>
                  <ElDescriptions class="margin-top" :column="1">
                    <ElDescriptionsItem label="TLS协议">
                      <ElTag size="small">School</ElTag>
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label="加密套件">
                      <ElTag size="small">School</ElTag>
                    </ElDescriptionsItem>
                  </ElDescriptions>
                </div>
              </div>
            </ElFormItem>
          </template>
          <ElFormItem label="负载均衡" prop="resource">
            <ElRadioGroup v-model="ruleForm.resource">
              <ElRadio value="first">加权轮询(WRR)</ElRadio>
              <ElRadio value="second">加权最小连接数(WLC)</ElRadio>
              <ElRadio value="third">源地址哈希(SH)</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </template>
        <template v-if="section.title == '源站配置'">
          <originConfigure
            ref="childRef"
            :originList="ruleForm.originList"
            :http="ruleForm.http"
            :https="ruleForm.https"
          ></originConfigure>
        </template>
        <template v-if="section.title == '代理配置'">
          <ElFormItem label="代理配置" prop="resource">
            <div class="flex flex-col">
              <ElRadioGroup v-model="ruleForm.resource">
                <ElRadio value="Sponsorship">是</ElRadio>
                <ElRadio value="Venue">否</ElRadio>
              </ElRadioGroup>
              <span>是否使用代理，变更客户端IP获取地址</span>
            </div>
          </ElFormItem>
          <ElFormItem
            label="自定义获取客户端IP"
            prop="customClient"
            v-if="ruleForm.resource === 'Sponsorship'"
          >
            <ElRadioGroup v-model="ruleForm.customClient">
              <ElRadio value="Sponsorship">X-forwarded-For</ElRadio>
              <ElRadio value="Venue">自定义Header</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
          <ElFormItem label=" " prop="customizeHeader" v-if="ruleForm.customClient === 'Venue'">
            <div class="flex flex-col">
              <ElInput v-model="ruleForm.customizeHeader" placeholder="请填写" />
              <p> 1.按匹配字段添加顺序获取客户端 IP并将其作为客户端真实 IP </p>
              <p>2.如匹配字段无法获取客户端 IP，则将通过XFF字段获取 </p>
            </div>
          </ElFormItem>
        </template>
        <template v-if="section.title == '日志配置'">
          <ElFormItem label="日志采集" prop="delivery">
            <ElSwitch v-model="ruleForm.delivery" />
          </ElFormItem>
          <ElFormItem label="记录全量Header" prop="delivery">
            <ElSwitch v-model="ruleForm.delivery" />
            <span>仅将记录通用的常见Header字段，</span>
            <ElButton link type="primary">查看常见Header</ElButton>
          </ElFormItem>
        </template>
        <template v-if="section.title == '网络参数配置'">
          <ElFormItem
            :label="items.title"
            :prop="items.prop"
            v-for="items in InternetParamsConfiguration"
            :key="items.prop"
            :min="items.min"
            :max="items.max"
            :rules="getRules(items)"
          >
            <template class="flex">
              <ElInputNumber v-model="ruleForm[items.prop]" />
              <span class="px-4">{{ items.unit }}</span>
              <span>{{ items.describe }}</span>
            </template>
          </ElFormItem>
        </template>
      </div>
    </ElForm>
    <div class="flex justify-end my-6">
      <ElButton type="primary" @click="handleSave()">Create</ElButton>
      <ElButton @click="resetForm()">Reset</ElButton>
    </div>
  </div>
  <ElDialog
    v-model="showTLSDialog"
    title="xiug修改TLS配置"
    width="600"
    :before-close="handleCloseDialog"
  >
    <ElForm ref="ruleFormTLSRef" :model="ruleFormTLS" label-width="auto" label-position="left">
      <ElFormItem label="TLS协议" prop="resource">
        <ElCheckboxGroup v-model="ruleFormTLS.checkList">
          <ElCheckbox v-for="item in filteredTLS" :key="item" :value="item">
            {{ item }}
          </ElCheckbox>
        </ElCheckboxGroup>
      </ElFormItem>

      <Table
        ref="tableRef"
        :columns="columns"
        :data="ruleFormTLS.tableList"
        :loading="loading"
        :pagination="{
          total: total
        }"
        @register="onRegister"
      >
        <template #append>
          <span class="color-[red]" v-if="showErrorTips">
            TLSv1、TLSv1.1至少有一个对应的加密事件
          </span>
        </template>
      </Table>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton size="small" @click="showTLSDialog = false">取消</ElButton>
        <ElButton size="small" type="primary" @click="handleSubmit">确定</ElButton>
      </div>
    </template>
  </ElDialog>
</template>
