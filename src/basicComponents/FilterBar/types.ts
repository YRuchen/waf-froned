export type FilterType = 'input' | 'select'

export interface BaseFilterItem {
  type: FilterType
  label: string
  key: string
}

export interface InputFilterItem extends BaseFilterItem {
  type: 'input'
  props?: Record<string, any>
}

export interface SelectFilterItem extends BaseFilterItem {
  type: 'select'
  options: Array<{ label: string; value: string }>
  props?: Record<string, any>
}

export type FilterSchemaItem = InputFilterItem | SelectFilterItem
