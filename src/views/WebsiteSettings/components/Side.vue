<script lang="tsx" setup>
// import { Icon } from '@iconify/vue'
import { nextTick, ref, PropType, reactive, onMounted, watch, toRef } from 'vue'
import { debounce } from 'lodash-es'
import {
  ElMessageBox,
  FormInstance,
  FormRules,
  ElMessage,
  ElPopover,
  ElButton,
  ElTooltip,
  ElEmpty,
  ElScrollbar,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMenu,
  ElMenuItem,
  type PopoverInstance
} from 'element-plus'
import { useI18n } from '@/hooks/web/useI18n'
import { useIcon } from '@/hooks/web/useIcon'
import { serverGroupItem } from '@/api/websiteSettingPanel/types'
const props = defineProps({
  originList: {
    type: Array as PropType<serverGroupItem[]>,
    default: () => []
  }
})
interface RuleForm {
  name: string
}

const { t } = useI18n()
const plusIcon = useIcon({ icon: 'vi-ep:plus' })
const emit = defineEmits(['change', 'onupdata:originList'])
const dialogFormVisible = ref(false)
const form = reactive({
  name: '',
  folderId: 0
})

const formRef = ref<FormInstance>()
const rules = reactive<FormRules<RuleForm>>({
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 3, max: 30, message: '长度在 3 到 30 个字符', trigger: 'blur' }
  ]
})

const menuData = toRef(props, 'originList')
const activeGroupId = ref()
const searchName = ref<any>('')
const searchNameList = ref<Array<serverGroupItem>>([])
const popoverRef = ref<PopoverInstance>()

// 搜索
const filterNode = debounce((val: string) => {
  if (!val) {
    searchNameList.value = []
    return
  }
  searchNameList.value = menuData.value.filter((item) => item.groupName.includes(val))
}, 500)

const addDict = (index) => {
  menuData.value.push({
    groupName: '自定义分组' + index,
    servers: [
      {
        address: '',
        port: '',
        weight: '',
        protol: ''
      }
    ],
    accessPorts: [],
    protocol: 'HTTP'
  })
  // emit('onupdata:originList', menuData.value)
}
const currentItem = ref<any>({})
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      const newName = form.name.trim()
      if (menuData.value.some((i) => i.groupName === newName)) {
        ElMessage.warning('该分组名称已存在')
        return
      }
      currentItem.value.groupName = form.name
      dialogFormVisible.value = false
    } else {
      console.log('error submit!', fields)
    }
  })
}

const editDictsort = (e, data) => {
  e.stopPropagation()
  dialogFormVisible.value = true
  form.name = data.groupName
  currentItem.value = data
}

const handleClosePover = (item) => {
  popoverRef.value?.hide()
  handleSelect(item)
  activeGroupId.value = item.groupName
  searchName.value = ''
}
const warningIcon = useIcon({ icon: 'ep:warning-filled' })
const remove = (row) => {
  ElMessageBox({
    // title: '确认删除',
    message: (
      <div class="flex">
        <span class="text-[var(--el-color-warning)] mr-1.5 p-1">{warningIcon}</span>
        <span>
          确认删除?删除分组后将清空组内回源配置，并对组内接入端口按照默认分组配置执行回源操作。
        </span>
      </div>
    ),
    showCancelButton: true,
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    confirmButtonClass: 'el-button--danger'
  })
    .then(() => {
      nextTick(() => {
        const index = menuData.value.findIndex((item) => item.groupName === row.groupName)
        if (index !== -1) {
          menuData.value.splice(index, 1)
        }
        handleSelect(menuData.value[menuData.value.length - 1])
      })
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}
const menuRef = ref()
const menuKey = ref(0)
const handleSelect = (data: serverGroupItem) => {
  // activeGroupId.value = '默认分组'
  menuKey.value++
  emit('change', data)
}
onMounted(() => {
  handleSelect(menuData.value[0])
})

defineExpose({ activeGroupId })
</script>
<style lang="less">
.menu-wrap {
  // m-y-2 m-x-3 w-15%
  padding: 20px 10px;
  height: 100%;
  border: 1px solid #ededed;
  border-right: none;
  overflow-x: hidden;
}
.scrollbar {
  width: 100%;
  height: 90%;
  .el-menu {
    width: 100%;
    border-right: 0;
    padding: 0 !important;
    .el-menu-item.is-active {
      background-color: #ededed;
      color: #7e7777;
    }
    .el-menu-item {
      width: 100%;
      .el-icon {
        margin-right: 1px !important;
      }
      .button-wrap {
        display: none;
      }
      .label {
        margin-right: 2px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      &:hover {
        .button-wrap {
          display: block;
        }
        .label {
          width: 60%;
        }
      }
    }
  }
}
</style>
<template>
  <div class="menu-wrap">
    <div class="flex flex-justify-between">
      <ElPopover ref="popoverRef" placement="bottom-start" width="300" trigger="click">
        <template #reference>
          <ElButton link class="m-y-2">
            <span class="m-x-1">分组</span>
            <ElTooltip
              effect="dark"
              content="搜索"
              placement="top"
              popper-style="max-width: 300px; white-space: normal;"
            >
              <Icon icon="vi-ep:search"></Icon>
            </ElTooltip>
          </ElButton>
        </template>
        <template #default>
          <ElInput
            v-model="searchName"
            placeholder="请输入分组名称或接入端口"
            @input="filterNode"
          />
          <template v-if="searchNameList.length !== 0">
            <p
              class="m-2 cursor-pointer"
              v-for="item in searchNameList"
              :key="item.groupName"
              @click="handleClosePover(item)"
            >
              {{ item.groupName }}
            </p>
          </template>
          <template v-else>
            <ElEmpty :image-size="100">
              <template #description v-if="searchName && searchNameList.length === 0">
                暂无搜索结果，<ElButton link type="primary" @click="searchName = ''"
                  >清空搜索条件</ElButton
                >
              </template>
            </ElEmpty>
          </template>
        </template>
      </ElPopover>
      <ElButton link type="primary" :icon="plusIcon" @click="addDict(menuData.length)">
        添加
      </ElButton>
    </div>

    <ElScrollbar class="scrollbar">
      <ElMenu
        :default-active="activeGroupId"
        :key="menuKey"
        text-color="#333"
        active-text-color="#ededed"
        ref="menuRef"
      >
        <ElMenuItem
          v-for="item in menuData"
          :key="item.groupName"
          :index="item.groupName"
          @click="handleSelect(item)"
        >
          <span class="label">{{ item.groupName }}</span>
          <p class="button-wrap" v-if="item.groupName !== '默认分组'">
            <ElTooltip effect="dark" content="重命名" placement="top">
              <Icon icon="vi-ep:edit" @click="(e) => editDictsort(e, item)"></Icon>
            </ElTooltip>
            <ElTooltip effect="dark" content="删除" placement="top">
              <Icon icon="vi-ep:delete" @click="remove(item)"></Icon>
            </ElTooltip>
          </p>
        </ElMenuItem>
      </ElMenu>
    </ElScrollbar>

    <ElDialog v-model="dialogFormVisible" title="编辑分组名称" width="400">
      <ElForm ref="formRef" :model="form" :rules="rules">
        <ElFormItem label="目录名称" prop="name">
          <ElInput v-model="form.name" autocomplete="off" />
        </ElFormItem>
      </ElForm>

      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="dialogFormVisible = false">取消</ElButton>
          <ElButton type="primary" @click="submitForm(formRef)">确定</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>
