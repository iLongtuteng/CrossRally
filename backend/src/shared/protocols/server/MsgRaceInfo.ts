import { Hill, TeamObj } from "../../../game/Models/Race";

export interface MsgRaceInfo {
    difficulty: number,
    winDis: number,
    hillArr: Hill[],
    teamObjArr: TeamObj[]
}
