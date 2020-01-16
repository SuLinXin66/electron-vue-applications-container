import Nedb from "nedb";
import {DbSystem, DbUserLocal} from "@/types";
import {dialog, BrowserWindow, app} from "electron"
import MessageBoxSyncOptions = Electron.MessageBoxSyncOptions;

const errOptions: MessageBoxSyncOptions = {
  message: "查询数据失败, 请尝试关闭应用重新打开，如长时间无法使用请联系管理员",
  title: "错误提醒",
  type: 'error',
  buttons: ["确定"],
  defaultId: 0
};

const handlerError: (err: any) => void = (err) => {
  const nowWin = BrowserWindow.getFocusedWindow();
  if (err) {
    if (nowWin) {
      dialog.showMessageBoxSync(nowWin, errOptions)
    } else {
      dialog.showMessageBoxSync(errOptions)
    }
    app.quit();
    return
  }
};

export const chatDb = new Nedb({
  filename: 'data/chat.db',
  autoload: true
});

export const userLocalDb: () => Promise<Nedb<DbUserLocal>> = () => {

  return new Promise<Nedb<DbUserLocal>>((resolve, reject) => {
    const db = new Nedb<DbUserLocal>({
      filename: "data/userLocal.db",
      autoload: true
    });
    db.findOne({key: 'autoload'}, (err, document) => {
      handlerError(err);
      if (!document) {
        db.insert({
          key: "autoload",
          val: true
        }, (err1, document1) => {
          handlerError(err1);
          resolve(db);
        });
        return
      }
      resolve(db);
    })
  })

};

export const systemDb: () => Promise<Nedb<DbSystem>> = () => {
  return new Promise<Nedb<DbSystem>>((resolve, reject) => {
    const db = new Nedb<DbSystem>({
      filename: 'data/system.db',
      autoload: true
    });
    db.findOne<DbSystem>({localType: "mainSystemUrl"}, (err, document) => {
      handlerError(err);
      if (!document) {
        db.insert({
          localType: "mainSystemUrl",
          desc: "总控系统URL",
          url: "http://192.168.100.20:8082"
        }, (err, doc) => {
          handlerError(err);
          resolve(db)
        })
      } else {
        resolve(db)
      }
    })
  })
};
