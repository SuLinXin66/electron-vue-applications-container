import NativeImage = Electron.NativeImage;

export interface TrayIconType {
  onlineIcons: IconSizeType
  offlineIcons: IconSizeType
  chatIcon: IconSizeType
  logoutIcon: IconSizeType
}

export interface IconSizeType {
  icon16: IconImage
  icon24: IconImage
  icon32: IconImage
  icon48: IconImage
  icon64: IconImage
  icon72: IconImage
  icon96: IconImage
  icon128: IconImage
}

export interface IconImage {
  img: NativeImage
  base64Str: string
}