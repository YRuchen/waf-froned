<script setup lang="ts">
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useAppStore } from '@/store/modules/app'
// import { Footer } from '@/components/Footer'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElIcon } from 'element-plus'

const { currentRoute, back } = useRouter()
const appStore = useAppStore()

const footer = computed(() => appStore.getFooter)

const tagsViewStore = useTagsViewStore()

const getCaches = computed((): string[] => {
  return tagsViewStore.getCachedViews
})
</script>

<template>
  <div
    class="font-size-5 m-[var(--app-content-padding)]"
    @click="back"
    :class="currentRoute.meta?.showBack ? 'cursor-pointer' : ''"
  >
    <span v-if="currentRoute.meta?.showBack" class="flex items-center">
      <ElIcon><ArrowLeft /></ElIcon>
      <span class="ml-1">{{ currentRoute.meta?.title }}</span>
    </span>
    <span v-else class="bold">
      {{ currentRoute.meta?.title }}
    </span>
  </div>
  <section
    :class="[
      'box-border px-[var(--app-content-padding)] w-full bg-[var(--app-content-bg-color)] dark:bg-[var(--el-bg-color)]',
      {
        '!min-h-[calc(100vh-var(--top-tool-height)-var(--tags-view-height)-var(--app-footer-height))] pb-0':
          footer
      }
    ]"
  >
    <router-view>
      <template #default="{ Component, route }">
        <keep-alive :include="getCaches">
          <component :is="Component" :key="route.fullPath" />
        </keep-alive>
      </template>
    </router-view>
  </section>
  <!-- <Footer v-if="footer" /> -->
</template>
