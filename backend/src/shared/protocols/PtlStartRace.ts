import { BaseRequest, BaseResponse, BaseConf } from "./base";

export interface ReqStartRace extends BaseRequest {

}

export interface ResStartRace extends BaseResponse {
    data: {
        teamArr: number[],
        teamIdx: number,
        memberArr: number[]
    }
}

export const conf: BaseConf = {

}