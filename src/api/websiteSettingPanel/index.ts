import request from '@/axios'
import type { RuleForm } from './types'
// 获取列表
export const getTableListApi = (params: any) => {
  return request.get({ url: '/apis/v1/domains', params })
}
// 获取tls协议
export const getTlsVersionsApi = () => {
  return request.get({ url: '/apis/v1/domains/options/tls_versions' })
}
// 获取tls套件
export const getTlstCiphersApi = () => {
  return request.get({ url: '/apis/v1/domains/options/tls_ciphers' })
}

export const saveDomainsApi = (data: Partial<RuleForm>): Promise<IResponse> => {
  return request.post({ url: '/apis/v1/domains', data })
}
