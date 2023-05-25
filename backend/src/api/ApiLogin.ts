import { ApiCallWs } from "tsrpc";
import { ReqLogin, ResLogin } from "../shared/protocols/PtlLogin";
import { gameManager } from "../game/GameManager";

export default async function (call: ApiCallWs<ReqLogin, ResLogin>) {
    let id = gameManager.login(call.conn);

    call.succ({
        id: id
    })
}