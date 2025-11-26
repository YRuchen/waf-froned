<script lang="tsx" setup>
import { reactive, ref, h, onMounted, computed, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Table, TableColumn } from '@/components/Table'
import { RuleForm, HTTP_PORTS, HTTPS_PORTS } from '@/api/websiteSettingPanel/types'
import {
  getTlsVersionsApi,
  getTlstCiphersApi,
  saveDomainsApi,
  getCertsApi,
  getDetailApi,
  updateDomainsApi,
  existsApi
} from '@/api/websiteSettingPanel'
import { LoadBalancingList } from '@/api/websiteSettingPanel/types'
import InputTags from './InputTags.vue'
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
  ElTable,
  ElCheckboxGroup,
  type FormInstance,
  type FormRules,
  type FormItemRule,
  ElMessage
} from 'element-plus'

import originSideConfigure from './OriginSideConfigure.vue'
const route = useRoute()
const { push } = useRouter()
const props = defineProps({
  sections: {
    type: Array<any>,
    default: () => []
  }
})
const columns: TableColumn[] = [
  {
    field: 'selection',
    type: 'selection'
  },
  {
    field: 'label',
    label: '加密套件'
  },
  {
    field: 'tlsVersions',
    label: 'TLS协议版本',
    formatter: (_: Recordable, __: TableColumn, cellValue: Array<string>) => {
      return cellValue.map((item) =>
        h(ElTag, { type: 'info', style: 'margin-right: 4px' }, () => item)
      )
    }
  }
]
const createConfig = (
  title: string,
  des: string,
  prop: string,
  unit: string,
  min: number,
  max: number,
  defaultValue: number
) => ({
  title,
  des,
  prop,
  unit,
  min,
  max,
  default: defaultValue,
  describe: `${des}，支持 ${min}–${max} ${unit}，默认：${defaultValue} ${unit}`
})

const domainId = route.query.id as string
const InternetParamsConfiguration = [
  createConfig(
    '请求body最大值',
    '可以接收客户端请求正文的最大值',
    'bodyMaxSize',
    'MB',
    1,
    10240,
    60
  ),
  createConfig(
    '建连超时时间',
    'WAF 和后端服务器的建连超时时间',
    'connectTimeout',
    '秒',
    4,
    120,
    30
  ),
  createConfig(
    '写连接超时时间',
    'WAF 将请求传输到后端服务器的超时时间',
    'writeTimeout',
    '秒',
    30,
    3600,
    60
  ),
  createConfig(
    '读连接超时时间',
    'WAF 从后端服务器读取响应的超时时间',
    'readTimeout',
    '秒',
    30,
    3600,
    60
  ),
  createConfig('回源重试', 'WAF 回源重试次数', 'retries', '次', 1, 10, 3)
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
const showTLSDialog = ref<boolean>(false)
const openTLSConfigure = ref<boolean>(true)
const loading = ref<boolean>(false)
const selected = ref<Array<any>>([])
const tableRef = ref<InstanceType<typeof ElTable> | null>(null)
const childRef = ref<InstanceType<typeof originSideConfigure>>()
const tlsVersionsArr = ref<Array<{ key: string; label: string }>>([])
const tlsCiphersArr = ref<Array<{ key: string; label: string; tlsVersions: string[] }>>([])
const ruleForm = reactive<RuleForm>({
  hostname: '',
  publicServer: true,
  httpEnabled: false,
  httpsEnabled: false,
  httpPorts: [],
  httpsPorts: [],
  sslProtocols: [],
  sslCiphers: [],
  certId: '',
  sniEnabled: true,
  snis: [],
  loadBalancing: 'ROUND_ROBIN',
  proxy: false,
  clientIpSource: '',
  logAllHeaders: false,
  logEnabled: false,
  logExcludeHeaders: [],
  statHeaders: [],
  serverGroups: [
    {
      groupName: '默认分组',
      servers: [
        {
          address: '',
          port: '80',
          weight: '',
          protol: ''
        }
      ],
      accessPorts: [],
      protocol: 'HTTP'
    }
  ],
  customIpSourceHeaders: [],
  connSetting: {
    connectTimeout: 30,
    writeTimeout: 60,
    readTimeout: 60,
    retries: 3,
    bodyMaxSize: 60
  }
})

// tls编辑弹窗的相关变量
const currentPage = ref<number>(1)
const pageSize = ref<number>(7)
const cancelList = ref<Array<{ key: string; label: string; tlsVersions: string[] }>>([])
const temporaryCheckList = ref<string[]>([])
const lastSelectedProtocols = ref<string[]>([])
const updateProtocolSnapshot = (list: string[]) => {
  lastSelectedProtocols.value = [...list]
}
const tlsTableList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return tlsCiphersArr.value.slice(start, end)
})

