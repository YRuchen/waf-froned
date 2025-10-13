<template>
  <RenderTree />
</template>

<script setup lang="tsx">
import { defineProps, type CSSProperties, defineComponent, h } from 'vue'

interface TreeItem {
  label: string | JSX.Element | (() => JSX.Element)
  border?: 'left' | 'bottom' | 'both'
}

// props
const props = defineProps<{
  items?: TreeItem[]
  boxWidth?: number
  boxHeight?: number
  overlap?: number
  labelGap?: number
}>()

const boxWidth = props.boxWidth ?? 20
const boxHeight = props.boxHeight ?? 30
const overlap = props.overlap ?? 10 // 默认重叠高度
const labelGap = props.labelGap ?? 10 // label 左侧间距（从 box 右侧开始）

// 默认 items
const defaultItems: TreeItem[] = [
  { label: '文字一', border: 'both' },
  { label: '文字二', border: 'both' },
  { label: '文字三', border: 'both' }
]
const items = props.items ?? defaultItems

const borderColor = '#ededed'

// box 样式（**不包含 top/left/position**，让它处在 normal flow）
const getBoxStyle = (index: number, border?: TreeItem['border']): CSSProperties => {
  const style: CSSProperties = {
    width: `${boxWidth}px`,
    height: `${boxHeight}px`,
    backgroundColor: 'transparent',
    borderTopLeftRadius: '0',
    borderTopRightRadius: '10px',
    borderBottomLeftRadius: '10px',
    borderBottomRightRadius: '0',
    boxSizing: 'border-box',
    display: 'inline-block', // 保证按宽度渲染
    verticalAlign: 'top'
  }

  if (border === 'left') style.borderLeft = `1px solid ${borderColor}`
  else if (border === 'bottom') style.borderBottom = `1px solid ${borderColor}`
  else {
    style.borderLeft = `1px solid ${borderColor}`
    style.borderBottom = `1px solid ${borderColor}`
  }

  return style
}

// label 样式（相对于 .tree-row 定位，垂直居中到 box 底部外侧）
const getLabelStyle = (): CSSProperties => ({
  position: 'absolute',
  left: `${boxWidth + labelGap}px`,
  top: '100%', // row 底部（也就是 box 的底部）
  transform: 'translateY(-50%)', // 垂直居中（使文字中线与 box 底边对齐）
  fontSize: '12px',
  whiteSpace: 'nowrap'
})

// Render 函数：每一行是 .tree-row，除第一个外，使用负 marginTop 实现重叠
const RenderTree = defineComponent(() => {
  return () => (
    <div class="tree-container">
      {items.map((item, index) => (
        <div
          class="tree-row"
          key={index}
          style={
            {
              position: 'relative',
              height: `${boxHeight}px`,
              marginTop: index === 0 ? '0px' : `-${overlap}px`
            } as CSSProperties
          }
        >
          <div class="tree-box" style={getBoxStyle(index, item.border)}></div>

          <span class="tree-label" style={getLabelStyle()}>
            {
              typeof item.label === 'function'
                ? item.label() // 调用渲染函数
                : typeof item.label === 'string'
                  ? item.label
                  : item.label // JSX.Element
            }
          </span>
        </div>
      ))}
    </div>
  )
})
</script>

<style scoped>
.tree-container {
  /* 父容器自动撑高（因为 row 在流内） */
}

.tree-row {
  /* 可加 align-items/flex 布局，根据需要微调 */
  /* 目前使用默认 block 布局，box 为 inline-block */
}

.tree-box {
  /* 不要 position:absolute（让它参与文档流） */
}

.tree-label {
  /* 由内联样式控制定位 */
}
</style>
