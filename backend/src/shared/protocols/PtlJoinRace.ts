import { BaseRequest, BaseResponse, BaseConf } from "./base";

export interface ReqJoinRace extends BaseRequest {
    raceId: number,
    teamIdx: number
}

export interface ResJoinRace extends BaseResponse {

}

export const conf: BaseConf = {

}