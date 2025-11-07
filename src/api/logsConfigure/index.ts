import request from '@/axios'
import { CorazaParams } from './types'
import qs from 'qs';
// 获取域名
export const getTableListApi = (params?: any) => {
  return request.get({
    url: `/apis/v1/domains?${qs.stringify(params, { arrayFormat: 'repeat' })}`
  })
}
// 获取详情
export const getCorazaApi = (params: CorazaParams) => {
  return request.get({ url: '/apis/v1/plugins/coraza', params })
}
// 更新漏洞
export const putCorazaApi = (data: CorazaParams) => {
  return request.put({ url: '/apis/v1/plugins/coraza', data })
}
// 获取漏洞设置详情
export const getCategoriesApi = (params: any) => {
  return request.get({ url: '/apis/v1/plugins/coraza/rules/categories', params })
}



// 获取tls协议
export const getTlsVersionsApi = () => {
  return request.get({ url: '/apis/v1/domains/options/tls_versions' })
}
// 获取tls套件
export const getTlstCiphersApi = () => {
  return request.get({ url: '/apis/v1/domains/options/tls_ciphers' })
}
// 获取证书
export const getCertsApi = (params: any) => {
  return request.get({ url: '/apis/v1/certs', params })
}
// 获取came
export const getCnamesApi = () => {
  return request.get({ url: '/apis/v1/cloud/products/waf/cnames' })
}
// 获取IP 地址
export const getEgressApi = () => {
  return request.get({ url: '/apis/v1/cloud/products/waf/egress' })
}
// 获取IP 地址
export const getCountApi = () => {
  return request.get({ url: '/apis/v1/domains/stat' })
}
// CNAME接入测试
export const cnamesTestApi = (data: any) => {
  return request.post({ url: '/apis/v1/domains/test', data })
}
// 回源测试列表
export const streamsTestListApi = (params: any) => {
  return request.get({ url: '/apis/v1/upstreams/testlist', params })
}
// 判断重名
export const existsApi = (params: any) => {
  return request.get({ url: '/apis/v1/domains/exists', params })
}
// 回源测试
export const upstreamsTestApi = (data: any) => {
  return request.post({ url: '/apis/v1/upstreams/test', data })
}
// 新建站点提交
export const saveDomainsApi = (data: any): Promise<IResponse> => {
  return request.post({ url: '/apis/v1/domains', data })
}
// 更新站点提交
export const updateDomainsApi = (data: any): Promise<IResponse> => {
  return request.patch({ url: '/apis/v1/domains/' + data.id, data })
}
// 更新列表的操作的接口
export const updateFieldsApi = (data: any): Promise<IResponse> => {
  return request.patch({ url: '/apis/v1/domains/fields', data })
}
// 删除列表的操作的接口
export const deleteFieldsApi = (id: any): Promise<IResponse> => {
  return request.delete({ url: '/apis/v1/domains/' + id })
}
