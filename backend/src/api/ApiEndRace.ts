import { ApiCallWs } from "tsrpc";
import { ReqEndRace, ResEndRace } from "../shared/protocols/PtlEndRace";
import { gameManager } from "../game/GameManager";

export default async function (call: ApiCallWs<ReqEndRace, ResEndRace>) {
    gameManager.defaultRace.endRace(call.req);

    call.succ({
    })
}