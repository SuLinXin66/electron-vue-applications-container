import {ipcRenderer} from "electron"
import {UserInfo} from "@/types";

let webSocket;

const tryErrCallBack: (func: Function)=>void = (func)=>{
  try {
    func()
  } catch (e) {
    ipcRenderer.send('initWebsocketAfter', false);
  }
};

export const initWebSocket: (arg: string) => void = arg => {
  const args = arg.split("|||");
  let url = args[0];
  let userInfo: UserInfo = args[1] as any;
  try {
    userInfo = JSON.parse(userInfo as any);
    let initSocket = true;
    if (url.startsWith("http://")) {
      url = "ws://" + url.substring("http://".length)
    } else if (url.startsWith("https://")) {
      url = "ws://" + url.substring("https://".length)
    } else if (!url.startsWith("ws://")) {
      url = "ws://" + url;
    }

    if (url.endsWith("/")) {
      url += "ws"
    } else {
      url += "/ws"
    }

    url += `?idCode=` + userInfo.idCode;

    webSocket = new WebSocket(url);

    webSocket.onopen = () => {
      // if (initSocket) {
      //   initSocket = false;
      //   ipcRenderer.send('initWebsocketAfter', true);
      //   return
      // }
    };

    webSocket.onerror = (e) => {
      if (initSocket) {
        initSocket = false;
        ipcRenderer.send('initWebsocketAfter', false);
        return
      }
    };

    webSocket.onclose = () => {
      console.log("websocket已经关闭！");
    };

    webSocket.onmessage = ev => {
      const dataStr = ev.data;
      if (initSocket) {
        const jsonData = JSON.parse(dataStr);
        ipcRenderer.send('initWebsocketAfter', !jsonData.error);
      }
      console.log(ev);
      ipcRenderer.send(ev.data);
    };
  } catch (e) {
    ipcRenderer.send('initWebsocketAfter', false);
    return true
  }
};
