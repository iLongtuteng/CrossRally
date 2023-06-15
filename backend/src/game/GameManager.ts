import { WsConnection } from "tsrpc";
import { ServiceType } from "../shared/protocols/serviceProto";
import { Race } from "./Models/Race";

export class GameManager {

    public defaultRace: Race = new Race();
    private _nextPlayerId: number = 1;

    public login(conn: WsConnection<ServiceType>): number {
        conn.playerId = this._nextPlayerId++;
        return conn.playerId;
    }

    public static get Instance() {
        return this._instance || (this._instance = new GameManager());
    }

    private static _instance: GameManager;
}

export let gameManager: GameManager = GameManager.Instance;

declare module 'tsrpc' {
    export interface WsConnection {
        playerId?: number;
    }
}