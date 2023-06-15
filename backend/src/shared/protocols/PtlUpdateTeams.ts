import { BaseRequest, BaseResponse, BaseConf } from "./base";

export interface ReqUpdateTeams extends BaseRequest {
    teamArr: number[]
}

export interface ResUpdateTeams extends BaseResponse {

}

export const conf: BaseConf = {

}