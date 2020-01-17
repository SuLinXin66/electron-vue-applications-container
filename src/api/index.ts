import {AjaxRequest} from "@/api/types";

export const registry: (urlPrefix: string, data: { userName: string, idCode: string }) => AjaxRequest = (urlPrefix, data) => ({
  url: `//${urlPrefix}/user/registry`,
  method: "post",
  sendDataType: "json",
  data
});

export const login: (urlPrefix: string, data: { userName: string, password: string }) => AjaxRequest = (urlPrefix, data) => ({
  url: `//${urlPrefix}/user/login`,
  method: "post",
  sendDataType: "json",
  data
});

export const queryComponents: (urlPrefix: string) => AjaxRequest = (urlPrefix) => ({
  url: `//${urlPrefix}/component/queryAll`,
  method: "get"
});

export const ping: (urlPrefix: string) => AjaxRequest = urlPrefix => ({
  url: `//${urlPrefix}/ping`,
  method: "post"
});

export const updateUserPwd: (urlPrefix: string, data: { userName: string, oldPwd: string, newPwd: string }) => AjaxRequest = (urlPrefix, data) => ({
  url: `//${urlPrefix}/user/update/pwd `,
  method: "post",
  data
});
