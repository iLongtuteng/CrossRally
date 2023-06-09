import { _decorator, Button, EditBox, instantiate, Node, Prefab, SpriteFrame, UITransform, Vec3 } from 'cc';
import { gameManager } from '../scripts/game/GameManager';
import { Warn } from '../resources/prefabs/Warn';
import { TeamItem, TeamItemType } from '../resources/prefabs/TeamItem';
import { FWKMsg } from '../scripts/fwk/mvc/FWKMvc';
import FWKComponent from '../scripts/fwk/FWKComponent';
import { Start } from './Start';
import { audioManager } from '../scripts/game/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('CreateView')
export class CreateView extends FWKComponent {

    @property(Node)
    startView: Node;

    @property(Prefab)
    warnPrefab: Prefab;

    @property(EditBox)
    nameBox: EditBox;

    @property(Button)
    easyBtn: Button;

    @property(Button)
    normalBtn: Button;

    @property(Button)
    hardBtn: Button;

    @property(Node)
    teamChoose: Node;

    @property(Prefab)
    teamItemPrefab: Prefab;

    @property(Node)
    block: Node;

    @property(Button)
    startBtn: Button;

    private _difficulty: number = 1;
    private _teamArr: number[] = [];
    private _teamIdx: number = -1;
    private _teamItemArr: Node[] = [];
    private _greenSprite: SpriteFrame = null;
    private _blueSprite: SpriteFrame = null;

    onLoad() {
        this.startBtn.interactable = false;

        this._greenSprite = this.node.parent.getComponent(Start).greenSprite;
        this._blueSprite = this.node.parent.getComponent(Start).blueSprite;
        this.onNormalBtn();

        let yOffset = 0;
        for (let i = 0; i < 5; i++) {
            let teamItem = instantiate(this.teamItemPrefab);
            teamItem.parent = this.teamChoose;
            teamItem.position = new Vec3(125, yOffset, 0);
            yOffset -= teamItem.getComponent(UITransform).height;
            teamItem.getComponent(TeamItem).init(TeamItemType.CREATE, i);
            this._teamItemArr.push(teamItem);
        }

        this._teamIdx = 0;
        this._teamArr = [this._teamIdx];
        this._teamItemArr[this._teamIdx].getComponent(TeamItem).toggle.isChecked = true;
        this._teamItemArr[this._teamIdx].getComponent(TeamItem).joinBtn.interactable = true;
        this._teamItemArr[this._teamIdx].getComponent(TeamItem).joinBtn.getComponent(Button).normalSprite = this._blueSprite;
        this._teamItemArr[this._teamIdx].getComponent(TeamItem).joinBtn.getComponent(Button).hoverSprite = this._blueSprite;
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
                this.easyBtn.getComponent(Button).normalSprite = this._blueSprite;
                this.easyBtn.getComponent(Button).hoverSprite = this._blueSprite;
                this.normalBtn.getComponent(Button).normalSprite = this._greenSprite;
                this.normalBtn.getComponent(Button).hoverSprite = this._greenSprite;
                this.hardBtn.getComponent(Button).normalSprite = this._greenSprite;
                this.hardBtn.getComponent(Button).hoverSprite = this._greenSprite;
                break;

            case 1:
                this.easyBtn.getComponent(Button).normalSprite = this._greenSprite;
                this.easyBtn.getComponent(Button).hoverSprite = this._greenSprite;
                this.normalBtn.getComponent(Button).normalSprite = this._blueSprite;
                this.normalBtn.getComponent(Button).hoverSprite = this._blueSprite;
                this.hardBtn.getComponent(Button).normalSprite = this._greenSprite;
                this.hardBtn.getComponent(Button).hoverSprite = this._greenSprite;
                break;

            case 2:
                this.easyBtn.getComponent(Button).normalSprite = this._greenSprite;
                this.easyBtn.getComponent(Button).hoverSprite = this._greenSprite;
                this.normalBtn.getComponent(Button).normalSprite = this._greenSprite;
                this.normalBtn.getComponent(Button).hoverSprite = this._greenSprite;
                this.hardBtn.getComponent(Button).normalSprite = this._blueSprite;
                this.hardBtn.getComponent(Button).hoverSprite = this._blueSprite;
                break;

            default:
                break;
        }
    }

    public onMsg_TeamToggleChecked(msg: FWKMsg<number>): boolean {
        let index: number = msg.data;

        let i = this._teamArr.indexOf(index);
        if (i < 0) {
            this._teamArr.push(index);
            this._teamArr.sort(this.sortItem);
        }

        return true;
    }

    sortItem(a, b) {
        return a - b;
    }

    public onMsg_TeamToggleUnchecked(msg: FWKMsg<number>): boolean {
        let index: number = msg.data;

        let i = this._teamArr.indexOf(index);
        if (i >= 0) {
            this._teamArr.splice(i, 1);
        }

        if (this._teamIdx == index) {
            this._teamIdx = -1;
            this._teamItemArr[index].getComponent(TeamItem).joinBtn.getComponent(Button).normalSprite = this._greenSprite;
            this._teamItemArr[index].getComponent(TeamItem).joinBtn.getComponent(Button).hoverSprite = this._greenSprite;
        }

        return true;
    }

    public onMsg_TeamJoinBtnClicked(msg: FWKMsg<number>): boolean {
        let index: number = msg.data;
        this._teamIdx = index;
        this._teamItemArr.forEach(element => {
            element.getComponent(TeamItem).joinBtn.getComponent(Button).normalSprite = this._greenSprite;
            element.getComponent(TeamItem).joinBtn.getComponent(Button).hoverSprite = this._greenSprite;
        });
        this._teamItemArr[index].getComponent(TeamItem).joinBtn.getComponent(Button).normalSprite = this._blueSprite;
        this._teamItemArr[index].getComponent(TeamItem).joinBtn.getComponent(Button).hoverSprite = this._blueSprite;

        return true;
    }

    public onCreateBtn(): void {
        audioManager.playSound('Button');

        if (this.nameBox.textLabel.string == '') {
            let warn = instantiate(this.warnPrefab);
            warn.parent = this.node;
            warn.getComponent(Warn).label.string = '请输入竞赛名称';
            return;
        }

        if (this._teamArr.length == 0) {
            let warn = instantiate(this.warnPrefab);
            warn.parent = this.node;
            warn.getComponent(Warn).label.string = '请开放上场团队';
            return;
        }

        if (this._teamIdx < 0) {
            let warn = instantiate(this.warnPrefab);
            warn.parent = this.node;
            warn.getComponent(Warn).label.string = '请加入一个团队';
            return;
        }

        gameManager.createRace(this.nameBox.textLabel.string, this._teamArr, this._difficulty, this._teamIdx, () => {
            this.startBtn.interactable = true;
            this.block.active = true;
        }, (err) => {
            let warn = instantiate(this.warnPrefab);
            warn.parent = this.node;
            warn.getComponent(Warn).label.string = err;
        });
    }

    public onStartBtn(): void {
        audioManager.playSound('Button');

        gameManager.readyRace(() => {
            this.startBtn.interactable = false;
        });

    }

    public onBackBtn(): void {
        audioManager.playSound('Button');
        this.startView.active = true;
        this.node.active = false;
    }
}

