export interface CorazaParams {
  domainName: string  // 源站地址
  status?: STATUS  // 插件状态
  paranoiaLevel?: PARANOIA_LEVEL  // 检出等级
  action?: ACTION  // 防护动作
}

export enum STATUS {
  OFF = 'PLUGIN_STATUS_OFF',
  OPEN = 'PLUGIN_STATUS_ON'
}
export enum ACTION {
  OBSERVE = 'CORAZA_ACTION_OBSERVE',
  BLOCK = 'CORAZA_ACTION_BLOCK'
}
export enum PARANOIA_LEVEL {
  LOOSE = 'PARANOIA_LEVEL_LOOSE',
  NORMAL = 'PARANOIA_LEVEL_NORMAL',
  STRICT = 'PARANOIA_LEVEL_STRICT',
  VERY_STRICT = 'PARANOIA_LEVEL_VERY_STRICT'
}

export interface Shortcut {
  text: string
  value: () => [Date, Date]
}
export interface TimeList {
  text: string
  msOffset: number
}