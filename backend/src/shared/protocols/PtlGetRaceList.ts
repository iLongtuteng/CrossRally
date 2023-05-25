import { RaceType } from "../game/Models/Race";
import { BaseRequest, BaseResponse, BaseConf } from "./base";

export interface ReqGetRaceList extends BaseRequest {

}

export interface ResGetRaceList extends BaseResponse {
    list: RaceType[]
}

export const conf: BaseConf = {

}