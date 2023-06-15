import { _decorator, Animation, assert, AudioSource, Button, director, find, instantiate, Node, Prefab, resources, SpriteFrame } from 'cc';
import { DEV } from 'cc/env';
import FWKComponent from '../../fwk/FWKComponent';
import { FWKMsg } from '../../fwk/mvc/FWKMvc';
import { gameManager } from '../GameManager';
import { audioManager } from '../AudioManager';
import { Warn } from '../prefabs/Warn';
const { ccclass, property } = _decorator;

@ccclass('Start')
export class Start extends FWKComponent {

    @property(Node)
    adviserView: Node;

    @property(Node)
    patientView: Node;

    @property(Button)
    easyBtn: Button;

    @property(Button)
    normalBtn: Button;

    @property(Button)
    hardBtn: Button;

    @property(Button)
    startBtn: Button;

    @property(Node)
    countAnim: Node;

    @property(Prefab)
    warnPrefab: Prefab;

    private _difficulty: number = 1;

    onLoad() {
        resources.load('textures/BtnGreenNormal/spriteFrame', SpriteFrame, (err, res) => {
            if (err) {
                console.log(err);
            } else {
                gameManager.greenSprite = res;
            }
        });
        resources.load('textures/BtnBlue/spriteFrame', SpriteFrame, (err, res) => {
            if (err) {
                console.log(err);
            } else {
                gameManager.blueSprite = res;
            }
        });

        if (!director.isPersistRootNode(find('AudioNode'))) {
            director.addPersistRootNode(find('AudioNode'));
            let audioSource = find('AudioNode').getComponent(AudioSource);
            assert(audioSource);
            audioManager.init(audioSource);
        }

        window.addEventListener('message', this._onMessage.bind(this));

        const messageStr = JSON.stringify({
            type: 'loaded'
        });
        window.parent.postMessage(messageStr, '*');
        console.log('loaded: ' + messageStr);

        this.startBtn.interactable = false;

        if (DEV) {
            gameManager.isAdviser = true;
            // gameManager.isAdviser = false;

            if (gameManager.isAdviser) {
                this.adviserView.active = true;
                this.patientView.active = false;
            } else {
                this.adviserView.active = false;
                this.patientView.active = true;
            }

            gameManager.initClient();
            gameManager.connect(() => {
                gameManager.login(() => {
                    this.startBtn.interactable = true;

                    let teamArr = [];
                    for (let i = 0; i < 2; i++) {
                        teamArr.push(i);
                    }
                    gameManager.updateTeams(teamArr, () => {
                        if (gameManager.isAdviser) {
                            gameManager.joinRace();
                        } else {
                            let teamIdx = 0;
                            // let teamIdx = 1;
                            gameManager.joinRace(teamIdx, () => { }, (err) => {
                                let warn = instantiate(this.warnPrefab);
                                warn.parent = this.node;
                                warn.getComponent(Warn).label.string = err;
                            });
                        }
                    });
                });
            });

            gameManager.delayTime = 2000;
        }
    }

    onDestroy() {
        window.removeEventListener('message', this._onMessage.bind(this));
    }

