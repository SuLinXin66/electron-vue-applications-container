export interface ComponentVo {
  id: number
  name: string
  title: string
  Urls: Array<ComponentUrl>
}

export interface ComponentUrl {
  id: number
  componentId: number
  url: string
}