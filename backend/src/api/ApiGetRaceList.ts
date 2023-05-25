import { ApiCallWs } from "tsrpc";
import { ReqGetRaceList, ResGetRaceList } from "../shared/protocols/PtlGetRaceList";
import { gameManager } from "../game/GameManager";

export default async function (call: ApiCallWs<ReqGetRaceList, ResGetRaceList>) {

    call.succ({
        list: gameManager.getRaceIntroList()
    })
}