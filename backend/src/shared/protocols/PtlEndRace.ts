import { BaseRequest, BaseResponse, BaseConf } from "./base";

export interface ReqEndRace extends BaseRequest {
    winnerIdx?: number
}

export interface ResEndRace extends BaseResponse {

}

export const conf: BaseConf = {

}