import {AxiosResponse} from "axios";

export default function (res: AxiosResponse<any>): Promise<AxiosResponse<any>> | AxiosResponse<any> {

    if (typeof res.data !== "string") {
        if (res.data.error) {
            return Promise.reject(res);
        }
    }

    return res;
}