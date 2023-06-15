import { ApiCallWs } from "tsrpc";
import { ReqUpdateTeams, ResUpdateTeams } from "../shared/protocols/PtlUpdateTeams";
import { gameManager } from "../game/GameManager";

export default async function (call: ApiCallWs<ReqUpdateTeams, ResUpdateTeams>) {
    gameManager.defaultRace.updateTeams(call.req);

    call.succ({
    })
}