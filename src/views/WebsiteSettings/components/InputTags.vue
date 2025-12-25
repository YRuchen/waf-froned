<script setup lang="tsx">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElTag, ElTooltip, ElIcon } from 'element-plus'
import { CircleCloseFilled, Close } from '@element-plus/icons-vue'
import { propTypes } from '@/utils/propTypes'

const props = defineProps({
  /** 绑定的标签数组 */
  tagsList: {
    type: Array as () => string[],
    default: () => []
  },

  /** 最大可输入数量 */
  max: propTypes.number,

  /** 字数上限 */
  limit: propTypes.number,

  /** 可清空 */
  clearable: propTypes.bool.def(false),

  /** 鼠标上移删除的tips的content */
  tipsContent: propTypes.string.def(''),

  /** 不可删除的标签（受保护） */
  protectedPorts: {
    type: Array as () => string[],
    default: () => []
  }
})
const emit = defineEmits(['update:tagsList'])
const headers = ref<string[]>([...(props.tagsList || [])])
const inputValue = ref('')
const inputRef = ref<HTMLInputElement>()

const totalLength = computed(
  () => headers.value.reduce((sum, item) => sum + item.length, 0) + inputValue.value.length
)

const handleEnter = () => {
  const val = inputValue.value.trim()
  if (!val) return
  // 判断是否输入重复
  if (headers.value.includes(val)) {
    ElMessage.warning('该项已存在')
    inputValue.value = ''
    return
  }
  // 判断是否限制输入字数
  if (totalLength.value > props.limit) {
    inputValue.value = ''
    ElMessage.error('总字符数不能超过 100')
    return
  }
  // 判断是否限制标签数
  if (props.max && headers.value.length >= props.max) {
    ElMessage.warning(`最多只能添加 ${props.max} 个标签`)
    inputValue.value = ''
    return
  }
  headers.value.push(val)
  inputValue.value = ''
  emit('update:tagsList', headers.value)
}
// 删除所有可删除标签
const clearAll = () => {
  headers.value = headers.value.filter((tag) => (props.protectedPorts || []).includes(tag))
  emit('update:tagsList', headers.value)
}
const removeHeader = (index: number) => {
  headers.value.splice(index, 1)
}

const focusInput = () => {
  inputRef.value?.focus()
}
/**计算标签能不能删除 */
const isClosable = (tag: string) => {
  return !(props.protectedPorts || []).includes(tag)
}
/**自定义删除 */
const removeTag = (clearTag) => {
  headers.value = headers.value.filter((tag) => tag !== clearTag)
  emit('update:tagsList', headers.value)
}
watch(
  () => props.tagsList,
  (newVal) => {
    headers.value = [...(newVal || [])]
  },
  { deep: true }
)
</script>

<style scoped lang="less">
.input-box {
  height: 100px;
  width: 100%;
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  min-height: 36px;
  padding: 4px 8px; /* py-1 px-2 */
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-fill-color-blank);
  cursor: text;
  transition: border-color 0.2s;
  overflow-x: auto;
  &:focus-within {
    border-color: var(--el-color-primary);
  }
}
</style>

<template>
  <div class="input-box" @click="focusInput">
    <ElTag
      v-for="(item, index) in headers"
      :key="index"
      type="info"
      size="small"
      :closable="!props.tipsContent && isClosable(item)"
      @close="removeHeader(index)"
      class="m-[2px] mr-1"
    >
      {{ item }}
      <ElTooltip class="box-item" effect="dark" :content="props.tipsContent" placement="top">
        <template v-if="props.tipsContent && isClosable(item)">
          <ElIcon class="group" @click.stop="removeTag(item)">
            <Close class="group-hover:hidden" />
            <CircleCloseFilled class="hidden group-hover:block" />
          </ElIcon>
        </template>
      </ElTooltip>
    </ElTag>

    <input
      ref="inputRef"
      v-model="inputValue"
      :maxlength="100"
      :placeholder="headers.length === 0 ? '请输入，回车分隔' : ''"
      @keydown.enter.prevent="handleEnter"
      class="flex-1 bg-transparent border-none outline-none text-[14px] min-w-[100px] py-1"
    />

    <div
      class="absolute bottom-[2px] right-2 text-xs pointer-events-none"
      :class="
        totalLength > props.limit ? 'text-red-500' : 'text-[var(--el-text-color-placeholder)]'
      "
    >
      <span v-if="props.limit && props.limit > 0"> {{ totalLength }}/{{ props.limit }} </span>
      <span v-else-if="props.max && props.max > 0">{{ headers.length }}</span>
    </div>
    <Icon
      icon="ep:close"
      class="absolute right-2 rounded-full border border-gray-400 bg-gray-300 cursor-pointer !text-[var(--el-text-color-secondary)]"
      @click.stop="clearAll"
      width="16"
      height="16"
      v-if="props.clearable && headers.length > 1"
    />
  </div>
</template>
