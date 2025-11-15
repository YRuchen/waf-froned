import { AxiosResponse, InternalAxiosRequestConfig } from './types'
import { ElMessage } from 'element-plus'
import qs from 'qs'
import { SUCCESS_CODE, TRANSFORM_REQUEST_DATA } from '@/constants'
import { useUserStoreWithOut } from '@/store/modules/user'
import { objToFormData } from '@/utils'
import { AxiosError } from 'axios'

const defaultRequestInterceptors = (config: InternalAxiosRequestConfig) => {
  if (
    config.method === 'post' &&
    config.headers['Content-Type'] === 'application/x-www-form-urlencoded'
  ) {
    config.data = qs.stringify(config.data)
  } else if (
    TRANSFORM_REQUEST_DATA &&
    config.method === 'post' &&
    config.headers['Content-Type'] === 'multipart/form-data' &&
    !(config.data instanceof FormData)
  ) {
    config.data = objToFormData(config.data)
  }
  if (config.method === 'get' && config.params) {
    let url = config.url as string
    url += '?'
    const keys = Object.keys(config.params)
    for (const key of keys) {
      if (config.params[key] !== void 0 && config.params[key] !== null) {
        url += `${key}=${encodeURIComponent(config.params[key])}&`
      }
    }
    url = url.substring(0, url.length - 1)
    config.params = {}
    config.url = url
  }
  return config
}

const defaultResponseInterceptors = (response: AxiosResponse) => {
  if (response?.config?.responseType === 'blob') {
    // 如果是文件流，直接过
    return response
  } else if (response.data.code === SUCCESS_CODE) {
    return response.data
  }
  ElMessage.error(response?.data?.message)
  if (response?.data?.code === 401 || response?.data?.code === 403) {
    const userStore = useUserStoreWithOut()
    userStore.resetApp?.()
  }
}
const defaultErrorInterceptors = (error: AxiosError) => {
  if (error.response) {
    const { data, status } = error.response as any
    const message = data?.message || data?.msg || `请求错误 (${status})`
    ElMessage.error(message)
    if (status === 401 || status === 403) {
      const userStore = useUserStoreWithOut()
      userStore.resetApp?.()
    }
  } else {
    // 说明根本没到服务器
    ElMessage.error('网络异常或服务器未响应')
  }

  return Promise.reject(error)
}

export { defaultResponseInterceptors, defaultRequestInterceptors, defaultErrorInterceptors }
