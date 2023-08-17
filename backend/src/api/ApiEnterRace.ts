import { ApiCallWs } from "tsrpc";
import { ReqEnterRace, ResEnterRace } from "../shared/protocols/PtlEnterRace";
import { gameManager } from "../game/GameManager";

export default async function (call: ApiCallWs<ReqEnterRace, ResEnterRace>) {
    gameManager.defaultRace.enterRace();

    call.succ({
    })
}