/**
 * 用户信息.
 */
export interface UserInfo {
    deviceId: string
    roleId: string
    pwd: string
    orgId: string
    md5Str: string
}

/**
 * 用户菜单数据
 */
export interface UserMenuData {
    path: string
    title: string
    iconType: string
    name?: string
    icon?: string
    children?: Array<UserMenuData>
}

/**
 * 用户菜单
 */
export interface UserMenus {
    menus: Array<UserMenuData>
}

/**
 * 同步组件
 */
export interface AsyncComponents {
    path: string | Array<String>
    component: (location: any, callback: any) => void
}

/**
 * 同步组件Map
 */
export interface AsyncComponentsMap {
    [key: string]: AsyncComponents
}

type Method = "get" | "GET" | "post" | "POST";

type SendDataType = "json" | "JSON" | "form" | "FORM" | "file" | "FILE"

export interface AjaxRequest {
    method: Method
    url: string
    data?: object
    sendDataType?: SendDataType
    file?: HTMLInputElement
}