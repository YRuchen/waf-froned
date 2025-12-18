<script setup lang="tsx">
import { ref, h } from 'vue'
import childTree from './ChildTree.vue'
import {
  ElTag,
  ElInput,
  ElCard,
  ElButton,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElIcon
} from 'element-plus'
const activeIndex = ref(2)
interface TreeItem {
  label: string
  border?: 'left' | 'bottom' | 'both'
}
const inputValue = ref('')
const steps = [
  {
    title: '访问管控',
    children: [
      { label: '禁止访问', value: '未设置' },
      { label: '允许访问', value: '未设置' },
      { label: '区域限制', value: '无权限', icon: 'ep:lock' }
    ],
    items: [
      {
        label: () => (
          <>
            <span style={{ marginRight: '5px' }}>标签前缀</span>
            <ElInput
              modelValue={inputValue.value}
              onUpdate:modelValue={(val: string) => (inputValue.value = val)}
              size="small"
            />
          </>
        ),
        border: 'both'
      },
      { label: '文字二', border: 'both' },
      { label: '文字三', border: 'both' }
    ]
  },
  {
    title: 'CC防护',
    children: [{ label: '自定义', value: '未设置' }]
  },
  {
    title: '漏洞防护',
    children: [{ label: '托管规则', value: '正常拦截' }]
  },
  {
    title: 'API防护',
    children: [{ label: 'AI自动发现', value: '关闭' }]
  },
  {
    title: 'Bot管理',
    children: [
      { label: '托管规则', value: '无权限', icon: 'ep:lock' },
      { label: '行为地图', value: '关闭' }
    ]
  },
  {
    title: '防敏感信息泄露',
    children: [{ label: '信息拦截', value: '无权限', icon: 'ep:lock' }]
  }
]
</script>

<style scoped>
.defense-strategy {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

/* ===== 主线容器 ===== */
.timeline {
  display: flex;
  position: relative;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

/* ===== 主线 ===== */
.timeline::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #e4e7ed;
  z-index: 0;
}

/* ===== 节点 ===== */
.timeline-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
  position: relative;
  z-index: 1;
}

.node {
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: #dcdfe6;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #e4e7ed;
  transition: all 0.3s;
}

.dot.active {
  background-color: #409eff;
  box-shadow: 0 0 0 2px #409eff33;
}

.title {
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
}

/* ===== 子项列表 ===== */
.children {
  margin-top: 8px;
  margin-left: 5px;
  /* border-left: 1px solid #ebeef5; */
  /* padding-left: 12px; */
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.child-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #606266;
}

.child-label {
  margin-right: 4px;
}

.child-value {
  color: #909399;
}

/* ===== 底部按钮 ===== */
.action-btns {
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>

<template>
  <div class="defense-strategy">
    <div class="timeline">
      <div v-for="(step, index) in steps" :key="index" class="timeline-item">
        <!-- 节点 -->
        <div class="node">
          <div class="dot" :class="{ active: activeIndex === index }"></div>
          <div class="title">{{ step.title }}</div>
        </div>

        <!-- 子项 -->
        <childTree class="children" :items="step.items"></childTree>
      </div>
    </div>
  </div>
</template>
