import { Hill } from "../../game/Models/Race";

export interface MsgNotifyReady {
    difficulty: number,
    hillArr: Hill[],
    winDis: number
}
