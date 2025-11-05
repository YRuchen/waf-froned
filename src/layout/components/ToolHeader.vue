<script lang="tsx">
import { defineComponent, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Collapse } from '@/components/Collapse'
import { LocaleDropdown } from '@/components/LocaleDropdown'
import { SizeDropdown } from '@/components/SizeDropdown'
import { UserInfo } from '@/components/UserInfo'
import { Screenfull } from '@/components/Screenfull'
import { Breadcrumb } from '@/components/Breadcrumb'
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'
import { Icon } from '@iconify/vue'

const { getPrefixCls, variables } = useDesign()

const prefixCls = getPrefixCls('tool-header')

const appStore = useAppStore()

// 面包屑
const breadcrumb = computed(() => appStore.getBreadcrumb)

// 折叠图标
const hamburger = computed(() => appStore.getHamburger)

// 全屏图标
const screenfull = computed(() => appStore.getScreenfull)

// 尺寸图标
const size = computed(() => appStore.getSize)

// 布局
const layout = computed(() => appStore.getLayout)

// 多语言图标
const locale = computed(() => appStore.getLocale)

export default defineComponent({
  name: 'ToolHeader',
  setup() {
    const { currentRoute } = useRouter()
    const router = useRouter()
    return () => (
      <div
        id={`${variables.namespace}-tool-header`}
        class={[
          prefixCls,
          'h-[var(--top-tool-height)] relative px-[var(--top-tool-p-x)] flex items-center justify-between'
        ]}
      >
        {layout.value !== 'top' ? (
          <div class="h-full flex items-center ml-2">
            {hamburger.value && layout.value !== 'cutMenu' ? (
              <Collapse class="custom-hover" color="var(--top-header-text-color)"></Collapse>
            ) : undefined}
            {breadcrumb.value ? <Breadcrumb class="<md:hidden"></Breadcrumb> : undefined}
            {/* TODO：写的符合业务的面包屑，但是感觉不需要，所以注释掉了，但是先保留一下 */}
            {/* {breadcrumb.value ? (
              <p
                class={['font-size-4', { 'cursor-pointer': currentRoute.value?.meta?.hiddenMenu }]}
                onClick={() => currentRoute.value?.meta?.hiddenMenu && router.back()}
              >
                {currentRoute.value?.meta?.hiddenMenu && (
                  <Icon icon="ep:arrow-left" class="align-middle mr-1 ml-2 font-size-5" />
                )}
                <span>{currentRoute.value?.meta?.title}</span>
              </p>
            ) : undefined} */}
          </div>
        ) : undefined}
        <div class="h-full flex items-center">
          {screenfull.value ? (
            <Screenfull class="custom-hover" color="var(--top-header-text-color)"></Screenfull>
          ) : undefined}
          {size.value ? (
            <SizeDropdown class="custom-hover" color="var(--top-header-text-color)"></SizeDropdown>
          ) : undefined}
          {locale.value ? (
            <LocaleDropdown
              class="custom-hover"
              color="var(--top-header-text-color)"
            ></LocaleDropdown>
          ) : undefined}
          {/* <UserInfo></UserInfo> */}
        </div>
      </div>
    )
  }
})
</script>

<style lang="less" scoped>
@prefix-cls: ~'@{adminNamespace}-tool-header';

.@{prefix-cls} {
  transition: left var(--transition-time-02);
}
</style>