    private _onMessage(e: MessageEvent): void {
        let obj = JSON.parse(e.data);

        if (obj.type == 'is_ready') {
            console.log('obj.type == "is_ready"');

            if (obj.is_adviser != null) {
                console.log('obj.is_adviser: ' + obj.is_adviser);
                gameManager.isAdviser = obj.is_adviser;

                if (gameManager.isAdviser) {
                    this.adviserView.active = true;
                    this.patientView.active = false;

                    this.scheduleOnce(() => {
                        this._refreshDiff(this._difficulty);
                    }, 0.2);
                } else {
                    this.adviserView.active = false;
                    this.patientView.active = true;
                }
            } else {
                this.adviserView.active = false;
                this.patientView.active = true;
            }

            if (obj.host != null) {
                console.log('obj.host: ' + obj.host);
                gameManager.initClient(obj.host);
                gameManager.connect(() => {
                    gameManager.login(() => {
                        this.startBtn.interactable = true;

                        if (obj.teamLen != null) {
                            console.log('obj.teamLen: ' + obj.teamLen);
                            let teamArr = [];
                            for (let i = 0; i < obj.teamLen; i++) {
                                teamArr.push(i);
                            }
                            gameManager.updateTeams(teamArr, () => {
                                if (gameManager.isAdviser) {
                                    gameManager.joinRace();
                                } else {
                                    if (obj.teamIdx != null) {
                                        console.log('obj.teamIdx: ' + obj.teamIdx);
                                        gameManager.joinRace(obj.teamIdx, () => { }, (err) => {
                                            let warn = instantiate(this.warnPrefab);
                                            warn.parent = this.node;
                                            warn.getComponent(Warn).label.string = err;
                                        });
                                    }
                                }
                            });
                        }
                    });
                });
            }

            if (obj.delay != null) {
                console.log('obj.delay: ' + obj.delay);
                gameManager.delayTime = obj.delay - 3000;
            }
        }

        if (obj.type == 'stop') {
            console.log('obj.type == "stop"');
            if (gameManager.isAdviser) {
                gameManager.endRace();
            }
        }
    }

    public onEasyBtn(): void {
        audioManager.playSound('Button');
        this._difficulty = 0;
        this._refreshDiff(this._difficulty);
    }

    public onNormalBtn(): void {
        audioManager.playSound('Button');
        this._difficulty = 1;
        this._refreshDiff(this._difficulty);
    }

    public onHardBtn(): void {
        audioManager.playSound('Button');
        this._difficulty = 2;
        this._refreshDiff(this._difficulty);
    }

    private _refreshDiff(num: number): void {
        switch (num) {
            case 0:
                this.easyBtn.getComponent(Button).normalSprite = gameManager.blueSprite;
                this.easyBtn.getComponent(Button).hoverSprite = gameManager.blueSprite;
                this.normalBtn.getComponent(Button).normalSprite = gameManager.greenSprite;
                this.normalBtn.getComponent(Button).hoverSprite = gameManager.greenSprite;
                this.hardBtn.getComponent(Button).normalSprite = gameManager.greenSprite;
                this.hardBtn.getComponent(Button).hoverSprite = gameManager.greenSprite;
                break;

            case 1:
                this.easyBtn.getComponent(Button).normalSprite = gameManager.greenSprite;
                this.easyBtn.getComponent(Button).hoverSprite = gameManager.greenSprite;
                this.normalBtn.getComponent(Button).normalSprite = gameManager.blueSprite;
                this.normalBtn.getComponent(Button).hoverSprite = gameManager.blueSprite;
                this.hardBtn.getComponent(Button).normalSprite = gameManager.greenSprite;
                this.hardBtn.getComponent(Button).hoverSprite = gameManager.greenSprite;
                break;

            case 2:
                this.easyBtn.getComponent(Button).normalSprite = gameManager.greenSprite;
                this.easyBtn.getComponent(Button).hoverSprite = gameManager.greenSprite;
                this.normalBtn.getComponent(Button).normalSprite = gameManager.greenSprite;
                this.normalBtn.getComponent(Button).hoverSprite = gameManager.greenSprite;
                this.hardBtn.getComponent(Button).normalSprite = gameManager.blueSprite;
                this.hardBtn.getComponent(Button).hoverSprite = gameManager.blueSprite;
                break;

            default:
                break;
        }
    }

    public onStartBtn(): void {
        audioManager.playSound('Button');

        gameManager.startRace(this._difficulty);
        this.startBtn.interactable = false;
    }

    public onMsg_ReadyEnterRace(msg: FWKMsg<any>): boolean {
        this.countAnim.active = true;
        this.node.getComponent(Animation).play();

        const messageStr = JSON.stringify({
            type: 'start',
            value: gameManager.difficulty
        });
        window.parent.postMessage(messageStr, '*');
        console.log('start: ' + messageStr);

        return true;
    }

    public enterRace(): void {
        director.loadScene('Game');
    }
}

