import { gameConfig } from "./GameConfig";

export enum ResultType {
    Pending = 0,
    Win,
    Lose
}

export interface BallState {
    idx: number,
    maxSpeed: number,
    pos: { x: number, y: number },
    players: PlayerState[],
    result: ResultType,
    stateCount: number,
    isConn: boolean
}

export interface PlayerState {
    id: number,
    heartState: number
}

export interface GameSystemState {
    balls: BallState[]
}

export class GameSystem {
    // 当前状态
    private _state: GameSystemState = {
        balls: []
    }
    get state(): Readonly<GameSystemState> {
        return this._state;
    }

    private _winDis: number = 100;

    public init(winDis: number, teamMap: Map<number, number[]>): void {
        this._winDis = winDis;

        this._state.balls = [];
        for (let entry of teamMap.entries()) {
            let players: PlayerState[] = [];
            for (let playerId of entry[1]) {
                players.push({
                    id: playerId,
                    heartState: 0
                })
            }

            this._state.balls.push({
                idx: entry[0],
                maxSpeed: 0,
                pos: { x: 0, y: 0 },
                players: players,
                result: ResultType.Pending,
                stateCount: 0,
                isConn: true
            })
        }
    }

    // 应用输入，计算状态变更
    public applyInput(input: GameSystemInput): void {
        if (input.type === 'PlayerHeart') {
            for (let ball of this._state.balls) {
                let player = ball.players.find(v => v.id === input.playerId);
                if (player) {
                    player.heartState = input.heartState;

                    let total = 0;
                    for (let player of ball.players) {
                        total += (player.heartState + 1);
                    }

                    ball.maxSpeed = Math.pow(total / ball.players.length, 4.3923) - 1;
                }
            }
        } else if (input.type === 'BallMove') {
            for (let ball of this._state.balls) {
                let player = ball.players.find(v => v.id === input.playerId);
                if (player) {
                    ball.pos = input.pos;
                    ball.stateCount = 0;

                    if (ball.result == ResultType.Pending && ball.pos.x >= this._winDis * gameConfig.disUnit) {
                        for (let ball of this._state.balls) {
                            ball.result = ResultType.Lose;
                        }
                        ball.result = ResultType.Win;
                    }
                }
            }
        }
    }
}

export interface PlayerHeart {
    type: 'PlayerHeart',
    playerId: number,
    heartState: number
}

export interface BallMove {
    type: 'BallMove',
    playerId: number,
    pos: { x: number, y: number }
}

export type GameSystemInput = PlayerHeart
    | BallMove;