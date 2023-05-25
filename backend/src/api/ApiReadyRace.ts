import { ApiCallWs } from "tsrpc";
import { ReqReadyRace, ResReadyRace } from "../shared/protocols/PtlReadyRace";
import { gameManager } from "../game/GameManager";

export default async function (call: ApiCallWs<ReqReadyRace, ResReadyRace>) {
    gameManager.readyRace(call.req);

    call.succ({
    })
}