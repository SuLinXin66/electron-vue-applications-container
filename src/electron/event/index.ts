import {ipcMain} from "electron"
import {AllEventParams, SystemDbEventParams, UserLocalDbEventParams} from "@/electron/event/types";
import {DbParams, DbSystem, EventReturn, SystemEventNames, UserLocalEventNames} from "@/types";

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
  })
};

export const loadAllEvent: (allEventParams: AllEventParams) => void = (allEventParams) => {
  loadSystemDbEvent(allEventParams.systemDbEventParams);
  loadUserLocalDbEvent(allEventParams.userLocalDbEventParams);
};
