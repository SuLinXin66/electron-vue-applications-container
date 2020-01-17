import axios, {AxiosPromise, AxiosResponse} from "axios";
import {Message} from "view-design";
import responseHandler from "./callback/responseHandler";
import {AjaxRequest} from "../types";
import qs from "qs";

const prefix = "http://127.0.0.1:8082";

// const prefix = servletContext;

/**
 * 处理Url
 * @param url url
 * @return 处理后的url
 */
function handleUrl(url: string): string {
  if (url.indexOf("//") != 0) {
    if (url.indexOf("/") == 0) {
      url = url.substr(1);
    }
    url = `${prefix}/${url}`;
  } else {
    url = url.substr(2);
  }
  return url;
}

/**
 * 请求拦截
 */
axios.interceptors.request.use(config => {
  (Message as any).loading({
    content: "请求中...",
    duration: 0
  });
  if (config.url) {
    config.url = handleUrl(config.url);
  }
  return config;
}, (error) => {
  (Message as any).destroy();
  (Message as any).error("请求服务器失败");
});

/**
 * 响应拦截
 */
axios.interceptors.response.use(response => {
  (Message as any).destroy();
  return responseHandler(response);
}, (error: any) => {
  (Message as any).destroy();
  (Message as any).error("获取服务器响应失败!");
  return Promise.reject(error)
});

interface HandleReturn {
  isErr: boolean
  msg: string
  response?: AxiosResponse
  e?: any
  code?: any
}

export default axios;

export function sendAjax(sendContent: AjaxRequest): AxiosPromise<any> {

  if (!sendContent.sendDataType) {
    sendContent.sendDataType = "json";
  }

  const methodName = sendContent.method.toLowerCase();
  switch (sendContent.sendDataType) {
    case "FORM":
    case "form":
      return (axios as any)[methodName](sendContent.url, qs.stringify(sendContent.data));
    case "json":
    case "JSON":
      return (axios as any)[methodName](sendContent.url, sendContent.data);
    case "FILE":
    case "file":
      if (!sendContent.file) {
        return Promise.reject({
          code: "-999",
          msg: "未找到要上传的文件"
        });
      }
      const param = new FormData();
      param.append("file", sendContent.file.files![0]);
      if (sendContent.data) {
        for (let key in sendContent.data) {
          if ((sendContent.data as any)[key]) {
            param.append(key, (sendContent.data as any)[key]);
          }
        }
      }
      return axios.post(sendContent.url, param);
    // return bkUploadFile({
    //     dataType: "json",
    //     path: handleUrl(sendContent.url),
    //     file: sendContent.file,
    //     data: sendContent.data
    // });
    default:
      return Promise.reject({code: "-999", msg: "意料之外的请求方式"})
  }

}

export function handleAjax(sendContent: AjaxRequest, successMsg: string, errMsg: string): Promise<HandleReturn> {
  return new Promise<HandleReturn>(async (resolve, reject) => {
    try {
      const response = await sendAjax(sendContent);
      if (parseInt(response.data.result) !== 0) {
        resolve({
          isErr: true,
          code: response.data.result,
          msg: response.data.msg || errMsg,
          response
        });
        return;
      }
      resolve({
        isErr: false,
        msg: successMsg,
        response
      })
    } catch (e) {
      resolve({
        isErr: true,
        msg: errMsg,
        e
      })
    }
  });

}
