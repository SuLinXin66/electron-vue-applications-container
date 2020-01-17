import {ipcRenderer} from "electron"

let webSocket;

export const initWebSocket: (url: string) => void = url => {
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

  webSocket = new WebSocket(url);

  webSocket.onopen = () => {
    if (initSocket) {
      initSocket = false;
      ipcRenderer.send('initWebsocketAfter', true);
      return
    }

  };

  webSocket.onerror = (e) => {
    console.log("发生了错误!");
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
    console.log(ev.data)
  };


};