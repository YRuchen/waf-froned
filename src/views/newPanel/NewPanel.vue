<script setup lang="tsx">
import { ref, reactive } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import {
  ElTabs,
  ElTabPane,
  ElSwitch,
  ElButton,
  ElInput,
  ElSelect,
  ElOption,
  ElForm,
  ElFormItem,
  ElTable,
  ElTableColumn,
  ElEmpty,
  ElMessage
} from 'element-plus'

const activeTab = ref('blocklist')
const blockEnabled = ref(true)

const filterForm = reactive({
  ruleName: '',
  domain: '',
  protectDomain: '',
  action: ''
})

const tableData = ref<any[]>([])

const handleToggleChange = (value: boolean) => {
  ElMessage.info(`禁止访问名单已${value ? '开启' : '关闭'}`)
}

const handleReset = () => {
  filterForm.ruleName = ''
  filterForm.domain = ''
  filterForm.protectDomain = ''
  filterForm.action = ''
}

const handleSearch = () => {
  ElMessage.info('当前为静态页面，暂无搜索结果')
}

const handleAddRule = () => {
  ElMessage.info('当前为静态页面，暂不支持新增规则')
}

const handleRefresh = () => {
  ElMessage.success('刷新成功')
}
</script>

<template>
  <ContentWrap title="访问控制">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div class="flex flex-wrap items-center gap-6">
        <ElTabs v-model="activeTab">
          <ElTabPane label="禁止访问名单" name="blocklist" />
          <ElTabPane label="允许访问名单" name="allowlist" />
        </ElTabs>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">禁止访问名单</span>
          <ElSwitch
            v-model="blockEnabled"
            inline-prompt
            active-text="开启"
            inactive-text="关闭"
            @change="handleToggleChange"
          />
        </div>
        <span class="text-xs text-gray-400">
          将特定IP添加到禁止访问名单中，该IP的相关访问行为将被拦截告警。
        </span>
      </div>
      <div class="flex items-center gap-2">
        <ElButton circle @click="handleRefresh">
          <Icon icon="ep:refresh" />
        </ElButton>
        <ElButton type="primary" @click="handleAddRule">
          <Icon icon="ep:plus" class="mr-1" />
          添加规则
        </ElButton>
      </div>
    </div>

    <ElForm
      :model="filterForm"
      inline
      class="bg-gray-50 px-4 py-4 rounded-md border border-gray-100"
    >
      <ElFormItem label="规则名称">
        <ElInput v-model="filterForm.ruleName" placeholder="请输入" clearable />
      </ElFormItem>
      <ElFormItem label="规则标签">
        <ElInput v-model="filterForm.domain" placeholder="请输入" clearable />
      </ElFormItem>
      <ElFormItem label="防护域名">
        <ElSelect
          v-model="filterForm.protectDomain"
          placeholder="请选择"
          clearable
          style="width: 180px"
        >
          <ElOption label="全部" value="all" />
          <ElOption label="www.example.com" value="example" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="执行动作">
        <ElSelect v-model="filterForm.action" placeholder="请选择" clearable style="width: 140px">
          <ElOption label="拦截" value="block" />
          <ElOption label="放行" value="allow" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem>
        <ElButton type="primary" @click="handleSearch">查询</ElButton>
        <ElButton @click="handleReset">重置</ElButton>
      </ElFormItem>
    </ElForm>

    <div class="mt-4 border border-gray-100 rounded-md">
      <ElTable :data="tableData" border>
        <ElTableColumn label="规则标识/ID" prop="id" min-width="140" />
        <ElTableColumn label="规则描述" prop="desc" min-width="160" />
        <ElTableColumn label="防护域名" prop="domain" min-width="160" />
        <ElTableColumn label="路径" prop="path" min-width="120" />
        <ElTableColumn label="IP地址" prop="ip" min-width="140" />
        <ElTableColumn label="执行动作" prop="action" min-width="120" />
        <ElTableColumn label="规则开关" prop="status" min-width="120" />
        <ElTableColumn label="更新时间" prop="updatedAt" min-width="160" />
        <ElTableColumn label="操作" prop="operation" min-width="140" fixed="right" />
        <template #empty>
          <div class="py-12">
            <ElEmpty description="暂时没有数据" :image-size="120">
              <template #description>
                暂无数据，<ElButton type="primary" link @click="handleAddRule">添加规则</ElButton>
              </template>
            </ElEmpty>
          </div>
        </template>
      </ElTable>
    </div>
  </ContentWrap>
</template>

<style scoped>
.text-gray-400 {
  color: #bfbfbf;
}

.text-gray-600 {
  color: #636363;
}

.bg-gray-50 {
  background-color: #f8f8f8;
}

.border-gray-100 {
  border-color: #ebebeb;
}
</style>
