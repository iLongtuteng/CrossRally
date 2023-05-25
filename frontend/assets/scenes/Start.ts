import { _decorator, Animation, Button, director, Node } from 'cc';
import { gameManager } from '../scripts/game/GameManager';
import FWKComponent from '../scripts/fwk/FWKComponent';
import { FWKMsg } from '../scripts/fwk/mvc/FWKMvc';
import { GameSystemState } from '../scripts/shared/game/GameSystem';
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
        this.createBtn.interactable = false;
        this.joinBtn.interactable = false;

        gameManager.connect(() => {
            this.createBtn.interactable = true;
            this.joinBtn.interactable = true;
        });
    }

    public onMsg_ReadyEnterRace(msg: FWKMsg<any>): boolean {
        this.node.getComponent(Animation).play();

        return true;
    }

    public enterRace(): void {
        director.loadScene('Game');
    }

    onCreateBtn() {
        this.startView.active = false;
        this.createView.active = true;
    }

    onJoinBtn() {
        this.startView.active = false;
        this.joinView.active = true;
    }
}

