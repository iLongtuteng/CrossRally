import { WsConnection } from "tsrpc";
import { gameConfig } from "../../shared/game/GameConfig";
import { ServiceType } from "../../shared/protocols/serviceProto";
import { GameSystem, GameSystemInput } from "../../shared/game/GameSystem";
import { ReqJoinRace } from "../../shared/protocols/PtlJoinRace";
import { ReqUpdateTeams } from "../../shared/protocols/PtlUpdateTeams";
import { ReqStartRace } from "../../shared/protocols/PtlStartRace";
import { server } from "../..";
import { ReqEndRace } from "../../shared/protocols/PtlEndRace";

export interface Hill {
    yOffset: number,
    width: number,
    height1: number,
    height2: number
}

export interface TeamObj {
    teamIdx: number,
    memberArr: number[]
}

export class Race {
    // key：竞赛的团队索引；value：团队成员playerId数组
    private _teamMap: Map<number, number[]> = new Map<number, number[]>();
    private _gameSystem: GameSystem = new GameSystem();
    private _conns: WsConnection<ServiceType>[] = [];
    private _adviserConn!: WsConnection<ServiceType>;
    private _pendingInputs: GameSystemInput[] = [];
    private _interval!: NodeJS.Timeout;

    public updateTeams(req: ReqUpdateTeams): void {
        for (let index of req.teamArr) {
            if (!this._teamMap.has(index)) {
                this._teamMap.set(index, []);
            }
        }

        for (let key of this._teamMap.keys()) {
            let index = req.teamArr.indexOf(key);
            if (index < 0) {
                this._teamMap.delete(key);
            }
        }
    }

    public joinRace(req: ReqJoinRace, conn: WsConnection<ServiceType>): boolean {
        if (req.teamIdx === undefined) {
            this._conns.push(conn);
            conn.listenMsg('client/ClientInput', call => {
                call.msg.inputs.forEach(v => {
                    this.applyInput({
                        ...v,
                        playerId: conn.playerId!
                    });
                });
            });

            return true;
        }

        if (this._teamMap.has(req.teamIdx)) {
            let index = this._teamMap.get(req.teamIdx)?.indexOf(conn.playerId!);
            if (index !== undefined && index < 0 && this._teamMap.get(req.teamIdx)?.length! < gameConfig.maxMember) {
                this._teamMap.get(req.teamIdx)?.push(conn.playerId!);

                this._conns.push(conn);
                conn.listenMsg('client/ClientInput', call => {
                    call.msg.inputs.forEach(v => {
                        this.applyInput({
                            ...v,
                            playerId: conn.playerId!
                        });
                    });
                });

                return true;
            }
        }

        return false;
    }

    public leaveRace(conn: WsConnection<ServiceType>): void {
        for (let value of this._teamMap.values()) {
            let index = value.indexOf(conn.playerId!);
            if (index >= 0) {
                value.splice(index, 1);
            }
        }

        let index = this._conns.indexOf(conn);
        if (index >= 0) {
            if (conn == this._adviserConn) {
                this.endRace();
            }

            conn.unlistenMsgAll('client/ClientInput');
            this._conns.splice(index, 1);
        }
    }

    public startRace(req: ReqStartRace, conn: WsConnection<ServiceType>): void {
        this._adviserConn = conn;

        let winDis = 0;
        switch (req.difficulty) {
            case 0:
                winDis = 50;
                break;

            case 1:
                winDis = 100;
                break;

            case 2:
                winDis = 150;
                break;

            default:
                winDis = 50;
                break;
        }

        let hillArr = this._generateHillArr();

        let teamObjArr: TeamObj[] = [];
        for (let entry of this._teamMap.entries()) {
            if (entry[1].length) {
                let teamObj: TeamObj = {
                    teamIdx: entry[0],
                    memberArr: entry[1]
                };
                teamObjArr.push(teamObj);
            } else {
                this._teamMap.delete(entry[0]);
            }
        }

        this._gameSystem.init(winDis, this._teamMap);
        this._pendingInputs = [];
        this._interval = setInterval(() => { this._sync() }, 1000 / gameConfig.syncRate);

        server.broadcastMsg('server/RaceInfo', {
            difficulty: req.difficulty,
            winDis: winDis,
            hillArr: hillArr,
            teamObjArr: teamObjArr
        }, this._conns);
    }

    public endRace(req?: ReqEndRace): void {
        clearInterval(this._interval);

        server.broadcastMsg('server/RaceResult', {
            winnerIdx: req ? req.winnerIdx : undefined
        }, this._conns);
    }

    public applyInput(input: GameSystemInput): void {
        // if (input.type == 'PlayerHeart') {
        //     console.log(input.playerId, input.heartState);
        // }
        this._pendingInputs.push(input);
    }

    private _sync(): void {
        let inputs = this._pendingInputs;
        this._pendingInputs = [];

        // Apply inputs
        inputs.forEach(v => {
            this._gameSystem.applyInput(v);
        });

        // 发送同步帧
        server.broadcastMsg('server/Frame', {
            state: this._gameSystem.state
        }, this._conns);
    }

    private _generateHillArr(): Hill[] {
        let hillArr: Hill[] = [];
        let xOffset: number = 0;
        let yOffset: number = 240;
        let hillWidth: number = 0;
        let randomHeight: number = 0;
        let tempYOffset: number = 0;
        let tempHeight: number = 0;

        while (xOffset < gameConfig.maxWidth) {
            tempYOffset = yOffset;

            hillWidth = 120 + Math.ceil(Math.random() * 26) * 20;

            // first step
            randomHeight = Math.min(Math.random() * hillWidth / 7.5, 600 - yOffset); // make sure yOffset < 600

            tempHeight = randomHeight;

            yOffset += randomHeight * 2;

            // second step
            randomHeight = Math.min(Math.random() * hillWidth / 5, yOffset - 240); // make sure yOffset > 240

            yOffset -= randomHeight * 2;

            xOffset += hillWidth;

            hillArr.push({
                yOffset: tempYOffset,
                width: hillWidth,
                height1: tempHeight,
                height2: randomHeight
            });
        }

        tempYOffset = yOffset;

        hillWidth = 120 + Math.ceil(Math.random() * 26) * 20;

        // first step
        randomHeight = Math.min(Math.random() * hillWidth / 7.5, 600 - yOffset); // make sure yOffset < 600

        tempHeight = randomHeight;

        yOffset += randomHeight * 2;

        // second step
        randomHeight = (yOffset - 240) / 2;

        yOffset -= randomHeight * 2;

        hillArr.push({
            yOffset: tempYOffset,
            width: hillWidth,
            height1: tempHeight,
            height2: randomHeight
        });

        return hillArr;
    }
}