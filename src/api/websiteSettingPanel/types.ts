export interface TableItem {
  address: string  // 源站地址
  port: string   //源站端口
  weight: string  // 权重
  protol: string   // 通信协议
}

export interface serverGroupItem {
  groupName: string
  servers: Array<TableItem>
  accessPorts: Array<string>
  protocol: string
}
export interface connSettingItem {
  connectTimeout: number  // 建连超时时间
  writeTimeout: number    // 写连接超时时间
  readTimeout: number     // 读连接超时时间
  retries: number         // 回源重试次数
  bodyMaxSize: number     // 请求 body 最大值
}
export interface RuleForm {
  hostname: string       // 防护名称
  publicServer: boolean   // 回源方式
  selectProtocol?: any   // http协议类型
  httpEnabled: boolean     // http协议类型
  httpsEnabled: boolean     // https协议类型
  certId: string     // 证书id
  sniEnabled: boolean     // 是否开启SNI
  loadBalancing: string     // 负载均衡
  httpPorts: string[]   // http端口
  httpsPorts: string[]   // https端口
  sslProtocols: string[]   // tls协议
  sslCiphers: string[]   // tls协议套件
  proxy: boolean    // 代理配置
  clientIpSource: string  // 自定义header
  customIpSourceHeaders: string   // 自定义头部
  logEnabled: boolean   // 日志采集
  logAllHeaders: boolean  // 全量header
  logExcludeHeaders: string[]  // 例外的header
  statHeaders: string[]  // 统计的header
  serverGroups: serverGroupItem[]  // 源站配置
  connSetting: connSettingItem
}
