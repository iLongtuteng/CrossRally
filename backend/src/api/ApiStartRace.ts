import { ApiCallWs } from "tsrpc";
import { ReqStartRace, ResStartRace } from "../shared/protocols/PtlStartRace";
import { gameManager } from "../game/GameManager";

export default async function (call: ApiCallWs<ReqStartRace, ResStartRace>) {
    gameManager.defaultRace.startRace(call.req, call.conn);

    call.succ({
    })
}