import { _decorator, Button, EventKeyboard, Input, input, instantiate, KeyCode, Label, Node, Prefab, resources, Sprite, SpriteFrame, UIOpacity, Vec3 } from 'cc';
import { CameraCtrl } from './CameraCtrl';
import { CameraBG } from './CameraBG';
import { World } from './World';
import FWKComponent from '../../fwk/FWKComponent';
import { FWKMsg } from '../../fwk/mvc/FWKMvc';
import { gameManager } from '../GameManager';
import { audioManager } from '../AudioManager';
import { GameSystemState, ResultType } from '../../shared/game/GameSystem';
import { Ball } from '../prefabs/Ball';
import { Battery } from '../prefabs/Battery';
import { Confirm } from '../prefabs/Confirm';
import { Team } from '../prefabs/Team';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends FWKComponent {

    @property(Prefab)
    confirmPrefab: Prefab;

    @property(Node)
    camera: Node;

    @property(Node)
    cameraBG: Node;

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

    @property(Prefab)
    teamPrefab: Prefab;

    @property(Node)
    teams: Node;

    @property(Node)
    loading: Node;

    @property(Node)
    result: Node;

    @property(Label)
    timeLbl: Label;

    @property(Button)
    endBtn: Button;

    private _teamArr: number[] = []; // 加入竞赛的全部团队索引
    private _teamIdx: number = -1; // 本人所属的团队索引
    private _choosenIdx: number = -1;
    private _memberArr: number[] = []; // 本人所属的团队成员playerId
    private _ballMap: Map<number, Node> = new Map<number, Node>();
    private _selfBall: Node = null;
    private _teamNodeMap: Map<number, Node> = new Map<number, Node>();
    private _batteryMap: Map<number, Node> = new Map<number, Node>();
    private _heartState: number = 0;
    private _isLeader: boolean = false;
    private _trainingTime: number = 0;

    async onLoad() {
        window.addEventListener('message', this._onMessage.bind(this));
        input.on(Input.EventType.KEY_UP, this._onKeyUp, this);
        this._startTimer();

        if (gameManager.isAdviser) {
            this.endBtn.node.active = true;
        } else {
            this.endBtn.node.active = false;
            this.loading.active = true;
            this.scheduleOnce(() => {
                this.loading.active = false;
            }, gameManager.delayTime / 1000);
        }

        for (let entry of gameManager.teamMap.entries()) {
            this._teamArr.push(entry[0]);
            let index = entry[1].indexOf(gameManager.selfPlayerId);
            if (index >= 0) {
                this._teamIdx = entry[0];
                this._memberArr = entry[1];
                if (this._memberArr[0] == gameManager.selfPlayerId) {
                    this._isLeader = true;
                }
            }
        }

        for (let i = 0; i < this._teamArr.length; i++) {
            const element = this._teamArr[i];
            let ball = instantiate(this.ballPrefab);
            ball.parent = this.balls;
            ball.position = new Vec3(0, 200 + 20 * i, 0);

            if (gameManager.isAdviser) {
                resources.load('textures/OtherBall/spriteFrame', SpriteFrame, (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        ball.getComponent(Sprite).spriteFrame = res;
                    }
                });
            } else {
                if (element == this._teamIdx) {
                    resources.load('textures/SelfBall/spriteFrame', SpriteFrame, (err, res) => {
                        if (err) {
                            console.log(err);
                        } else {
                            ball.getComponent(Sprite).spriteFrame = res;
                        }
                    });
                    this._selfBall = ball;

                    this.camera.getComponent(CameraCtrl).ball = ball;
                    this.cameraBG.getComponent(CameraBG).ball = ball;
                    this.world.getComponent(World).ball = ball;
                } else {
                    resources.load('textures/OtherBall/spriteFrame', SpriteFrame, (err, res) => {
                        if (err) {
                            console.log(err);
                        } else {
                            ball.getComponent(Sprite).spriteFrame = res;
                        }
                    });
                }
            }

            this._ballMap.set(element, ball);

            if (gameManager.isAdviser) {
                let team = instantiate(this.teamPrefab);
                team.parent = this.teams;
                team.position = new Vec3(0, (this._teamArr.length - 1 - i) * 90, 0);
                team.getComponent(Team).init(element);

                this._teamNodeMap.set(element, team);
            }
        }

        if (!gameManager.isAdviser) {
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
        }

        if (gameManager.isAdviser && this._teamNodeMap.has(this._teamArr[0])) {
            this.scheduleOnce(() => {
                this._teamNodeMap.get(this._teamArr[0]).getComponent(Team).onTeamBtn();
            }, 0.2);
        }

        this._heartState = 0;
        gameManager.sendClientInput({
            type: 'PlayerHeart',
            heartState: this._heartState
        });

        audioManager.playMusic();
    }

    onDestroy() {
        window.removeEventListener('message', this._onMessage.bind(this));
        input.off(Input.EventType.KEY_UP, this._onKeyUp, this);
    }

    private _onMessage(e: MessageEvent): void {
        let obj = JSON.parse(e.data);

        if (gameManager.isAdviser) {
            if (obj.type == 'stop') {
                console.log('obj.type == "stop"');
                gameManager.endRace();
            }
        } else {
            if (obj.type == 'state') {
                console.log('obj.type == "state"');
                if (obj.S != null) {
                    console.log('obj.S: ' + obj.S);
                    this._heartState = parseInt(obj.S);
                }
            }

            if (obj.type == 'error') {
                console.log('obj.type == "error"');
                this._heartState = 0;
            }

            gameManager.sendClientInput({
                type: 'PlayerHeart',
                heartState: this._heartState
            });
        }
    }

    private _onKeyUp(event: EventKeyboard): void {
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

    private _startTimer() {
        this._timerCallback();
        this.schedule(this._timerCallback, 1);
    }

    private _endTimer() {
        this.unschedule(this._timerCallback);
    }

    private _timerCallback() {
        this._trainingTime++;
        this.timeLbl.string = this._getTimeStr(this._trainingTime);

        if (this._trainingTime >= 600 && gameManager.isAdviser) {
            gameManager.endRace();
        }
    }

    private _getTimeStr(time: number): string {
        let h = Math.floor(time / 60 / 60); // % 24
        let hStr = h < 10 ? '0' + h : '' + h;
        let m = Math.floor(time / 60 % 60);
        let mStr = m < 10 ? '0' + m : '' + m;
        let s = time % 60;
        let sStr = s < 10 ? '0' + s : '' + s;

        return hStr + ':' + mStr + ':' + sStr;
    }

    public onMsg_TeamBtnClicked(msg: FWKMsg<number>): boolean {
        let key: number = msg.data;
        for (let value of this._teamNodeMap.values()) {
            value.getComponent(Team).teamBtn.getComponent(Button).normalSprite = gameManager.greenSprite;
            value.getComponent(Team).teamBtn.getComponent(Button).hoverSprite = gameManager.greenSprite;
        }
        this._teamNodeMap.get(key).getComponent(Team).teamBtn.getComponent(Button).normalSprite = gameManager.blueSprite;
        this._teamNodeMap.get(key).getComponent(Team).teamBtn.getComponent(Button).hoverSprite = gameManager.blueSprite;

        this.camera.getComponent(CameraCtrl).ball = this._ballMap.get(key);
        this.cameraBG.getComponent(CameraBG).ball = this._ballMap.get(key);
        this.world.getComponent(World).ball = this._ballMap.get(key);
        this.world.getComponent(World).updateHill();

        this._choosenIdx = key;
        this._refreshBattery(key);

        return true;
    }

    private _refreshBattery(key: number): void {
        this.batteries.removeAllChildren();
        this._batteryMap.clear();

        for (let i = 0; i < gameManager.teamMap.get(key).length; i++) {
            const element = gameManager.teamMap.get(key)[i];
            let battery = instantiate(this.batteryPrefab);
            battery.parent = this.batteries;
            battery.position = new Vec3(30, (gameManager.teamMap.get(key).length - 1 - i) * 50, 0);
            battery.scale = new Vec3(0.75, 0.75, 1);
            this._batteryMap.set(element, battery);
        }
    }

    public onMsg_ApplySystemState(msg: FWKMsg<GameSystemState>): boolean {
        let systemState: GameSystemState = msg.data;

        for (let entry of this._ballMap.entries()) {
            let ball = systemState.balls.find(v => v.idx === entry[0]);
            if (!ball) {
                entry[1].removeFromParent();
                this._ballMap.delete(entry[0]);
                if (gameManager.isAdviser) {
                    this._teamNodeMap.get(entry[0]).getComponent(Team).teamBtn.interactable = false;
                }
            } else {
                // console.log('ball.idx: ' + ball.idx);
                // console.log('ball.maxSpeed: ' + ball.maxSpeed);
                //应用每个小球的角速度
                if (ball.result == ResultType.Pending) {
                    entry[1].getComponent(Ball).setState(ball.maxSpeed);
                } else {
                    entry[1].getComponent(Ball).setState(0);
                }

                if (gameManager.isAdviser) {
                    if (entry[1]) {
                        entry[1].position = new Vec3(ball.pos.x, ball.pos.y, 0);
                    }

                    if (ball.idx == this._choosenIdx) {
                        //应用团队成员的心脏状态
                        for (let entry of this._batteryMap.entries()) {
                            let player = ball.players.find(v => v.id === entry[0]);
                            if (!player) {
                                entry[1].getComponent(Battery).setState(0);
                                entry[1].getComponent(UIOpacity).opacity = 128;
                            } else {
                                entry[1].getComponent(Battery).setState(player.heartState);
                            }
                        }
                    }
                } else {
                    if (ball.idx == this._teamIdx) { //如果是自己的团队
                        if (!this._isLeader) { //如果自己不是队长，则更新该小球位置
                            if (entry[1]) {
                                entry[1].position = new Vec3(ball.pos.x, ball.pos.y, 0);
                            }
                        }

                        //应用团队成员的心脏状态
                        for (let entry of this._batteryMap.entries()) {
                            let player = ball.players.find(v => v.id === entry[0]);
                            if (!player) {
                                entry[1].getComponent(Battery).setState(0);
                                entry[1].getComponent(UIOpacity).opacity = 128;
                            } else {
                                entry[1].getComponent(Battery).setState(player.heartState);
                            }
                        }

                        if (ball.result == ResultType.Win) {
                            gameManager.endRace(this._teamIdx);
                        }
                    } else { //如果不是自己的团队
                        //更新该小球位置
                        if (entry[1]) {
                            entry[1].position = new Vec3(ball.pos.x, ball.pos.y, 0);
                        }
                    }
                }
            }
        }

        return true;
    }

    public onMsg_RaceShowResult(msg: FWKMsg<number>): boolean {
        this.result.active = true;
        audioManager.stopMusic();
        this._trainingTime = 0;
        this._endTimer();

        let winnerIdx: number = msg.data;
        if (winnerIdx != undefined && winnerIdx != null) {
            if (gameManager.isAdviser) {
                this.result.getChildByName('Label').getComponent(Label).string = (winnerIdx + 1) + '队赢了！';
            } else {
                if (this._teamIdx == winnerIdx) {
                    this.result.getChildByName('Label').getComponent(Label).string = '你们队赢了！';
                    audioManager.playSound('Win');
                } else {
                    this.result.getChildByName('Label').getComponent(Label).string = '你们队输了！';
                    audioManager.playSound('Lose');
                }
            }
        } else {
            this.result.getChildByName('Label').getComponent(Label).string = '训练结束';
        }

        const messageStr = JSON.stringify({
            type: 'end',
            save_data: this._trainingTime >= 90,
            games: []
        });
        window.parent.postMessage(messageStr, '*');
        console.log('end: ' + messageStr);

        return true;
    }

    update(deltaTime: number) {
        //如果自己是队长，则发送位置
        if (this._isLeader) {
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

    public onEndBtn(): void {
        audioManager.playSound('Button');

        let confirmStr = '确定要结束训练吗？';
        let confirm = instantiate(this.confirmPrefab);
        confirm.getComponent(Confirm).init(this, confirmStr);
        confirm.parent = this.node;
    }

    public onYesBtn(): void {
        gameManager.endRace();
    }
}
