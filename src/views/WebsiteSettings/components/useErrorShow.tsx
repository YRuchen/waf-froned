import { ref, computed } from 'vue'

export function useErrorShow() {
  const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/
  const ipRegex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

  interface TableError {
    rowIndex: number
    field: string
    message: string
    priority: number
  }

  const tableErrors = ref<TableError[]>([])
  const firstError = computed(
    () => tableErrors.value.sort((a, b) => a.priority - b.priority)[0].message
  )

  const showErrorTip = (servers: any) => {
    const nonEmptyRegions = servers.filter((item) => item.address)
    const allDomains = nonEmptyRegions.every((item) => domainRegex.test(item.address))
    const allIps = nonEmptyRegions.every((item) => ipRegex.test(item.address))
    const addresses = servers.map((item) => item.address)
    const isAllDifferent = new Set(addresses).size === addresses.length
    const FIELD_RULES = {
      protol: [
        {
          priority: 1,
          validate: (v: string) => !!v,
          message: '请输入源站协议'
        }
      ],
      address: [
        {
          priority: 2,
          validate: (v: string) => !!v,
          message: '源站地址不能为空'
        },
        {
          priority: 2,
          validate: (v: string) => {
            return domainRegex.test(v) || ipRegex.test(v)
          },
          message: '源站地址格式不对，请输入正确的域名地址或IP地址'
        },
        {
          type: 'format',
          priority: 2,
          validate: () => {
            return allDomains || allIps
          },
          message: '源站地址不支持混合回源'
        },
        {
          priority: 2,
          validate: () => {
            return servers.length == 1 ? true : isAllDifferent
          },
          message: '后端服务器组重复'
        }
      ],
      port: [
        {
          priority: 3,
          validate: (v: string) => !!v,
          message: '源站端口不能为空'
        }
      ],
      weight: [
        {
          priority: 4,
          validate: (v: string) => !!v,
          message: '源站权重不能为空'
        }
      ]
    } as const

    const errors: TableError[] = []

    servers.forEach((row, rowIndex) => {
      Object.entries(FIELD_RULES).forEach(([field, rules]) => {
        const value = row[field]
        for (const rule of rules) {
          if (!rule.validate(value)) {
            errors.push({
              rowIndex,
              field,
              message: `第 ${rowIndex + 1} 行 ${rule.message}`,
              priority: rule.priority
            })
            break
          }
        }
      })
    })

    tableErrors.value = errors
    if (Object.keys(tableErrors.value).length) {
      return firstError.value
    } else {
      return ''
    }
  }
  return {
    showErrorTip
  }
}
