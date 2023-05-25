import { BaseRequest, BaseResponse, BaseConf } from "./base";

export interface ReqReadyRace extends BaseRequest {
    raceId: number
}

export interface ResReadyRace extends BaseResponse {

}

export const conf: BaseConf = {

}