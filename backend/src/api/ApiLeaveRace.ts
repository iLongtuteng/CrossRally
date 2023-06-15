import { ApiCallWs } from "tsrpc";
import { ReqLeaveRace, ResLeaveRace } from "../shared/protocols/PtlLeaveRace";
import { gameManager } from "../game/GameManager";

export default async function (call: ApiCallWs<ReqLeaveRace, ResLeaveRace>) {
    gameManager.defaultRace.leaveRace(call.conn);

    call.succ({
    })
}