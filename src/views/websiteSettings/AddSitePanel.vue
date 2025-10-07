<script setup lang="tsx">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElAnchor, ElAnchorLink } from 'element-plus'
import siteForm from './components/SiteFormPanel.vue'

const containerRef = ref<HTMLElement | null>(null)
const bannerRef = ref<HTMLElement | null>(null)
const anchorRef = ref<InstanceType<typeof ElAnchor> | null>(null)

const navTop = ref(0)
const sections = [
  { id: 'part1', title: 'part1', height: '300px', bg: 'rgba(255, 0, 0, 0.02)' },
  { id: 'part2', title: 'part2', height: '300px', bg: 'rgba(0, 255, 0, 0.02)' },
  { id: 'part3', title: 'part3', height: '300px', bg: 'rgba(0, 0, 255, 0.02)' },
  {
    id: 'part4',
    title: 'part4',
    height: '100%',
    bg: 'rgba(0, 0, 255, 0.02)',
    content: 'part5555555555555'
  }
]
const handleClick = (e: MouseEvent) => {
  e.preventDefault()
}
const updateNavTop = () => {
  if (!bannerRef.value || !containerRef.value) return
  const bannerHeight = bannerRef.value.offsetHeight
  const scrollY = containerRef.value.scrollTop
  // 横幅消失后，导航贴顶
  navTop.value = Math.max(bannerHeight - scrollY, 0)
}

onMounted(() => {
  containerRef.value?.addEventListener('scroll', updateNavTop)
  updateNavTop()
})

onUnmounted(() => {
  containerRef.value?.removeEventListener('scroll', updateNavTop)
})
</script>
<template>
  <div class="flex">
    <div ref="containerRef" class="h-screen overflow-y-auto relative flex-1">
      <!-- 顶部横幅 -->
      <div ref="bannerRef" class="h-[300px] bg-gray-100 flex items-center justify-center text-xl">
        顶部横幅
      </div>

      <div class="flex relative">
        <!-- 左侧导航 -->
        <ElAnchor
          ref="anchorRef"
          :container="containerRef"
          :offset="0"
          class="w-48 mt-6"
          type="underline"
          style="position: fixed; z-index: 10"
          :style="{ top: `${navTop}px` }"
          @click="handleClick"
        >
          <ElAnchorLink
            v-for="section in sections"
            :key="section.id"
            :href="`#${section.id}`"
            :title="section.title"
          />
        </ElAnchor>

        <!-- 右侧内容 -->
        <siteForm></siteForm>
      </div>
    </div>
    <div class="w-20%"> </div>
  </div>
</template>
