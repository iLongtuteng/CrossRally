import { BaseRequest, BaseResponse, BaseConf } from "./base";

export interface ReqStartRace extends BaseRequest {
    difficulty: number
}

export interface ResStartRace extends BaseResponse {

}

export const conf: BaseConf = {

}