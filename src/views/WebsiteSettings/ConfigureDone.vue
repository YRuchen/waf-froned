<script lang="tsx" setup>
import { onBeforeMount, ref, PropType, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ElMessageBox,
  FormInstance,
  FormRules,
  ElMessage,
  ElPopover,
  ElButton,
  ElIcon,
  ElEmpty,
  ElScrollbar,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElTable,
  ElTableColumn
} from 'element-plus'
import { BaseButton } from '@/components/Button'
import { useI18n } from '@/hooks/web/useI18n'
import { useIcon } from '@/hooks/web/useIcon'
import lineContent from './components/LineContent.vue'
import { describe } from 'node:test'

import {
  getCnamesApi,
  cnamesTestApi,
  getEgressApi,
  streamsTestListApi,
  upstreamsTestApi
} from '@/api/websiteSettingPanel'
const { t } = useI18n()
const { push } = useRouter()
const route = useRoute()
const domainId = route.query.domainId as string
interface RuleForm {
  domain: string
}
interface TableRow {
  originServer: string
  reachable: boolean
  reason: string
}
const textList = [
  {
    describe: '修改域名DNS服务记录类型设置为CNAME，并将记录值修改为WAF CNAME',
    buttonText1: '复制CNAME值',
    buttonText2: 'CNAME接入测试'
  },
  {
    describe: '加回WAF回源地址，以确保回源IP不受源站安全策略影响',
    buttonText1: '复制全部IP地址',
    buttonText2: '回源测试'
  }
]
const dialogVisible = ref<boolean>(false)
const showLoadingText = ref<number>(1)
const dialogTitle = ref<string>('')
const cnames = ref<string>('')
const egress = ref<string>('')
const ruleFormRef = ref<FormInstance>()
const tableData = ref<TableRow[]>([])
const ruleForm = reactive<RuleForm>({
  domain: ''
})
const action = (name: string) => {
  switch (name) {
    case '复制CNAME值':
      navigator.clipboard.writeText(cnames.value)
      ElMessage({
        message: '复制成功',
        type: 'success'
      })
      break
    case 'CNAME接入测试':
      dialogVisible.value = true
      showLoadingText.value = 1
      dialogTitle.value = name
      break
    case '复制全部IP地址':
      navigator.clipboard.writeText(egress.value)
      ElMessage({
        message: '复制成功',
        type: 'success'
      })
      break
    case '回源测试':
      dialogVisible.value = true
      showLoadingText.value = 1
      dialogTitle.value = name
      break

    default:
      break
  }
}
const validName = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入域名名称'))
  } else {
    const domainRegex = /^(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,}$/
    if (!domainRegex.test(value)) {
      callback(new Error('请输入正确的域名'))
    } else {
      callback() // 验证通过
    }
  }
}

const rules = reactive<FormRules<RuleForm>>({
  domain: [{ required: true, validator: validName, trigger: 'blur' }]
})
const handleClose = () => {
  dialogVisible.value = false
  ruleForm.domain = ''
}
const startTest = async () => {
  if (dialogTitle.value == 'CNAME接入测试') {
    if (!ruleFormRef.value) return
    ruleFormRef.value.validate(async (valid) => {
      if (valid) {
        showLoadingText.value = 2
        const res = await cnamesTestApi(ruleForm)
      } else {
        console.log('error submit!')
      }
    })
  } else {
    showLoadingText.value = 2
    const res = await upstreamsTestApi({ domainId: domainId })
    tableData.value = res.data.testInfos
    if (tableData.value.find((item) => item.reachable === false)) {
      showLoadingText.value = 4
      return
    }
    showLoadingText.value = 3
  }
}
const getCnamesAndEgress = async () => {
  const resCname = await getCnamesApi()
  cnames.value = resCname.data.domain
  const resEgress = await getEgressApi()
  egress.value = resEgress.data.egress
  const res = await streamsTestListApi({ domainId: domainId })
  tableData.value = res.data.testInfos
}
onMounted(() => {
  getCnamesAndEgress()
})
</script>
<style lang="less">
.circle-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 25px; /* 圆圈直径 */
  height: 25px; /* 圆圈直径 */
  border-radius: 50%; /* 圆形 */
  border: 1px solid #b4b4b4;
  color: #5f5f5f; /* 字体颜色 */
  font-weight: bold;
  font-size: 13px;
  text-align: center;
  margin-right: 10px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 旋转动画 */
