import { FWKMsg } from "../fwk/mvc/FWKMvc";

module GameMsgs {

    export enum Names {
        ReadyEnterRace,
        TeamBtnClicked,
        ApplySystemState,
        RaceShowResult
    }

    export function send<T>(name: GameMsgs.Names, args: T = null, queue: string = ""): FWKMsg<T> {
        var n: string = GameMsgs.Names[name];
        var msg: FWKMsg<T> = new FWKMsg<T>(n, args, queue);
        msg.send();
        return msg;
    }
}

export default GameMsgs;