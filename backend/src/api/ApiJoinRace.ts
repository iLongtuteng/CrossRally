import { ApiCallWs } from "tsrpc";
import { ReqJoinRace, ResJoinRace } from "../shared/protocols/PtlJoinRace";
import { gameManager } from "../game/GameManager";

export default async function (call: ApiCallWs<ReqJoinRace, ResJoinRace>) {
    if (gameManager.defaultRace.joinRace(call.req, call.conn)) {
        call.succ({});
    } else {
        call.error('竞赛加入失败');
    }
}