.rotating-icon {
  font-size: 40px !important; /* 图标大小 */
  color: #409eff; /* 主题颜色 */
  animation: spin 1.5s linear infinite;
  svg.iconify.iconify--ep {
    font-size: 74px !important;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
<template>
  <div>
    <div class="h-[300px]">这是图片 </div>
    <div class="m-x-10 p-x-3 bg-[#f9f9f9] rounded-[16px]">
      <h4 class="p-y-4 p-x-10">请完成以下配置，确保网站可以顺利接入：</h4>
      <div class="p-y-4 p-x-10" v-for="(item, index) in textList" :key="index">
        <span class="circle-number">{{ index + 1 }}</span>
        <span>{{ item.describe }}</span>
        <ElButton link type="primary" class="m-l-2 !text-base" @click="action(item.buttonText1)">{{
          item.buttonText1
        }}</ElButton>
        <ElButton link type="primary" class="m-l-2 !text-base" @click="action(item.buttonText2)">{{
          item.buttonText2
        }}</ElButton>
      </div>
    </div>
    <div class="m-t-10 flex items-center justify-center">
      <ElButton size="large" @click="push('/websiteSettings/index')">生效并返回网站列表</ElButton>
      <ElButton type="primary" size="large" class="flex items-center justify-center">
        生效并继续配置防护策略
      </ElButton>
    </div>
  </div>
  <!-- <lineContent></lineContent> -->
  <ElDialog v-model="dialogVisible" :title="dialogTitle" width="600" :before-close="handleClose">
    <div v-if="dialogTitle == 'CNAME接入测试'">
      <ElForm
        ref="ruleFormRef"
        :model="ruleForm"
        label-width="auto"
        label-position="left"
        :rules="rules"
      >
        <ElFormItem label="域名名称" prop="name">
          <ElInput v-model="ruleForm.domain" placeholder="请输入域名名称" />
          <span class="leading-5 break-words max-w-full" v-if="showLoadingText == 4">
            失败原因：xxxxxxxxxxxxxXXXXXXxxxxxxxxxxxxxxxxxxxxxxddddddddddddddddddddddddxxxxxxxxxxxxxxxxxxxxx
          </span>
        </ElFormItem>
      </ElForm>
    </div>
    <div v-else>
      <ElTable :data="tableData" style="width: 100%" border>
        <ElTableColumn prop="originServer" label="回源地址" width="180" />
        <ElTableColumn prop="reachable" label="测试结果" width="180" />
        <ElTableColumn prop="reason" label="失败原因" />
      </ElTable>
    </div>
    <div class="flex justify-end m-t-4">
      <ElButton size="large" type="primary" @click="startTest" v-if="showLoadingText == 1">
        开始测试
      </ElButton>
      <ElButton
        size="large"
        type="info"
        :disabled="showLoadingText == 2"
        v-else-if="showLoadingText == 2"
        >测试中</ElButton
      >
      <ElButton size="large" type="info" @click="handleClose" v-else-if="showLoadingText == 3"
        >测试完成</ElButton
      >
      <ElButton size="large" type="danger" @click="startTest" v-else-if="showLoadingText == 4"
        >重新测试</ElButton
      >
      <ElButton size="large" @click="handleClose">取消</ElButton>
    </div>
    <div class="loading-container" v-if="showLoadingText == 2">
      <!-- 使用 Element Plus 图标 -->
      <Icon class="rotating-icon" icon="ep:loading" />
      <span>测试正在进行中，这可能需要最多5-10S，请稍候..</span>
    </div>
  </ElDialog>
</template>
