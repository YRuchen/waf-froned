export interface LogsParams {
  domain?: string  // 源站地址
  limit?: number  // 查询数量
  afterCursor?: string  // 从该游标之后取（向后翻页），下一页使用，不能与 before_cursor 同时设置
  beforeCursor?: string  // 从该游标之前取（向前翻页），上一页使用，不能与 after_cursor 同时设置
  path?: string  // 路径
  srcIp?: string  // 源IP
  statusCode?: Array<any>  // 状态码
  severity?: Array<any>  // 风险等级
  attack?: Array<any>  // 攻击类型
  startTsMs?: string  // 日志开始时间(13位毫秒时间戳)
  endTsMs?: string  // 日志结束时间(13位毫秒时间戳)
  requestId?: string  // 请求id
  sortBy?: string  // 排序字段
}

// 时间筛选
export interface Shortcut {
  text: string
  value: () => [Date, Date]
}
// 处理时间筛选需要的参数
export interface TimeList {
  text: string      // 文字：近7天……
  msOffset?: number  // 时间
  startOf?: 'day' | 'week' | 'month'
  offset?: number
}

export enum SORTBY {
  ASC = 'LOG_SORT_BY_TIME_ASC',
  DESC = 'LOG_SORT_BY_TIME_DESC'
}