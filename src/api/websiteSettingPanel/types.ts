export interface TableItem {
  address: string  // 源站地址
  port: string   //源站端口
  weight: string  // 权重
  protol: string   // 通信协议
}

/**源站配置字段 */
export interface serverGroupItem {
  groupName: string
  servers: Array<TableItem>
  accessPorts: Array<string>
  protocol: string
}

/**连接配置 */
export interface connSettingItem {
  connectTimeout: number  // 建连超时时间
  writeTimeout: number    // 写连接超时时间
  readTimeout: number     // 读连接超时时间
  retries: number         // 回源重试次数
  bodyMaxSize: number     // 请求 body 最大值
}
/**新建站点表单 */
export interface RuleForm {
  hostname: string       // 防护名称
  publicServer: boolean   // 回源方式
  selectProtocol?: any   // http协议类型
  httpEnabled: boolean     // http协议类型
  httpsEnabled: boolean     // https协议类型
  certId: string     // 证书id
  sniEnabled: boolean     // 是否开启SNI
  snis: string[]    // SNI
  loadBalancing: string     // 负载均衡
  httpPorts: string[]   // http端口
  httpsPorts: string[]   // https端口
  sslProtocols: string[]   // tls协议
  sslCiphers: string[]   // tls协议套件
  proxy: boolean    // 代理配置
  clientIpSource: string  // 自定义header
  customIpSourceHeaders: string[]   // 自定义头部
  logEnabled: boolean   // 日志采集
  logAllHeaders: boolean  // 全量header
  logExcludeHeaders: string[]  // 例外的header
  statHeaders: string[]  // 统计的header
  serverGroups: serverGroupItem[]  // 源站配置
  connSetting: connSettingItem
}
/**负载均衡字典值 */
export enum LoadBalancingType {
  ROUND_ROBIN = 'ROUND_ROBIN',
  LEAST_CONNECTIONS = 'LEAST_CONNECTIONS',
  CONSISTENT_HASHING = 'CONSISTENT_HASHING',
}
/**负载均衡 */
export const LoadBalancingList = [
  { key: LoadBalancingType.ROUND_ROBIN, label: '加权轮询(WRR)' },
  { key: LoadBalancingType.LEAST_CONNECTIONS, label: '加权最小连接数(WLC)' },
  { key: LoadBalancingType.CONSISTENT_HASHING, label: '源地址哈希(SH)' },
]

/**防护模式 */
export interface ProtectStatusRuleForm {
  protectStatus: boolean
  domainId: string
}

/**日志配置 */
export interface LogsConfigureForm {
  logAllHeaders: boolean
  logExcludeHeaders: Array<string>
  statHeaders: Array<string>
}


/**http端口可选范围 */

export const HTTP_PORTS = [
  '80', '81', '82', '83', '84', '86', '87', '88', '89', '97',
  '800', '808', '1000', '1090', '3333', '3501', '3601',
  '5000', '5222', '6001', '6666',
  '7000', '7001', '7002', '7003', '7004', '7005', '7006',
  '7009', '7010', '7011', '7012', '7013', '7014', '7015',
  '7016', '7018', '7019', '7020', '7021', '7022', '7023',
  '7024', '7025', '7026',
  '7070', '7081', '7082', '7083', '7088', '7097',
  '7510', '7777', '7800',
  '8000', '8001', '8002', '8003', '8008', '8009',
  '8020', '8021', '8022', '8025', '8026',
  '8077', '8078',
  '8080', '8081', '8082', '8083', '8084', '8085', '8086', '8087', '8088', '8089',
  '8090', '8091',
  '8106',
  '8181',
  '8334', '8336',
  '8686',
  '8800',
  '8888', '8889',
  '8999',
  '9000', '9001', '9002', '9003',
  '9021', '9023', '9027',
  '9037',
  '9080', '9081', '9082',
  '9180',
  '9200', '9201', '9205', '9207', '9208', '9209',
  '9210', '9211', '9212', '9213',
  '9898', '9908', '9916', '9918', '9919', '9928', '9929', '9939',
  '9999',
  '10000', '10001', '10080',
  '12601',
  '28080',
  '33702',
  '48800'
] as const;

export type HTTPRange = typeof HTTP_PORTS[number];

export const HTTPS_PORTS = [
  '443', '4443', '5443', '6443', '7443',
  '8443', '8553', '8663', '9443', '9553',
  '9663', '18980'
] as const;

export type HTTPSRange = typeof HTTPS_PORTS[number];


