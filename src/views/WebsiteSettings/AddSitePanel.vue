<script setup lang="tsx">
import { ref, onMounted, onUnmounted } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { ElAnchor, ElAnchorLink } from 'element-plus'
import siteForm from './components/SiteFormPanel.vue'

const containerRef = ref<HTMLElement | null>(null)
const bannerRef = ref<HTMLElement | null>(null)

const navTop = ref(0)
const sections = [
  { id: 'part1', title: '防护域名' },
  { id: 'part2', title: '基础配置' },
  { id: 'part3', title: '源站配置' },
  { id: 'part4', title: '代理配置' },
  { id: 'part5', title: '日志配置' },
  { id: 'part6', title: '网络参数配置' }
]
const handleClick = (e: MouseEvent) => {
  e.preventDefault()
}
const updateNavTop = () => {
  if (!bannerRef.value || !containerRef.value) return
  const bannerHeight = bannerRef.value.offsetHeight
  const scrollY = containerRef.value.scrollTop
  // 横幅消失后，导航贴顶
  navTop.value =
    bannerHeight - scrollY >= 0
      ? Math.max(bannerHeight - scrollY + bannerTop.value, 0)
      : bannerTop.value
}
const bannerTop = ref(0)
onMounted(() => {
  if (!bannerRef.value || !containerRef.value) return
  bannerTop.value = bannerRef.value?.getBoundingClientRect()?.top
  containerRef.value?.addEventListener('scroll', updateNavTop)
  updateNavTop()
})

onUnmounted(() => {
  containerRef.value?.removeEventListener('scroll', updateNavTop)
})
</script>
<template>
  <ContentWrap>
    <div class="add-wrap">
      <div ref="containerRef" class="add-container">
        <!-- 顶部横幅 -->
        <!-- <div ref="bannerRef" class="h-[300px] bg-gray-100 flex items-center justify-center text-xl">
          接入方式：CNAME
        </div> -->
        <div ref="bannerRef"> </div>
        <div class="flex relative">
          <!-- 左侧导航 -->
          <ElAnchor
            :container="containerRef"
            type="underline"
            class="!fixed !w-32"
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
      <!-- <div class="flex-1"> </div> -->
    </div>
  </ContentWrap>
</template>
<style lang="less" scoped>
.add-wrap {
  display: flex;
  height: calc(100vh - var(--top-heard-height) - var(--qiankun-title-header) - 1rem);
  // overflow: hidden;  // TODO
}
.add-container {
  height: 100%;
  overflow-y: auto;
  position: relative;
  width: 100%;
}
</style>
