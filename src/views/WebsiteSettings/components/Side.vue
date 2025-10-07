<script lang="tsx" setup>
import { onBeforeMount, ref, PropType, reactive, onMounted } from 'vue'

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
  ElMenu,
  ElMenuItem
} from 'element-plus'
import { BaseButton } from '@/components/Button'
import { useI18n } from '@/hooks/web/useI18n'
import { useIcon } from '@/hooks/web/useIcon'
import { OriginItem } from '../types'
const props = defineProps({
  originList: {
    type: Array as PropType<OriginItem[]>,
    default: () => []
  }
})
interface RuleForm {
  name: string
}

const { t } = useI18n()
const plusIcon = useIcon({ icon: 'vi-ep:plus' })
const editIcon = useIcon({ icon: 'vi-ep:edit' })
const deleteIcon = useIcon({ icon: 'vi-ep:delete' })
const emit = defineEmits(['change'])
const dialogFormVisible = ref(false)
const dialogFormTitle = ref('新增目录')
const curTreeData = ref({})
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
interface menuItem {
  id: string
  label: string
}

const menuData = ref<OriginItem[]>(props.originList)
const addDialogRef = ref()
const activeGroupId = ref(menuData.value[0]?.id)
const searchName = ref<any>('')
const searchNameList = ref<Array<menuItem>>([])

onBeforeMount(() => {
  getLDict()
})

const addDashBoard = (item) => {
  // open('新增仪表盘')
  addDialogRef.value.show()
}

// 搜索
const filterNode = (value: string, data: menuItem) => {
  if (!value) return true
  return data.label.includes(value)
}

const addDict = () => {
  menuData.value.push({
    id: Date.now().toString(),
    label: '自定义分组',
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
  })
}
const submitForm = async (formEl: FormInstance | undefined) => {}
const getLDict = async () => {}

const editDictsort = (data) => {
  dialogFormVisible.value = true
  dialogFormTitle.value = '编辑目录'
  Object.assign(form, data)
}

const handleSerch = (data) => {}

const remove = (row) => {
  ElMessageBox.confirm('你确定要删除当前项吗?', '温馨提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    draggable: true
  })
    .then(async () => {})
    .catch(() => {})
}
const handleSelect = (data: OriginItem) => {
  emit('change', data)
}
onMounted(() => {
  if (menuData.value.length > 0) {
    handleSelect(menuData.value[0]) // 首次调用
  }
})
</script>
<style lang="less">
.menu-wrap {
  // m-y-2 m-x-3 w-15%
  padding: 20px 10px;
  width: 17%;
  border: 1px solid #ededed;
  border-right: none;
}
.el-menu {
  border-right: 0;
  padding: 0 !important;
  .el-menu-item.is-active {
    background-color: #ededed;
    color: #7e7777;
  }
  .el-menu-item {
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
</style>
<template>
  <div class="menu-wrap">
    <div class="flex flex-justify-between">
      <ElPopover placement="bottom-start" width="300">
        <template #reference>
          <ElButton link class="m-y-2"> 分组 <Icon icon="vi-ep:search"></Icon> </ElButton>
        </template>
        <template #default>
          <ElInput v-model="searchName" placeholder="请填写" />
          <template v-if="searchNameList.length !== 0">
            <p class="m-2" v-for="item in searchNameList" :key="item.id">{{ item.label }}</p>
          </template>
          <template v-else>
            <ElEmpty>
              <template #description v-if="searchName && searchNameList.length === 0">
                暂无搜索结果，<ElButton link type="primary" @click="searchName = ''"
                  >清空搜索条件</ElButton
                >
              </template>
            </ElEmpty>
          </template>
        </template>
      </ElPopover>
      <BaseButton link :icon="plusIcon" @click="addDict">添加</BaseButton>
    </div>

    <ElScrollbar class="scrollbar">
      <ElMenu :default-active="activeGroupId" text-color="#333" active-text-color="#ededed">
        <ElMenuItem
          v-for="item in menuData"
          :key="item.id"
          :index="item.id"
          @click="handleSelect(item)"
        >
          <span class="label">{{ item.label }}</span>
          <p class="button-wrap">
            <Icon icon="vi-ep:edit"></Icon>
            <Icon icon="vi-ep:delete"></Icon>
          </p>
        </ElMenuItem>
      </ElMenu>
    </ElScrollbar>

    <ElDialog v-model="dialogFormVisible" :title="dialogFormTitle" width="300">
      <ElForm ref="formRef" :model="form" :rules="rules">
        <ElFormItem label="目录名称" prop="name">
          <ElInput v-model="form.name" autocomplete="off" />
        </ElFormItem>
      </ElForm>

      <template #footer>
        <div class="dialog-footer">
          <ElButton type="primary" @click="submitForm(formRef)">确定</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>
