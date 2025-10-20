import request from '@/axios'
// 获取列表
export const getTableListApi = (params: any) => {
  return request.get({ url: '/apis/v1/domains', params })
}
// 获取详情
export const getDetailApi = (id: any) => {
  return request.get({ url: '/apis/v1/domains/' + id })
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
// 回源测试
export const upstreamsTestApi = (params: any) => {
  return request.post({ url: '/apis/v1/upstreams/test', params })
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
