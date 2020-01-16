export interface UserInfo {
  userName: string
  password: string
  idCard: string
}

export interface DbParams {
  query: any
  paramQuery: any
  options: any
}

export interface DbSystem {
  localType: 'mainSystemUrl' | 'socketUrl' | 'chatMain' | 'chatMessage' | 'chatHistory' | 'appsUrl'
  desc: string
  url: string
  _id?: string
}

export interface DbUserLocal {
  key: string
  val: string | boolean
  _id?: string
}


export interface EventReturn<T> {
  error: boolean
  msg?: string
  result?: T,
  err?: Error,
  numberOfUpdated?: number,
  upsert?: boolean
}

const systemEventNamePrefix = "systemDB-";
export const SystemEventNames = {
  find: systemEventNamePrefix + "find",
  findOne: systemEventNamePrefix + "find-one",
  update: systemEventNamePrefix + "update"
};

const userLocalDbEventNamePrefix = "userLocalDb-";
export const UserLocalEventNames = {
  findOne: userLocalDbEventNamePrefix + "find-one",
  update: userLocalDbEventNamePrefix + "update",
};
