import { _decorator, Color, director, EventKeyboard, Input, input, instantiate, KeyCode, Label, Node, Prefab, Sprite, UIOpacity, Vec3 } from 'cc';
import { gameManager } from '../scripts/game/GameManager';
import { CameraCtrl } from './CameraCtrl';
import { World } from './World';
import { Ball } from '../resources/prefabs/Ball';
import { FWKMsg } from '../scripts/fwk/mvc/FWKMvc';
import { GameSystemState, ResultType } from '../scripts/shared/game/GameSystem';
import FWKComponent from '../scripts/fwk/FWKComponent';
import { Battery } from '../resources/prefabs/Battery';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends FWKComponent {

    @property(Node)
    camera: Node;

    @property(Node)
    world: Node;

    @property(Prefab)
    ballPrefab: Prefab;

    @property(Node)
    balls: Node;

    @property(Prefab)
    batteryPrefab: Prefab;

    @property(Node)
    batteries: Node;

    @property(Node)
    result: Node;

    private _teamArr: number[] = []; // 加入竞赛的全部团队索引
    private _teamIdx: number = 0; // 本人所属的团队索引
    private _memberArr: number[] = []; // 本人所属的团队成员playerId
    private _ballMap: Map<number, Node> = new Map<number, Node>();
    private _selfBall: Node = null;
    private _batteryMap: Map<number, Node> = new Map<number, Node>();
    private _heartState: number = 0;
    private _isFinish: boolean = false;

    async onLoad() {
        let data = await gameManager.startRace();
        this._teamArr = data.teamArr;
        this._teamIdx = data.teamIdx;
        this._memberArr = data.memberArr;

        for (let i = 0; i < this._teamArr.length; i++) {
            const element = this._teamArr[i];
            let ball = instantiate(this.ballPrefab);
            ball.parent = this.balls;
            ball.position = new Vec3(0, 200 + 20 * i, 0);

            if (element == this._teamIdx) {
                ball.getComponent(Sprite).color = new Color().fromHEX('#ADFF00');
                this.camera.getComponent(CameraCtrl).ball = ball;
                this.world.getComponent(World).ball = ball;
                this._selfBall = ball;
            }

            this._ballMap.set(element, ball);
        }

        let batteryArr: number[] = [];
        batteryArr[0] = gameManager.selfPlayerId;
        for (let playerId of this._memberArr) {
            if (playerId != gameManager.selfPlayerId) {
                batteryArr.push(playerId);
            }
        }

        for (let i = 0; i < batteryArr.length; i++) {
            const element = batteryArr[i];
            let battery = instantiate(this.batteryPrefab);
            battery.parent = this.batteries;

            if (i == 0) {
                battery.position = new Vec3(0, (batteryArr.length - 1) * 50 + 6, 0);
            } else {
                battery.position = new Vec3(30, (batteryArr.length - 1 - i) * 50, 0);
                battery.scale = new Vec3(0.75, 0.75, 1);
            }

            this._batteryMap.set(element, battery);
        }

        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        this._heartState = 0;
        gameManager.sendClientInput({
            type: 'PlayerHeart',
            heartState: this._heartState
        });
    }

    private onKeyUp(event: EventKeyboard): void {
        switch (event.keyCode) {
            case KeyCode.ARROW_LEFT:
                this._heartState = 0;
                break;

            case KeyCode.ARROW_UP:
                this._heartState = 1;
                break;

            case KeyCode.ARROW_RIGHT:
                this._heartState = 2;
                break;
        }

        gameManager.sendClientInput({
            type: 'PlayerHeart',
            heartState: this._heartState
        });
    }

    public onMsg_ApplySystemState(msg: FWKMsg<GameSystemState>): boolean {
        if (this._isFinish)
            return true;

        let systemState: GameSystemState = msg.data;

        for (let entry of this._ballMap.entries()) {
            let ball = systemState.balls.find(v => v.idx === entry[0]);
            if (!ball) {
                entry[1].removeFromParent();
                this._ballMap.delete(entry[0]);
                let index = this._teamArr.indexOf(entry[0]);
                if (index >= 0) {
                    this._teamArr.splice(index, 1);
                }
            } else {
                // console.log('ball.idx: ' + ball.idx);
                // console.log('ball.maxSpeed: ' + ball.maxSpeed);
                //应用每个小球的角速度
                this._ballMap.get(ball.idx)?.getComponent(Ball).setState(ball.maxSpeed);

                if (ball.idx == this._teamIdx) { //如果是自己的团队
                    if (this._memberArr[0] != gameManager.selfPlayerId) { //如果自己不是队长，则更新该小球位置
                        if (this._selfBall) {
                            this._selfBall.position = new Vec3(ball.pos.x, ball.pos.y, 0);
                        }
                    }

                    //应用团队成员的心脏状态
                    for (let entry of this._batteryMap.entries()) {
                        let player = ball.players.find(v => v.id === entry[0]);
                        if (!player) {
                            entry[1].getComponent(Battery).setState(0);
                            entry[1].getComponent(UIOpacity).opacity = 128;
                            this._batteryMap.delete(entry[0]);
                            let index = this._memberArr.indexOf(entry[0]);
                            if (index >= 0) {
                                this._memberArr.splice(index, 1);
                            }
                        } else {
                            entry[1].getComponent(Battery).setState(player.heartState);
                        }
                    }

                    if (ball.result == ResultType.Win) {
                        this._selfBall.getComponent(Ball).setState(0);
                        this.result.active = true;
                        this.result.getChildByName('Label').getComponent(Label).string = '你们队赢了！';
                        this._isFinish = true;
                    } else if (ball.result == ResultType.Lose) {
                        this._selfBall.getComponent(Ball).setState(0);
                        this.result.active = true;
                        this.result.getChildByName('Label').getComponent(Label).string = '你们队输了！';
                        this._isFinish = true;
                    }
                } else { //如果不是自己的团队
                    //更新该小球位置
                    if (this._ballMap.get(ball.idx)) {
                        this._ballMap.get(ball.idx).position = new Vec3(ball.pos.x, ball.pos.y, 0);
                    }

                    if (ball.result != ResultType.Pending) {
                        this._ballMap.get(ball.idx).getComponent(Ball).setState(0);
                    }
                }
            }
        }

        return true;
    }

    update(deltaTime: number) {
        //如果自己是队长，则发送位置
        if (this._memberArr[0] == gameManager.selfPlayerId && !this._isFinish) {
            gameManager.sendClientInput({
                type: 'BallMove',
                pos: {
                    x: this._selfBall.position.x,
                    y: this._selfBall.position.y,
                }
            });
            // console.log('this._selfBall.position: ' + this._selfBall.position);
        }
    }

    onQuitBtn() {
        gameManager.leaveRace(() => {
            director.loadScene('Start');
        });
    }
}
