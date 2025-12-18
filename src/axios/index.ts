import service from './service'
import { CONTENT_TYPE } from '@/constants'
import { useUserStoreWithOut } from '@/store/modules/user'
import qs from 'qs'
const request = (option: AxiosConfig) => {
  const { url, method, params, data, headers, responseType } = option
  const userStore = useUserStoreWithOut()

  if (method?.toLowerCase() === 'get') {
    // GET 请求把 params 拼到 URL
    const serializedParams = params ? qs.stringify(params, { arrayFormat: 'repeat' }) : ''
    return service.request({
      url: url + (serializedParams ? `?${serializedParams}` : ''),
      method,
      responseType,
      headers: {
        'Content-Type': CONTENT_TYPE,
        [userStore.getTokenKey ?? 'Authorization']:
          userStore.getToken || `Bearer ${localStorage.getItem('auth_token')}`,
        ...headers
      }
    })
  } else {
    // POST/PUT/DELETE 等请求放到 data
    return service.request({
      url,
      method,
      data: params || data,
      responseType,
      headers: {
        'Content-Type': CONTENT_TYPE,
        [userStore.getTokenKey ?? 'Authorization']:
          userStore.getToken || `Bearer ${localStorage.getItem('auth_token')}`,
        ...headers
      }
    })
  }
}

export default {
  get: <T = any>(option: AxiosConfig) => {
    return request({ method: 'get', ...option }) as Promise<IResponse<T>>
  },
  post: <T = any>(option: AxiosConfig) => {
    return request({ method: 'post', ...option }) as Promise<IResponse<T>>
  },
  delete: <T = any>(option: AxiosConfig) => {
    return request({ method: 'delete', ...option }) as Promise<IResponse<T>>
  },
  put: <T = any>(option: AxiosConfig) => {
    return request({ method: 'put', ...option }) as Promise<IResponse<T>>
  },
  patch: <T = any>(option: AxiosConfig) => {
    return request({ method: 'patch', ...option }) as Promise<IResponse<T>>
  },
  cancelRequest: (url: string | string[]) => {
    return service.cancelRequest(url)
  },
  cancelAllRequest: () => {
    return service.cancelAllRequest()
  }
}
