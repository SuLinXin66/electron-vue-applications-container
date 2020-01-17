import Vue from 'vue'
import App from './App.vue'
import router from './router'
import 'view-design/dist/styles/iview.css'
import './assets/fonts/apps/iconfont.css'
import ElectronMatch from "@/electron/index"
import {initWebSocket} from "@/websocket";
import {ipcRenderer} from "electron"

declare global {

  interface window {
    require: (str: string) => any,
  }
}


import Remote = Electron.Remote;
import IpcRenderer = Electron.IpcRenderer;

declare module "vue/types/vue" {
  interface Vue {
    // messageRegistry: (key: string, messageObserve: MessageObserves) => void;
    isHaveElectron: boolean,
    electronRemote: Remote,
    electronIpcRenderer: IpcRenderer
  }
}

if (location.search.length == 0) {
  if (!(window as any).require) {
    alert("本工程不支持在浏览器中使用！");
  } else {
    Vue.use(ElectronMatch);

    Vue.config.productionTip = false;

    new Vue({
      router,
      render: h => h(App),
    }).$mount('#app');
  }
} else {
  document.head.remove();
  document.body.innerHTML = "";
  ipcRenderer.on('initWebSocket', (event, args: string) => {
    if (!args || args.trim().length == 0) {
      event.returnValue = false;
      return
    }
    console.log("initWebSocket");
    args = args.trim();
    initWebSocket(args);
  });
  ipcRenderer.send("websocketViewLoadOk")
}


