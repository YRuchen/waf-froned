<script lang="tsx" setup>
import { reactive, ref } from 'vue'
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
  type FormInstance,
  type FormRules,
  type FormItemRule
} from 'element-plus'

import originConfigure from './originConfigure.vue'
import { OriginItem } from '../types'
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
  numberInput: number
  bodyNum: number
  createOverTime: number
  writeOverTime: number
  readOverTime: number
  retryCount: number
  originList: OriginItem[]
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
  desc: '',
  book: '',
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
            <ElFormItem label="SNL配置" prop="delivery">
              <ElSwitch v-model="ruleForm.delivery" />
              <ElInput placeholder="可自定义SNL的host，若不填写则跟随流量中的host"></ElInput>
            </ElFormItem>
            <ElFormItem label="TLS配置" prop="delivery">
              <ElButton link type="primary">展开配置</ElButton>
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
</template>
