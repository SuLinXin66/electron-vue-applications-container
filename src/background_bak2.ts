'use strict';

import {app, protocol, BrowserWindow} from 'electron'
import {
  createProtocol,
} from 'vue-cli-plugin-electron-builder/lib'
import {mainWin} from "@/electron/windows/login"
import {systemDb, userLocalDb} from "@/electron/db"
import {loadAllEvent} from "@/electron/event"

const isDevelopment = process.env.NODE_ENV !== 'production';

let win: BrowserWindow | null;


// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: {secure: true, standard: true}}])
let loginWin: BrowserWindow | null;

async function createWindow() {
  let url = process.env.WEBPACK_DEV_SERVER_URL;
  if (!url) {
    createProtocol('app');
    url = "app://./index.html'";
  }
  // Create the browser window.
  loginWin = await mainWin(url);
  loginWin.show();

  loginWin.on('closed', () => {
    app.quit();
    loginWin = null
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', async () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    await createWindow()
  }
});

app.on('ready', async () => {
  await createWindow();
  const sysDb = await systemDb();
  const userDb = await userLocalDb();
  loadAllEvent({
    systemDbEventParams: {
      db: sysDb
    },
    userLocalDbEventParams: {
      db: userDb
    }
  })
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message' as any, (data: any) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM' as any, () => {
      app.quit()
    })
  }
}