// 展示例外配置的inputTag的输入框
const showInputTags = ref(false)
const showStatHeaders = ref(false)

const total = computed(() => {
  return tlsCiphersArr.value.length ?? 0
})

const validSelectProtocol = (_rule: any, _value: any, callback: any) => {
  if (ruleForm.httpEnabled || ruleForm.httpsEnabled) {
    callback()
  } else {
    callback(new Error('请选择协议'))
  }
}
const domainRegex =
  /^(?:\*\.)?(?!:\/\/)(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/
const validSelectHostName = (_rule: any, value: any, callback: any) => {
  if (value) {
    if (domainRegex.test(value.trim()) === false) {
      callback(new Error('请输入正确的域名'))
      return
    }
    existsApi({ currDomainId: domainId ?? null, name: value.trim() }).then((res) => {
      if (!res.data.exists) {
        callback()
      } else {
        callback(new Error('域名重复'))
      }
    })
  } else {
    callback(new Error('请输入正确的域名'))
  }
}
const rules = reactive<FormRules<RuleForm>>({
  hostname: [
    { required: true, validator: validSelectHostName, trigger: 'blur' },
    // { required: true, message: '请输入正确的域名', trigger: 'blur' },
    { min: 3, max: 500, message: '请输入正确的域名', trigger: 'blur' }
  ],
  publicServer: [
    {
      required: true,
      message: '请选择回源方式',
      trigger: 'change'
    }
  ],
  certId: [
    {
      required: true,
      message: '请选择证书',
      trigger: 'change'
    }
  ],
  selectProtocol: [{ required: true, validator: validSelectProtocol, trigger: ['blur', 'change'] }],
  loadBalancing: [
    {
      required: true,
      message: '请选择负载均衡',
      trigger: 'change'
    }
  ]
})
/**tag校验是不是域名 */
const handleTag = (tag: string) => {
  const value = tag.trim()
  if (!domainRegex.test(value)) {
    // 不合法，删除
    const index = ruleForm.snis.indexOf(value)
    if (index > -1) ruleForm.snis.splice(index, 1)
    ElMessage.warning(`无效的域名: ${value}`)
  }
}
/**保存提交 */
const loadingButton = ref(false)
const handleSave = async () => {
  loadingButton.value = true
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
    // ('父组件和子组件表单都校验通过，可以提交')
    const apiPost = domainId ? updateDomainsApi : saveDomainsApi
    const res = await apiPost({
      id: domainId,
      domain: {
        ...ruleForm,
        httpPorts: ruleForm.httpPorts.map(Number),
        httpsPorts: ruleForm.httpsPorts.map(Number)
      }
    })
    if (route.name === 'EditSitePanel') {
      push({
        path: '/websiteSettings/index'
      })
    } else {
      push({
        path: '/websiteSettings/configureDone',
        query: {
          domainId: res.data.domain?.id || domainId,
          domainName: ruleForm.hostname
        }
      })
    }
  } else {
    console.log('父组件和子组件表单都校验不通过', ruleForm)
  }
  loadingButton.value = false
}

