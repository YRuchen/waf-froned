export interface OriginItem {
  id: string
  label: string
  tableList: Array<TableItem>
  http: Array<string>
  https: Array<string>
}
export interface TableItem {
  name: string
  region: string
  count: string
  desc: string
}
