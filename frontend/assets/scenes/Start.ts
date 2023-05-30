import { _decorator, Animation, Button, director, Node } from 'cc';
import { gameManager } from '../scripts/game/GameManager';
import FWKComponent from '../scripts/fwk/FWKComponent';
import { FWKMsg } from '../scripts/fwk/mvc/FWKMvc';
import { DEV } from 'cc/env';
const { ccclass, property } = _decorator;

@ccclass('Start')
export class Start extends FWKComponent {

    @property(Node)
    startView: Node;

    @property(Node)
    createView: Node;

    @property(Node)
    joinView: Node;

    @property(Button)
    createBtn: Button;

    @property(Button)
    joinBtn: Button;

    onLoad() {
        window.addEventListener('message', this._onMessage);

        const messageStr = JSON.stringify({
            type: 'loaded'
        });
        window.parent.postMessage(messageStr, '*');
        console.log('loaded: ' + messageStr);

        this.createBtn.interactable = false;
        this.joinBtn.interactable = false;

        if (DEV) {
            gameManager.initClient();
            gameManager.connect(() => {
                this.createBtn.interactable = true;
                this.joinBtn.interactable = true;
            });
        }
    }

    onDestroy() {
        window.removeEventListener('message', this._onMessage);
    }

    private _onMessage(e): void {
        let obj = JSON.parse(e.data);

        if (obj.type == 'is_ready') {
            console.log('obj.type == "is_ready"');
            if (obj.delay != null) {
                console.log('obj.delay: ' + obj.delay);
                gameManager.delayTime = obj.delay - 3000;
            }

            if (obj.value != null) {
                console.log('obj.value: ' + obj.value);
                gameManager.isHardware = obj.value;
            }

            if (obj.host != null) {
                console.log('obj.host: ' + obj.host);
                gameManager.initClient(obj.host);
                gameManager.connect(() => {
                    this.createBtn.interactable = true;
                    this.joinBtn.interactable = true;
                });
            }
        }
    }

    public onMsg_ReadyEnterRace(msg: FWKMsg<any>): boolean {
        this.node.getComponent(Animation).play();
        this._startTraining();

        return true;
    }

    private _startTraining(): void {
        if (gameManager.isHardware) {
            const messageStr = JSON.stringify({
                type: 'start',
                value: gameManager.difficulty
            });
            window.parent.postMessage(messageStr, '*');
            console.log('start: ' + messageStr);
        }
    }

    public enterRace(): void {
        director.loadScene('Game');
    }

    public onCreateBtn(): void {
        this.startView.active = false;
        this.createView.active = true;
    }

    public onJoinBtn(): void {
        this.startView.active = false;
        this.joinView.active = true;
    }
}