/**取消表单 */
const resetForm = () => {
  if (!parentFormRef.value) return
  parentFormRef.value.resetFields()
  push('/websiteSettings/index')
}
/**编辑tls */
const handleEditTLS = () => {
  showTLSDialog.value = true
}

const handleCloseDialog = () => {
  showTLSDialog.value = false
}
/**取消勾选，就把符合条件的tble也取消勾选 */
const handleCancel = (val: string[]) => {
  if (!tableRef.value) {
    updateProtocolSnapshot(val)
    return
  }
  const removedVersions = lastSelectedProtocols.value.filter((item) => !val.includes(item))
  updateProtocolSnapshot(val)
  if (!removedVersions.length) return
  const currentSelection = tableRef.value?.getSelectionRows?.() || []
  const remainRows: typeof currentSelection = []
  currentSelection.forEach((row) => {
    const supportedVersions = row.tlsVersions || []
    const stillSupported = supportedVersions.some((version) => val.includes(version))
    if (!stillSupported) {
      tableRef.value?.toggleRowSelection(row, false)
    } else {
      remainRows.push(row)
    }
  })
  cancelList.value = remainRows
}

/**table的方法 */
const onRegister = (_parent: any, elTableRef: any) => {
  tableRef.value = elTableRef.value
  // 初始化选中当前页的所有行
  nextTick(() => {
    cancelList.value.forEach((row) => {
      tableRef.value?.toggleRowSelection(row, true)
    })
  })
}

const handleSelectionChange = (
  rows: Array<{ key: string; label: string; tlsVersions: string[] }>
) => {
  cancelList.value = rows
}

const showErrorTips = computed(
  () => temporaryCheckList.value.length == 0 || cancelList.value.length == 0
)
/**TLS配置提交 */
const handleSubmit = () => {
  selected.value = tableRef.value?.getSelectionRows?.() || []
  // showErrorTips.value = !(ruleForm.sslProtocols.length !== 0 && selected.value.length !== 0)
  if (showErrorTips.value) return
  showTLSDialog.value = false
  ruleForm.sslCiphers = selected.value.map((item) => item.label)
  ruleForm.sslProtocols = temporaryCheckList.value
}
/**获取TSL配置 */
const handleGetTls = async () => {
  const resVersions = await getTlsVersionsApi()
  const resCiphers = await getTlstCiphersApi()
  tlsVersionsArr.value = resVersions.data?.items ?? []
  tlsCiphersArr.value = resCiphers.data?.items ?? []
  if (!domainId) {
    ruleForm.sslProtocols = resVersions.data?.items.map((item) => item.label) ?? []
    ruleForm.sslCiphers = resCiphers.data?.items.map((item) => item.label) ?? []
    cancelList.value = resCiphers.data?.items ?? []
    temporaryCheckList.value = resVersions.data?.items.map((item) => item.label) ?? []
    updateProtocolSnapshot(temporaryCheckList.value)
  } else {
    cancelList.value = resCiphers.data?.items ?? []
    temporaryCheckList.value = ruleForm.sslProtocols ?? []
    updateProtocolSnapshot(temporaryCheckList.value)
    cancelList.value = tlsCiphersArr.value.filter((item) =>
      item.tlsVersions.some((checkItem) => temporaryCheckList.value.includes(checkItem))
    )
    nextTick(() => {
      cancelList.value.forEach((row) => {
        tableRef.value?.toggleRowSelection(row, true)
      })
    })

    // cancelList.value = tlsTableList.value
  }
}

