import { ApiCallWs } from "tsrpc";
import { ReqCreateRace, ResCreateRace } from "../shared/protocols/PtlCreateRace";
import { gameManager } from "../game/GameManager";

export default async function (call: ApiCallWs<ReqCreateRace, ResCreateRace>) {
    if (gameManager.isNameExist(call.req)) {
        call.error('该名称已存在');
        return;
    }

    let id = gameManager.createRace(call.req, call.conn);

    call.succ({
        id: id
    })
}