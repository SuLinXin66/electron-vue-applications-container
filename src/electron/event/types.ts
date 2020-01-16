import Nedb from "nedb";
import {DbSystem, DbUserLocal} from "@/types";

export interface SystemDbEventParams {
  db: Nedb<DbSystem>
}

export interface UserLocalDbEventParams {
  db: Nedb<DbUserLocal>
}

export interface AllEventParams {
  systemDbEventParams: SystemDbEventParams
  userLocalDbEventParams: UserLocalDbEventParams
}
