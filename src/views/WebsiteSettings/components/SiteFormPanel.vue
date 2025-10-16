<script lang="tsx" setup>
import { reactive, ref, h, onMounted, watch, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Table, TableColumn } from '@/components/Table'
import { RuleForm } from '@/api/websiteSettingPanel/types'
import { getTlsVersionsApi, getTlstCiphersApi, saveDomainsApi } from '@/api/websiteSettingPanel'
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
  ElEmpty,
  ElTable,
  ElTableColumn,
  ElCheckboxGroup,
  type FormInstance,
  type FormRules,
  type FormItemRule,
  ElMessage
} from 'element-plus'

import originSideConfigure from './OriginSideConfigure.vue'
import { isCancel } from 'axios'
import { string } from 'vue-types'
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

const type = route.query.type as string
const InternetParamsConfiguration = [
  createConfig('请求body最大值', 'bodyMaxSize', 'MB', 1, 10240, 60),
  createConfig('建连超时时间', 'connectTimeout', '秒', 4, 120, 30),
  createConfig('写连接超时时间', 'writeTimeout', '秒', 30, 3600, 60),
  createConfig('读连接超时时间', 'readTimeout', '秒', 30, 3600, 60),
  createConfig('回源重试次数', 'retries', '次', 1, 10, 3)
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
const showErrorTips = ref<boolean>(false)
const selected = ref<Array<any>>([])
const tableRef = ref<InstanceType<typeof ElTable> | null>(null)
const childRef = ref<InstanceType<typeof originSideConfigure>>()
const tlsVersionsArr = ref<Array<{ key: string; label: string }>>([])
const tlsCiphersArr = ref<Array<{ key: string; label: string; tlsVersions: Array<string[]> }>>([])
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
  sniEnabled: false,
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
          port: '',
          weight: '',
          protol: ''
        }
      ],
      accessPorts: [],
      protocol: 'PROTOCOL_UNSPECIFIED'
    }
  ],
  customIpSourceHeaders: '',
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
const cancelList = ref<Array<{ key: string; label: string; tlsVersions: Array<string[]> }>>([])
const temporaryCheckList = ref<string[]>([])
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

const options = [{ value: 1, label: 1 }]

