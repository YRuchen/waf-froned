<script setup lang="tsx">
import { ref, onMounted, onUnmounted } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { ElAnchor, ElAnchorLink } from 'element-plus'
import siteForm from './components/SiteFormPanel.vue'
import { useRouter } from 'vue-router'

const { currentRoute, push } = useRouter()
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
  { id: 'part6', title: '网络参数配置', height: '50%' }
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
    <div class="font-size-4 cursor-pointer h-[45px]" @click="() => push('/websiteSettings/index')">
      <Icon icon="ep:arrow-left" class="align-middle mr-1 font-size-5" />
      <span>{{ currentRoute.meta?.title }}</span>
    </div>
    <div class="flex h-80%">
      <div ref="containerRef" class="h-screen overflow-y-auto relative w-85%">
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
            type="underline"
            class="!fixed !ml-20 !w-32"
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
      <div class="flex-1"> </div>
    </div>
  </ContentWrap>
</template>
