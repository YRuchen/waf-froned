<script setup lang="tsx">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElAnchor, ElAnchorLink } from 'element-plus'
import siteForm from './components/SiteFormPanel.vue'

const containerRef = ref<HTMLElement | null>(null)
const bannerRef = ref<HTMLElement | null>(null)
const anchorRef = ref<InstanceType<typeof ElAnchor> | null>(null)

const navTop = ref(0)
const sections = [
  { id: 'part1', title: '防护域名' },
  { id: 'part2', title: '基础配置' },
  { id: 'part3', title: '源站配置' },
  { id: 'part4', title: '代理配置' },
  { id: 'part5', title: '日志配置' },
  { id: 'part6', title: '网络参数配置', height: '10%' }
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
          :offset="300"
          class="w-30 mt-6"
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
        <siteForm :sections="sections"></siteForm>
      </div>
    </div>
    <div class="w-20%"> </div>
  </div>
</template>
