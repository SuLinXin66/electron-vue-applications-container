const isHaveElectron = typeof (window as any).require != "undefined";

export default {
  install: (Vue: any, options: any) => {
    Vue.prototype.isHaveElectron = isHaveElectron;
    if (isHaveElectron) {
      const electron = (window as any).require("electron");
      Vue.prototype.electronRemote = electron.remote;
      Vue.prototype.electronIpcRenderer = electron.ipcRenderer;
    }
  }
}
