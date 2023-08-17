import { ConnectionStatus, WsConnection } from "tsrpc";
import { gameConfig } from "../../shared/game/GameConfig";
import { ServiceType } from "../../shared/protocols/serviceProto";
import { GameSystem, GameSystemInput } from "../../shared/game/GameSystem";
import { ReqJoinRace } from "../../shared/protocols/PtlJoinRace";
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

export interface NameObj {
    playerId: number,
    patientName: string
}

export class Race {
    // key：竞赛的团队索引；value：团队成员playerId数组
    private _teamMap: Map<number, number[]> = new Map<number, number[]>();
    private _nameMap: Map<number, string> = new Map<number, string>();
    private _gameSystem: GameSystem = new GameSystem();
    private _conns: WsConnection<ServiceType>[] = [];
    private _pendingInputs: GameSystemInput[] = [];
    private _interval: NodeJS.Timeout | undefined;

    public joinRace(req: ReqJoinRace, conn: WsConnection<ServiceType>): boolean {
        conn.playerId = req.playerId;

        let connection = this._conns.find(v => v.playerId === conn.playerId);
        if (connection) {
            connection.unlistenMsgAll('client/ClientInput');
            let index = this._conns.indexOf(connection);
            this._conns.splice(index, 1);
        }

        this._conns.push(conn);
        conn.listenMsg('client/ClientInput', call => {
            call.msg.inputs.forEach(v => {
                this.applyInput({
                    ...v,
                    playerId: conn.playerId!
                });
            });
        });

        if (!req.isAdviser) {
            if (req.teamIdx !== undefined) {
                if (!this._teamMap.has(req.teamIdx)) {
                    this._teamMap.set(req.teamIdx, []);
                }

                for (const entry of this._teamMap.entries()) {
                    if (req.teamIdx == entry[0]) {
                        let index = entry[1].indexOf(conn.playerId);
                        if (index < 0) {
                            if (entry[1].length < gameConfig.maxMember) {
                                entry[1].push(conn.playerId);
                            }
                        }
                    } else {
                        let index = entry[1].indexOf(conn.playerId);
                        if (index >= 0) {
                            entry[1].splice(index, 1);
                        }
                    }
                }
            }

            if (req.patientName !== undefined) {
                this._nameMap.set(conn.playerId, req.patientName);
            }
        }

        return true;
    }

    public startRace(req: ReqStartRace): void {
        let winDis = 0;
        switch (req.difficulty) {
            case 0:
                winDis = gameConfig.easyDis;
                break;

            case 1:
                winDis = gameConfig.normalDis;
                break;

            case 2:
                winDis = gameConfig.hardDis;
                break;

            default:
                winDis = gameConfig.easyDis;
                break;
        }

        let hillArr = this._generateHillArr();

        let teamObjArr: TeamObj[] = [];
        for (const entry of this._teamMap.entries()) {
            if (entry[1].length) {
                let idArr: number[] = [];
                for (let i = entry[1].length - 1; i >= 0; i--) {
                    let playerId = entry[1][i];
                    let connection = this._conns.find(v => v.playerId === playerId);
                    if (connection) {
                        if (connection.status == ConnectionStatus.Opened) {
                            idArr.push(playerId);
                        } else {
                            entry[1].splice(i, 1);
                        }
                    }
                }

                if (idArr.length) {
                    let teamObj: TeamObj = {
                        teamIdx: entry[0],
                        memberArr: idArr
                    };
                    teamObjArr.push(teamObj);
                }

                if (!entry[1].length) {
                    this._teamMap.delete(entry[0]);
                }
            }
        }
        console.log(teamObjArr);
        console.log(this._teamMap);

        let nameObjArr: NameObj[] = [];
        for (const entry of this._nameMap.entries()) {
            let nameObj: NameObj = {
                playerId: entry[0],
                patientName: entry[1]
            };
            nameObjArr.push(nameObj);
        }

        this._gameSystem.init(winDis, this._teamMap);
        this._pendingInputs = [];
        if (this._interval) {
            clearInterval(this._interval);
        }

        server.broadcastMsg('server/RaceInfo', {
            difficulty: req.difficulty,
            winDis: winDis,
            hillArr: hillArr,
            teamObjArr: teamObjArr,
            nameObjArr: nameObjArr
        }, this._conns);
    }

    public enterRace(): void {
        this._interval = setInterval(() => { this._sync() }, 1000 / gameConfig.syncRate);
    }

    public endRace(req: ReqEndRace): void {
        if (this._interval) {
            clearInterval(this._interval);
        }

        server.broadcastMsg('server/RaceResult', {
            winnerIdx: req.winnerIdx
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

        for (let ball of this._gameSystem.state.balls) {
            ball.stateCount++;
        }

        // Apply inputs
        inputs.forEach(v => {
            this._gameSystem.applyInput(v);
        });

        for (let ball of this._gameSystem.state.balls) {
            if (ball.stateCount >= gameConfig.syncRate * 3) {
                ball.isConn = false;
            }
        }

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

            hillWidth = 400 + Math.ceil(Math.random() * 12) * 20;

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

        hillWidth = 240 + Math.ceil(Math.random() * 20) * 20;

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