const validSelectProtocol = (_rule: any, _value: any, callback: any) => {
  if (ruleForm.httpEnabled || ruleForm.httpsEnabled) {
    callback()
  } else {
    callback(new Error('请选择协议'))
  }
}
const rules = reactive<FormRules<RuleForm>>({
  hostname: [
    { required: true, message: '请输入正确的域名', trigger: 'blur' },
    { min: 3, max: 5, message: '请输入正确的域名', trigger: 'blur' }
  ],
  publicServer: [
    {
      required: true,
      message: '请选择回源方式',
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
/**保存校验 */
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
    // console.log('父组件和子组件表单都校验通过，可以提交')
    await saveDomainsApi(ruleForm)
    resetForm()
  } else {
    console.log('父组件和子组件表单都校验不通过', ruleForm)
  }
}

const resetForm = () => {
  if (!parentFormRef.value) return
  parentFormRef.value.resetFields()
  push('/websiteSettings/index')
}
/**编辑tls */
const handlrEditTLS = () => {
  showTLSDialog.value = true
}

const handleCloseDialog = () => {
  showTLSDialog.value = false
}
/**取消勾选，就把符合条件的tble也取消勾选 */
const handleCancel = (val) => {
  if (!tableRef.value) return
  // 获取符合条件的行
  cancelList.value = tlsCiphersArr.value.filter((item) =>
    item.tlsVersions.some((checkItem) => val.includes(checkItem))
  )
  tableRef.value?.clearSelection()
  // 遍历取消勾选这些行
  cancelList.value.forEach((row) => {
    tableRef.value?.toggleRowSelection(row, true)
  })
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
const handleSubmit = () => {
  selected.value = tableRef.value?.getSelectionRows?.() || []
  showErrorTips.value = !(ruleForm.sslProtocols.length !== 0 && selected.value.length !== 0)
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
  ruleForm.sslProtocols = resVersions.data?.items.map((item) => item.label) ?? []
  temporaryCheckList.value = resVersions.data?.items.map((item) => item.label) ?? []
  tlsCiphersArr.value = resCiphers.data?.items ?? []
  ruleForm.sslCiphers = resCiphers.data?.items.map((item) => item.label) ?? []
  cancelList.value = resCiphers.data?.items ?? []
}
onMounted(() => {
  handleGetTls()
})
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
                <span>防护名称</span>
                <ElTooltip
                  effect="dark"
                  content="如需同时配置泛域名和域名主体本身，请分别配置。如：需要同时配置*.b.a.com和b.a.com，需要分别接入域名并配置策略。"
                  placement="top-start"
                >
                  <Icon icon="ep:question-filled" class="ml-1" />
                </ElTooltip>
              </div>
            </template>
            <ElInput
              v-model="ruleForm.hostname"
              placeholder="请填写需要防护的域名，支持泛域名或精确域名"
              :disabled="type == 'edit'"
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
                        val ? (ruleForm.httpPorts = ruleForm.httpPorts.concat('80')) : ''
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
                    @update:tagsList="
                      (newTags) => {
                        const added = newTags.filter((tag) => !ruleForm.httpPorts.includes(tag))
                        const invalid = added.find((tag) => ruleForm.httpsPorts.includes(tag))
                        if (invalid) {
                          ElMessage.warning(`端口号 ${invalid} 不符合`)
                          ruleForm.httpPorts = newTags.filter((tag) => tag !== invalid)
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
                        val ? (ruleForm.httpsPorts = ruleForm.httpsPorts.concat('443')) : ''
                      }
                    "
                  />
                </ElFormItem>
              </ElCol>
              <ElCol v-if="ruleForm.httpsEnabled">
                <ElFormItem prop="httpsPorts">
                  <InputTags
                    :tagsList="ruleForm.httpsPorts"
                    @update:tagsList="
                      (newTags) => {
                        const added = newTags.filter((tag) => !ruleForm.httpsPorts.includes(tag))
                        const invalid = added.find((tag) => ruleForm.httpPorts.includes(tag))
                        if (invalid) {
                          ElMessage.warning(`端口号 ${invalid} 不符合`)
                          ruleForm.httpsPorts = newTags.filter((tag) => tag !== invalid)
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
              <ElSelect v-model="ruleForm.certId" placeholder="Select" style="width: 240px">
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
            <ElFormItem label="SNI配置" prop="sniEnabled">
              <ElSwitch v-model="ruleForm.sniEnabled" />
              <ElInput
                v-if="ruleForm.sniEnabled"
                placeholder="可自定义SNI的host，若不填写则跟随流量中的host"
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
                    <span>允许使用的TLS加密版本和加密套件，不匹配请求将默认丢弃</span>
                    <ElButton link type="primary" @click="handlrEditTLS">编辑配置</ElButton>
                  </div>
                  <ElDescriptions class="margin-top w-full" :column="1">
                    <ElDescriptionsItem label="TLS协议">
                      <ElTag
                        size="small"
                        v-for="item in ruleForm.sslProtocols"
                        :key="item"
                        class="mr-2"
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
              <ElRadio value="ROUND_ROBIN">加权轮询(WRR)</ElRadio>
              <ElRadio value="LEAST_CONNECTIONS">加权最小连接数(WLC)</ElRadio>
              <ElRadio value="CONSISTENT_HASHING">源地址哈希(SH)</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </template>
        <template v-if="section.title == '源站配置'">
          <originSideConfigure
            ref="childRef"
            :originList="ruleForm.serverGroups"
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
              <ElRadio value="XFORWARD">X-forwarded-For</ElRadio>
              <ElRadio value="CUSTOM_HEADER">自定义Header</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
          <ElFormItem
            label=" "
            prop="customIpSourceHeaders"
            v-if="ruleForm.clientIpSource === 'CUSTOM_HEADER'"
          >
            <div class="flex flex-col">
              <ElInput v-model="ruleForm.customIpSourceHeaders" placeholder="请填写" />
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
            <span>仅将记录通用的常见Header字段，</span>
            <ElButton link type="primary">查看常见Header</ElButton>
          </ElFormItem>
          <template v-if="ruleForm.logAllHeaders">
            <ElFormItem label=" ">
              <ElButton link type="primary" @click="showInputTags = !showInputTags">
                配置例外Header({{ ruleForm.logExcludeHeaders.length }})
                <Icon :icon="showInputTags ? 'ep:arrow-up' : 'ep:arrow-down'" class="m-r-2" />
              </ElButton>
              <InputTags
                v-model:tagsList="ruleForm.logExcludeHeaders"
                :limit="100"
                @update:ruleForm.logExcludeHeaders="(val) => (ruleForm.logExcludeHeaders = val)"
                v-if="showInputTags"
              />
            </ElFormItem>
            <ElFormItem label=" ">
              <ElButton link type="primary" @click="showStatHeaders = !showStatHeaders">
                配置统计Header({{ ruleForm.statHeaders.length }})
                <Icon :icon="showStatHeaders ? 'ep:arrow-up' : 'ep:arrow-down'" class="m-r-2" />
              </ElButton>
              <InputTags
                v-model:tagsList="ruleForm.statHeaders"
                :max="100"
                @update:ruleForm.statHeaders="(val) => (ruleForm.statHeaders = val)"
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
              <ElInputNumber v-model="ruleForm.connSetting[items.prop]" />
              <span class="px-4">{{ items.unit }}</span>
              <span>{{ items.describe }}</span>
            </template>
          </ElFormItem>
        </template>
      </div>
    </ElForm>
    <div class="flex justify-end my-6">
      <ElButton @click="resetForm()">取消</ElButton>
      <ElButton type="primary" @click="handleSave()">提交</ElButton>
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
          pageSize: pageSize
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