const flag = ref(false)
/**获取详情 */
const getDatail = async () => {
  const res = await getDetailApi(domainId)
  if (res.code === 200) {
    Object.keys(res.data.domain).forEach((key) => {
      if (key in ruleForm) {
        ruleForm[key] =
          key === 'httpPorts' || key === 'httpsPorts'
            ? res.data.domain[key].map(String)
            : res.data.domain[key]
      }
    })
    if (ruleForm.sslProtocols?.length) {
      temporaryCheckList.value = ruleForm.sslProtocols.slice()
      updateProtocolSnapshot(temporaryCheckList.value)
    }
    flag.value = true
  }
}
const isValidPort = (port: string, PORTS: readonly string[]) => {
  return PORTS.includes(port)
}
const rendElOption = (item) => {
  return (
    <>
      <span>{item.name}</span>
      <span> | </span>
      <span>包含绑定域名：{item.subjectNames.join(',')}</span>
    </>
  )
}
const goToCert = () => {
  const base = import.meta.env.VITE_API_BASE_PATH
  window.location.href = `${base}/app/cert#/certificateManagement/index`
}

/**证书的搜索 */
const options = ref<Array<any>>([])

/**获取证书 */
const getCerts = async () => {
  const res = await getCertsApi({
    page: 1,
    pageSize: 1000
  })
  options.value = res.data.list
}
const onPaste = (e) => {
  const text = e.clipboardData.getData('text')
  if (text.includes('.') || !/^\d+$/.test(text)) {
    e.preventDefault()
  }
}
onMounted(() => {
  handleGetTls()
  getCerts()
  domainId ? getDatail() : null
})
</script>
<template>
  <div class="ml-52 flex-1 p-6 flex flex-col">
    <ElForm
      ref="parentFormRef"
      class="w-90% h-full"
      :model="ruleForm"
      :rules="rules"
      label-width="auto"
      label-position="left"
    >
      <div
        v-for="section in props.sections"
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
          <ElFormItem prop="hostname">
            <template #label>
              <div class="flex flex-items-center">
                <span>防护域名</span>
                <ElTooltip
                  effect="dark"
                  content="如需同时配置泛域名和域名主体本身，请分别配置。如：需要同时配置*.b.a.com和b.a.com，需要分别接入域名并配置策略。"
                  placement="top-start"
                  popper-style="max-width: 300px; white-space: normal;"
                >
                  <Icon icon="ep:question-filled" class="ml-1" />
                </ElTooltip>
              </div>
            </template>
            <ElInput
              v-model="ruleForm.hostname"
              placeholder="请填写需要防护的域名，支持泛域名或精确域名"
              :disabled="domainId ? true : false"
            />
          </ElFormItem>
        </template>
        <template v-if="section.title == '基础配置'">
          <ElFormItem label="回源方式" prop="publicServer">
            <ElRadioGroup v-model="ruleForm.publicServer">
              <ElRadio :value="true">公网回源</ElRadio>
            </ElRadioGroup>
          </ElFormItem>

          <ElFormItem label="协议类型" prop="selectProtocol">
            <ElRow class="w-full">
              <ElCol>
                <ElFormItem>
                  <ElCheckbox
                    v-model="ruleForm.httpEnabled"
                    label="HTTP"
                    @change="
                      (val) => {
                        val
                          ? (ruleForm.httpPorts = ruleForm.httpPorts.concat('80'))
                          : (ruleForm.httpPorts = [])
                      }
                    "
                  />
                </ElFormItem>
              </ElCol>
              <ElCol v-if="ruleForm.httpEnabled">
                <ElFormItem prop="httpPorts">
                  <!-- <ElInputTag v-model="ruleForm.httpPorts" :max="10" prefix-icon="Search" /> -->
                  <InputTags
                    :tagsList="ruleForm.httpPorts"
                    tipsContent="点击编辑"
                    @update:tagsList="
                      (newTags) => {
                        const added = newTags.find((tag) => !ruleForm.httpPorts.includes(tag))
                        if (added && !isValidPort(added, HTTP_PORTS)) {
                          ElMessage.warning(`端口号 ${added} 不符合`)
                          ruleForm.httpPorts = newTags.filter((tag) => tag !== added)
                          return
                        }
                        ruleForm.httpPorts = newTags
                      }
                    "
                    :protectedPorts="['80']"
                    :max="10"
                    clearable
                  />
                </ElFormItem>
              </ElCol>
              <ElCol>
                <ElFormItem>
                  <ElCheckbox
                    v-model="ruleForm.httpsEnabled"
                    label="HTTPS"
                    @change="
                      (val) => {
                        val
                          ? (ruleForm.httpsPorts = ruleForm.httpsPorts.concat('443'))
                          : (ruleForm.httpsPorts = [])
                      }
                    "
                  />
                  <ElTag
                    type="info"
                    class="ml-2"
                    v-if="ruleForm.httpsEnabled && !ruleForm.httpEnabled"
                    >HTTP请求默认重定向到HTTPS
                  </ElTag>
                </ElFormItem>
              </ElCol>
              <ElCol v-if="ruleForm.httpsEnabled">
                <ElFormItem prop="httpsPorts">
                  <InputTags
                    :tagsList="ruleForm.httpsPorts"
                    tipsContent="点击编辑"
                    @update:tagsList="
                      (newTags) => {
                        const added = newTags.find((tag) => !ruleForm.httpsPorts.includes(tag))
                        if (added && !isValidPort(added, HTTPS_PORTS)) {
                          ElMessage.warning(`端口号 ${added} 不符合`)
                          ruleForm.httpsPorts = newTags.filter((tag) => tag !== added)
                          return
                        }
                        ruleForm.httpsPorts = newTags
                      }
                    "
                    :protectedPorts="['443']"
                    :max="10"
                    clearable
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
          </ElFormItem>
          <template v-if="ruleForm.httpsEnabled">
            <ElFormItem label="证书选择" prop="certId">
              <ElSelect
                v-model="ruleForm.certId"
                placeholder="请选择/搜索证书"
                filterable
                class="!w-[80%]"
              >
                <ElOption
                  v-for="item in options"
                  :key="item.id"
                  :value="item.id"
                  :label="item.name + item.subjectNames.join(',')"
                >
                  <template #default>
                    <ElTooltip
                      effect="dark"
                      placement="right-start"
                      popper-style="max-width: 400px; white-space: normal;"
                    >
                      <template #content>
                        <component :is="rendElOption(item)"></component>
                      </template>
                      <div style="max-width: 800px; text-overflow: ellipsis; overflow: hidden">
                        <component :is="rendElOption(item)"></component>
                      </div>
                    </ElTooltip>
                  </template>
                </ElOption>
              </ElSelect>
              <ElButton link type="primary" @click="getCerts">刷新</ElButton>
              <ElButton link type="primary" @click="goToCert">新增证书</ElButton>
            </ElFormItem>
            <ElFormItem label="SNI配置" prop="sniEnabled">
              <ElSwitch v-model="ruleForm.sniEnabled" />
              <ElInputTag
                v-if="ruleForm.sniEnabled"
                v-model="ruleForm.snis"
                placeholder="可自定义SNI的host，若不填写则跟随流量中的host"
                @add-tag="handleTag"
              />
            </ElFormItem>
            <ElFormItem label="TLS配置">
              <div class="flex flex-col items-start">
                <ElButton link type="primary" @click="openTLSConfigure = !openTLSConfigure">
                  {{ openTLSConfigure ? '展开配置' : '收起配置' }}
                  <Icon :icon="openTLSConfigure ? 'ep:arrow-down' : 'ep:arrow-up'" class="m-r-2" />
                </ElButton>
                <div class="flex flex-col" v-if="!openTLSConfigure">
                  <div>
                    <span>允许使用的TLS协议版本和加密套件，不匹配请求将默认丢弃</span>
                    <ElButton link type="primary" @click="handleEditTLS">编辑配置</ElButton>
                  </div>
                  <ElDescriptions class="margin-top w-full" :column="1">
                    <ElDescriptionsItem label="TLS协议">
                      <ElTag
                        size="small"
                        v-for="item in ruleForm.sslProtocols"
                        :key="item"
                        class="mr-2"
                        type="info"
                      >
                        {{ item }}
                      </ElTag>
                    </ElDescriptionsItem>
                    <ElDescriptionsItem label="加密套件">
                      <ElTag
                        size="small"
                        v-for="item in ruleForm.sslCiphers"
                        :key="item"
                        class="mr-2"
                        type="info"
                      >
                        {{ item }}
                      </ElTag>
                    </ElDescriptionsItem>
                  </ElDescriptions>
                </div>
              </div>
            </ElFormItem>
          </template>
          <ElFormItem label="负载均衡" prop="loadBalancing">
            <ElRadioGroup v-model="ruleForm.loadBalancing">
              <ElRadio v-for="item in LoadBalancingList" :key="item.key" :value="item.key">
                {{ item.label }}
              </ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </template>
        <template v-if="section.title == '源站配置'">
          <originSideConfigure
            v-if="(domainId && flag) || !domainId"
            ref="childRef"
            v-model:originList="ruleForm.serverGroups"
            :httpPorts="ruleForm.httpPorts"
            :httpsPorts="ruleForm.httpsPorts"
          />
        </template>
        <template v-if="section.title == '代理配置'">
          <ElFormItem label="代理配置" prop="proxy">
            <div class="flex flex-col">
              <ElRadioGroup v-model="ruleForm.proxy">
                <ElRadio :value="true">是</ElRadio>
                <ElRadio :value="false">否</ElRadio>
              </ElRadioGroup>
              <span>是否使用代理，变更客户端IP获取地址</span>
            </div>
          </ElFormItem>
          <ElFormItem label="自定义获取客户端IP" prop="clientIpSource" v-if="ruleForm.proxy">
            <ElRadioGroup v-model="ruleForm.clientIpSource">
              <ElRadio value="XFORWARD">
                <div class="flex items-center">
                  <span>X-forwarded-For</span>
                  <ElTooltip
                    effect="dark"
                    content="从X-Forwarded-For最左侧获取客户端IP"
                    placement="top-start"
                    popper-style="max-width: 300px; white-space: normal;"
                  >
                    <Icon icon="ep:warning-filled" class="ml-1" />
                  </ElTooltip>
                </div>
              </ElRadio>
              <ElRadio value="CUSTOM_HEADER">自定义Header</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
          <ElFormItem
            label=" "
            prop="customIpSourceHeaders"
            v-if="ruleForm.clientIpSource === 'CUSTOM_HEADER'"
          >
            <div class="flex flex-col">
              <!-- <ElInput v-model="ruleForm.customIpSourceHeaders" placeholder="最多配置5个自定义Header，回车换行分隔" /> -->
              <ElInputTag
                v-model="ruleForm.customIpSourceHeaders"
                :max="5"
                placeholder="最多配置5个自定义Header，回车换行分隔"
              />
              <p> 1.按匹配字段添加顺序获取客户端 IP并将其作为客户端真实 IP </p>
              <p>2.如匹配字段无法获取客户端 IP，则将通过XFF字段获取 </p>
            </div>
          </ElFormItem>
        </template>
        <template v-if="section.title == '日志配置'">
          <ElFormItem label="日志采集" prop="logEnabled">
            <ElSwitch v-model="ruleForm.logEnabled" />
          </ElFormItem>
          <ElFormItem label="记录全量Header" prop="logAllHeaders">
            <ElSwitch v-model="ruleForm.logAllHeaders" />
            <span class="ml-2" v-if="ruleForm.logAllHeaders">
              将记录流量中全部Header字段，部分字段在Headers中，开启可能导致日志存储空间增加
            </span>
            <p class="ml-2" v-else>
              <span>仅将记录通用的常见Header字段，</span>
              <!-- <ElButton link type="primary">查看常见Header</ElButton> -->
            </p>
          </ElFormItem>
          <template v-if="ruleForm.logAllHeaders">
            <ElFormItem label=" ">
              <ElButton link type="primary" @click="showInputTags = !showInputTags">
                配置例外Header({{ ruleForm.logExcludeHeaders.length }})
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
                v-model:tagsList="ruleForm.logExcludeHeaders"
                :limit="100"
                v-if="showInputTags"
              />
            </ElFormItem>
            <ElFormItem label=" ">
              <ElButton link type="primary" @click="showStatHeaders = !showStatHeaders">
                配置统计Header({{ ruleForm.statHeaders.length }})
                <Icon :icon="showStatHeaders ? 'ep:arrow-up' : 'ep:arrow-down'" class="m-r-2" />
              </ElButton>
              <ElTooltip
                effect="dark"
                content="在记录的Header范围内，配置需要统计、分析、告警的Header头字段名"
                placement="top"
              >
                <Icon icon="ep:question-filled" class="ml-1" />
              </ElTooltip>
              <InputTags
                v-model:tagsList="ruleForm.statHeaders"
                :max="100"
                v-if="showStatHeaders"
              />
            </ElFormItem>
          </template>
        </template>
        <template v-if="section.title == '网络参数配置'">
          <ElFormItem
            :label="items.title"
            :prop="`connSetting.${items.prop}`"
            v-for="items in InternetParamsConfiguration"
            :key="items.prop"
            :min="items.min"
            :max="items.max"
            :rules="getRules(items)"
          >
            <template class="flex">
              <ElInputNumber v-model="ruleForm.connSetting[items.prop]" :precision="0" />
              <span class="px-4 text-gray-500">{{ items.unit }}</span>
              <span class="text-gray-500">{{ items.describe }}</span>
            </template>
          </ElFormItem>
        </template>
      </div>
    </ElForm>
    <div class="flex justify-end my-6">
      <ElButton @click="resetForm()">取消</ElButton>
      <ElButton type="primary" @click="handleSave()" :loading="loadingButton">提交</ElButton>
    </div>
  </div>
  <ElDialog
    v-model="showTLSDialog"
    title="修改TLS配置"
    width="600"
    :before-close="handleCloseDialog"
  >
    <ElForm label-width="auto" label-position="left">
      <ElFormItem label="TLS协议">
        <ElCheckboxGroup v-model="temporaryCheckList" @change="handleCancel">
          <ElCheckbox v-for="item in tlsVersionsArr" :key="item.key" :value="item.key">
            {{ item.label }}
          </ElCheckbox>
        </ElCheckboxGroup>
        <span>勾选取消：自动取消当前仅支持该版本的对应套件。</span>
        <span>重新勾选：不会自动添加对应加密套件，若同时有新增加密套件需手动选择。</span>
      </ElFormItem>

      <Table
        ref="tableRef"
        v-model:currentPage="currentPage"
        :key="pageSize + '-' + currentPage"
        :reserve-selection="true"
        :row-key="'key'"
        :columns="columns"
        :data="tlsTableList"
        :loading="loading"
        :pagination="{
          layout: 'prev, pager, next',
          total: total,
          pageSize: pageSize,
          background: true,
          small: true
        }"
        height="350"
        @register="onRegister"
        @selection-change="handleSelectionChange"
      >
      </Table>
    </ElForm>
    <span class="color-[red]" v-if="showErrorTips"> TLSv1、TLSv1.1至少有一个对应的加密事件 </span>
    <template #footer>
      <div class="dialog-footer m-t-4">
        <ElButton size="small" @click="showTLSDialog = false">取消</ElButton>
        <ElButton size="small" type="primary" @click="handleSubmit">确定</ElButton>
      </div>
    </template>
  </ElDialog>
</template>
