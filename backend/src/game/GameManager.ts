import { WsConnection } from "tsrpc";
import { ServiceType } from "../shared/protocols/serviceProto";
import { ReqCreateRace } from "../shared/protocols/PtlCreateRace";
import { ReqJoinRace } from "../shared/protocols/PtlJoinRace";
import { Race, RaceType } from "../shared/game/Models/Race";
import { server } from "..";
import { ReqReadyRace } from "../shared/protocols/PtlReadyRace";

export class GameManager {

    private _nextPlayerId: number = 1;
    private _nextRaceId: number = 1;
    private _raceList: Race[] = [];

    public login(conn: WsConnection<ServiceType>): number {
        conn.playerId = this._nextPlayerId++;
        return conn.playerId;
    }

    public isNameExist(req: ReqCreateRace): boolean {
        let isExist: boolean = false;
        this._raceList.forEach(element => {
            if (element.name == req.name) {
                isExist = true;
            }
        });
        return isExist;
    }

    public createRace(req: ReqCreateRace, conn: WsConnection<ServiceType>): number {
        let race = new Race(this._nextRaceId++, req.name, req.teamArr, req.winDis, conn.playerId!);
        this._raceList.push(race);
        server.broadcastMsg('server/RaceList', {
            list: this.getRaceIntroList()
        });

        return race.id;
    }

    public joinRace(req: ReqJoinRace, conn: WsConnection<ServiceType>): boolean {
        for (let i = 0; i < this._raceList.length; i++) {
            const element = this._raceList[i];
            if (element.id == req.raceId) {
                return element.addPlayer(conn, req.teamIdx);
            }
        }
        return false;
    }

    public leaveRace(conn: WsConnection<ServiceType>): void {
        for (let i = 0; i < this._raceList.length; i++) {
            const element = this._raceList[i];

            // 将玩家从该竞赛移除
            element.removePlayer(conn);

            // 处理竞赛列表
            if (element.isStart) { // 如果该竞赛已开始，无需区分创建者和加入者
                // 应用离开输入
                element.applyInput({
                    type: 'PlayerLeave',
                    playerId: conn.playerId!
                })

                // 如果该竞赛玩家全部离开，从竞赛列表移除
                let isValid: boolean = false;
                for (let value of element.teamMap.values()) {
                    if (value.length) {
                        isValid = true;
                    }
                }
                if (!isValid) {
                    clearInterval(element.interval);
                    this._raceList.splice(i--, 1);
                }
            } else { // 如果该竞赛未开始
                // 如果离开的是创建者，则不会有人下令开始，从竞赛列表移除
                if (element.creatorId == conn.playerId) {
                    this._raceList.splice(i--, 1);

                    server.broadcastMsg('server/RaceList', {
                        list: this.getRaceIntroList()
                    });

                    // 通知该竞赛玩家创建者离开
                    let connArr: WsConnection<ServiceType>[] = [];
                    for (let value of element.teamMap.values()) {
                        connArr = connArr.concat(value);
                    }

                    server.broadcastMsg('server/CreatorLeave', {}, connArr);
                }
            }
        }
    }

    public readyRace(req: ReqReadyRace): void {
        this._raceList.forEach(element => {
            if (element.id == req.raceId) {
                element.isStart = true;

                server.broadcastMsg('server/RaceList', {
                    list: this.getRaceIntroList()
                });

                let connArr: WsConnection<ServiceType>[] = [];
                for (let value of element.teamMap.values()) {
                    connArr = connArr.concat(value);
                }

                server.broadcastMsg('server/NotifyReady', {
                    hillArr: element.hillArr,
                    winDis: element.winDis
                }, connArr);
            }
        });
    }

    public startRace(conn: WsConnection<ServiceType>): any {
        for (let race of this._raceList) {
            for (let entry of race.teamMap.entries()) {
                let index = entry[1].indexOf(conn);
                if (index >= 0) {
                    race.startRace();

                    let idArr: number[] = [];
                    for (let conn of entry[1]) {
                        idArr.push(conn.playerId!);
                    }

                    return {
                        teamArr: race.teamArr,
                        teamIdx: entry[0],
                        memberArr: idArr
                    };
                }
            }
        }

        return null;
    }

    public getRaceIntroList(): RaceType[] {
        let list: RaceType[] = [];
        this._raceList.forEach(element => {
            if (!element.isStart) {
                list.push({
                    id: element.id,
                    name: element.name,
                    teamArr: element.teamArr
                });
            }
        });
        return list;
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