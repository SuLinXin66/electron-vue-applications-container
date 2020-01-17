import {ipcMain} from "electron"
import {Base64} from "js-base64"
import {AllEventParams, SystemDbEventParams, UserLocalDbEventParams} from "@/electron/event/types";
import {
  DbParams,
  DbSystem,
  EventReturn,
  SystemEventNames,
  UserInfo,
  UserLocalEventNames
} from "@/types";

const createError: (err: Error) => EventReturn<void> = err => ({
  error: true,
  msg: err.message,
  err,
});

const createSuccess: (result?: any, numberOfUpdated?: number, upsert?: boolean) => EventReturn<any> = (result, numberOfUpdated, upsert) => ({
  error: false,
  result,
  numberOfUpdated,
  upsert
});

export const loadSystemDbEvent: (systemDbEvent: SystemDbEventParams) => void = systemDbEvent => {

  ipcMain.on(SystemEventNames.find, (event, args) => {
    systemDbEvent.db.find(args, (err, doc) => {
      if (err) {
        event.returnValue = createError(err);
        return
      }

      event.returnValue = createSuccess(doc)
    })
  });

  ipcMain.on(SystemEventNames.findOne, (event, args) => {
    systemDbEvent.db.findOne(args, (err, doc) => {
      if (err) {
        event.returnValue = createError(err);
        return
      }

      event.returnValue = createSuccess(doc)
    })
  });

  ipcMain.on(SystemEventNames.update, (event, args: DbParams) => {
    systemDbEvent.db.update(args.query, args.paramQuery, args.query, (err, numberOfUpdated, upsert) => {
      if (err) {
        event.returnValue = createError(err);
        return
      }
      event.returnValue = createSuccess(undefined, numberOfUpdated, upsert);
    })
  });

  ipcMain.on(SystemEventNames.saveComponent, (event, args: DbSystem) => {
    systemDbEvent.db.update({localType: args.localType} as DbSystem, {
      localType: args.localType,
      url: args.url,
      desc: args.desc
    } as DbSystem, {upsert: true}, (err, numberOfUpdated, upsert) => {
      if (err) {
        event.returnValue = createError(err);
        return
      }
      event.returnValue = createSuccess(undefined, numberOfUpdated, upsert);
    });
    // systemDbEvent.db.findOne<DbSystem>({url: args.url}, (err, documents) => {
    //   if (err) {
    //     event.returnValue = createError(err);
    //     return
    //   }
    //
    //   if (!documents || documents.localType != args.localType) {
    //     systemDbEvent.db.insert({
    //       localType: args.localType,
    //       url: args.url,
    //       desc: args.desc
    //     }, (err1, document) => {
    //       if (err1) {
    //         event.returnValue = createError(err);
    //         return
    //       }
    //       event.returnValue = createSuccess(document)
    //     });
    //     return;
    //   }
    //   event.returnValue = createSuccess("is Have")
    // })
  })
};

export const loadUserLocalDbEvent: (userLocalDbEvent: UserLocalDbEventParams) => void = userLocalDbEvent => {
  ipcMain.on(UserLocalEventNames.findOne, (event, args) => {
    userLocalDbEvent.db.findOne(args, (err, document) => {
      if (err) {
        event.returnValue = createError(err);
        return
      }
      event.returnValue = createSuccess(document);
    })
  });

  ipcMain.on(UserLocalEventNames.update, (event, args: DbParams) => {
    userLocalDbEvent.db.update(args.query, args.paramQuery, args.options, (err, numberOfUpdated, upsert) => {
      if (err) {
        event.returnValue = createError(err);
        return
      }
      event.returnValue = createSuccess(undefined, numberOfUpdated, upsert);
    })
  });

  ipcMain.on(UserLocalEventNames.loginOk, (event, args: UserInfo) => {
    const val = Base64.encode(JSON.stringify(args));
    userLocalDbEvent.db.update({key: "userInfo"}, {
      key: "userInfo",
      val
    }, {upsert: true}, async (err, numberOfUpdated, upsert) => {
      if (err) {
        await userLocalDbEvent.startLoadApp(err, undefined as any);
        return
      }

      await userLocalDbEvent.startLoadApp(undefined, args);
    })
  })
};

export const loadAllEvent: (allEventParams: AllEventParams) => void = (allEventParams) => {
  loadSystemDbEvent(allEventParams.systemDbEventParams);
  loadUserLocalDbEvent(allEventParams.userLocalDbEventParams);
};
