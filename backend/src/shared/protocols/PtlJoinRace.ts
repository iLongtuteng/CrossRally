import { BaseRequest, BaseResponse, BaseConf } from "./base";

export interface ReqJoinRace extends BaseRequest {
    teamIdx?: number,
    patientName?: string
}

export interface ResJoinRace extends BaseResponse {

}

export const conf: BaseConf = {

}