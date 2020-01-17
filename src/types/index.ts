export interface UserInfo {
  name: string
  sex: string
  age: number
  idCode: string
  phone: string
  companyName: string
  jobName: string
  postsName: string
  deptName: string
  status: string
  dataInTime: string
  endUpdateTime: string
  userName: string
  firstLogin: boolean
  password?: string
  email?: string
  registryTime?: string
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
  update: systemEventNamePrefix + "update",
  saveComponent: systemEventNamePrefix + "save-component"
};

const userLocalDbEventNamePrefix = "userLocalDb-";
export const UserLocalEventNames = {
  findOne: userLocalDbEventNamePrefix + "find-one",
  update: userLocalDbEventNamePrefix + "update",
  loginOk: userLocalDbEventNamePrefix + "login-ok"
};

const remoteEventNamesPrefix = "remote-event-names-";
export const RemoteEventNames = {
  loginLoading: remoteEventNamesPrefix + "loginLoading"
};
