import {DbSystem, EventReturn, RemoteEventNames, UserInfo} from "@/types";
import {BrowserWindow, ipcMain, dialog} from "electron"
import Nedb from "nedb";
import {loadTray} from "@/electron/trays";

let mainWindow: BrowserWindow;

export const startApp: (err: Error | undefined, user: UserInfo, loginWin: BrowserWindow, systemUrlDb: Nedb<DbSystem>) => void = async (err, user, loginWin, systemUrlDb) => {
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

  ipcMain.once('initWebsocketAfter', async (event, args) => {
    if (args) {
      const isLoadOk = await loadTray(user, loginWin, systemUrlDb);
      if (isLoadOk) {
        loginWin.close();
        loginWin = null as any;
      }

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

  try {
    const params = "?main";
    if (process.env.WEBPACK_DEV_SERVER_URL) {
      await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL + params)
    } else {
      await mainWindow.loadURL('app://./index.html' + params)
    }
  } catch (e) {
    dialog.showMessageBoxSync({
      message: "初始化应用主体失败, 应用将强制性退出, 请您稍后重新尝试, 如长时间如此, 请联系管理员!",
      title: "错误提醒",
      type: 'error',
      buttons: ["确定"],
      defaultId: 0
    })
  }


  // mainWindow.on("ready-to-show", () => {
  //   // mainWindow.webContents.openDevTools();
  // })
};
