<script setup lang="ts">
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useAppStore } from '@/store/modules/app'
// import { Footer } from '@/components/Footer'
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Back } from '@element-plus/icons-vue'
import { ElPageHeader, ElBreadcrumbItem, ElBreadcrumb, ElIcon } from 'element-plus'

const { currentRoute, back } = useRouter()
const route = useRoute()
console.log(route, 888)

const appStore = useAppStore()

const footer = computed(() => appStore.getFooter)

const tagsViewStore = useTagsViewStore()

const getCaches = computed((): string[] => {
  return tagsViewStore.getCachedViews
})

// 面包屑
const breadcrumbs = computed(() => {
  return route.matched
    .filter((v) => v.meta?.title)
    .map((v, index, arr) => {
      return {
        title: v.meta?.title,
        path: index === arr.length - 1 ? '' : v.path
      }
    })
})
</script>

<template>
  <div
    class="font-size-5 m-[var(--app-content-padding)]"
    :class="currentRoute.meta?.showBack ? 'cursor-pointer' : ''"
  >
    <!-- <span class="flex items-center">
      <ElIcon><ArrowLeft /></ElIcon>
      <span class="ml-1">{{ currentRoute.meta?.title }}</span>
    </span> -->
    <ElPageHeader v-if="currentRoute.meta?.showBack" @back="back">
      <template #title>
        <span class="font-size-4"> 返回 </span>
      </template>
      <template #content>
        <ElBreadcrumb separator="/">
          <ElBreadcrumbItem v-for="item in breadcrumbs" :key="item.path" :to="item.path">
            <span class="font-size-5"> {{ item.title }}</span>
          </ElBreadcrumbItem>
        </ElBreadcrumb>
      </template>
    </ElPageHeader>
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
