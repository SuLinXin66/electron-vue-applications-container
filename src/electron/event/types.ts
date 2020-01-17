import Nedb from "nedb";
import {DbSystem, DbUserLocal, EventReturn, UserInfo} from "@/types";

export interface SystemDbEventParams {
  db: Nedb<DbSystem>
}

export interface UserLocalDbEventParams {
  db: Nedb<DbUserLocal>
  startLoadApp: (err: Error | undefined, user: UserInfo) => void
}

export interface AllEventParams {
  systemDbEventParams: SystemDbEventParams
  userLocalDbEventParams: UserLocalDbEventParams
}
