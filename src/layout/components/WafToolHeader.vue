<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { ElPageHeader, ElBreadcrumbItem, ElBreadcrumb, ElIcon } from 'element-plus'
import { computed } from 'vue'

const { currentRoute, back } = useRouter()
const route = useRoute()

const props = defineProps({
  showHeader: {
    type: Boolean,
    default: false
  }
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
    v-if="props.showHeader || !currentRoute.meta?.hiddenHeader"
    class="font-size-5 font-bold m-[var(--app-content-padding)]"
    :class="currentRoute.meta?.showBack ? 'cursor-pointer' : ''"
  >
    <!-- <span class="flex items-center">
      <ElIcon><ArrowLeft /></ElIcon>
      <span class="ml-1">{{ currentRoute.meta?.title }}</span>
    </span> -->
    <ElPageHeader v-if="currentRoute.meta?.showBack" @back="back">
      <template #title>
        <span class="text-lg"> 返回 </span>
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
</template>
