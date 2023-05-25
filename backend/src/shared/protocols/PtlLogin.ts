import { BaseRequest, BaseResponse, BaseConf } from "./base";

export interface ReqLogin extends BaseRequest {

}

export interface ResLogin extends BaseResponse {
    id: number
}

export const conf: BaseConf = {

}