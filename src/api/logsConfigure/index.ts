import request from '@/axios'
import { LogsParams } from './types'
import qs from 'qs';
// 获取域名
export const getTableListApi = (params?: any) => {
  return request.get({
    url: `/apis/v1/domains?${qs.stringify(params, { arrayFormat: 'repeat' })}`
  })
}
// 获取详情
export const getLogsApi = (params?: LogsParams) => {
  return request.get({ url: '/apis/v1/logs', params })
}
