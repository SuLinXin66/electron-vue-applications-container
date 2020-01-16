import {BrowserWindow} from "electron";

let win: BrowserWindow | null = null;
export const mainWin: (url: string) => Promise<BrowserWindow> = (url) => {
  if (win == null) {
    win = new BrowserWindow({
      webPreferences: {
        nodeIntegration: true
      },
      width: 580,
      height: 380,
      alwaysOnTop: true,
      frame: false,
      show: false,
      resizable: false,
      transparent: false
    });
  }
  win.loadURL(url);
  return new Promise<BrowserWindow>((resolve, reject) => {
    win!.on("ready-to-show", () => {
      resolve(win as BrowserWindow)
    })
  })
};
