import {DbSystem, EventReturn, RemoteEventNames, UserInfo} from "@/types";
import {BrowserWindow, ipcMain} from "electron"
import Nedb from "nedb";

let mainWindow: BrowserWindow;

export const startApp: (err: Error | undefined, user: UserInfo, loginWin: BrowserWindow, systemUrlDb: Nedb<DbSystem>) => void = (err, user, loginWin, systemUrlDb) => {
  if (err) {
    loginWin.webContents.send(RemoteEventNames.loginLoading, {
      error: true,
      err
    } as EventReturn<void>);
    return
  }

  ipcMain.once('websocketViewLoadOk', () => {
    systemUrlDb.findOne<DbSystem>({localType: "socketUrl"} as DbSystem, (err, document) => {
      if (err) {
        loginWin.webContents.send(RemoteEventNames.loginLoading, {
          error: true,
          err
        } as EventReturn<void>);
        return
      }
      loginWin.webContents.send(RemoteEventNames.loginLoading, {
        error: false,
        result: "初始化消息总线..."
      } as EventReturn<string>);
      mainWindow.webContents.send("initWebSocket", document.url);
    });
  });

  ipcMain.once('initWebsocketAfter', (event, args) => {
    if (args) {
      loginWin.close();
      loginWin = null as any;
      return
    }

    mainWindow.close();
    mainWindow = null as any;
    loginWin.webContents.send(RemoteEventNames.loginLoading, {
      error: true,
      err: {
        message: "初始化消息服务总线失败"
      }
    } as EventReturn<void>);

  });

  loginWin.webContents.send(RemoteEventNames.loginLoading, {
    error: false,
    result: "创建消息总线..."
  } as EventReturn<string>);

  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    width: 0,
    height: 0,
    frame: false,
    transparent: false,
    show: false
  });

  const params = "?main";
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL + params)
  } else {
    mainWindow.loadURL('app://./index.html' + params)
  }

  mainWindow.on("ready-to-show", () => {
    mainWindow.webContents.openDevTools();
  })
};