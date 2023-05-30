import { BaseRequest, BaseResponse, BaseConf } from "./base";

export interface ReqCreateRace extends BaseRequest {
    name: string,
    teamArr: number[],
    difficulty: number
}

export interface ResCreateRace extends BaseResponse {
    id: number
}

export const conf: BaseConf = {

}