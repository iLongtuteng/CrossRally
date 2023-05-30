import { _decorator, Button, Color, EditBox, instantiate, Node, Prefab, Sprite, UITransform, Vec3 } from 'cc';
import { gameManager } from '../scripts/game/GameManager';
import { Warn } from '../resources/prefabs/Warn';
import { TeamItem, TeamItemType } from '../resources/prefabs/TeamItem';
import { FWKMsg } from '../scripts/fwk/mvc/FWKMvc';
import FWKComponent from '../scripts/fwk/FWKComponent';
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

    onLoad() {
        this.startBtn.interactable = false;
        this.onNormalBtn();

        let yOffset = 0;
        for (let i = 0; i < 5; i++) {
            let teamItem = instantiate(this.teamItemPrefab);
            teamItem.parent = this.teamChoose;
            teamItem.position = new Vec3(80, yOffset, 0);
            yOffset -= teamItem.getComponent(UITransform).height;
            teamItem.getComponent(TeamItem).init(TeamItemType.CREATE, i);
            this._teamItemArr.push(teamItem);
        }

        this._teamIdx = 0;
        this._teamArr = [this._teamIdx];
        this._teamItemArr[this._teamIdx].getComponent(TeamItem).toggle.isChecked = true;
        this._teamItemArr[this._teamIdx].getComponent(TeamItem).joinBtn.interactable = true;
        this._teamItemArr[this._teamIdx].getComponent(TeamItem).joinBtn.getComponent(Sprite).color = new Color().fromHEX('#5ABDFF');
    }

    public onEasyBtn(): void {
        this._difficulty = 0;
        this._refreshDiff(this._difficulty);
    }

    public onNormalBtn(): void {
        this._difficulty = 1;
        this._refreshDiff(this._difficulty);
    }

    public onHardBtn(): void {
        this._difficulty = 2;
        this._refreshDiff(this._difficulty);
    }

    private _refreshDiff(num: number): void {
        switch (num) {
            case 0:
                this.easyBtn.getComponent(Sprite).color = new Color().fromHEX("#5ABDFF");
                this.normalBtn.getComponent(Sprite).color = new Color().fromHEX('#FFFFFF');
                this.hardBtn.getComponent(Sprite).color = new Color().fromHEX("#FFFFFF");
                break;

            case 1:
                this.easyBtn.getComponent(Sprite).color = new Color().fromHEX("#FFFFFF");
                this.normalBtn.getComponent(Sprite).color = new Color().fromHEX('#5ABDFF');
                this.hardBtn.getComponent(Sprite).color = new Color().fromHEX("#FFFFFF");
                break;

            case 2:
                this.easyBtn.getComponent(Sprite).color = new Color().fromHEX("#FFFFFF");
                this.normalBtn.getComponent(Sprite).color = new Color().fromHEX('#FFFFFF');
                this.hardBtn.getComponent(Sprite).color = new Color().fromHEX("#5ABDFF");
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
            this._teamItemArr[index].getComponent(TeamItem).joinBtn.getComponent(Sprite).color = new Color().fromHEX('#FFFFFF');
        }

        return true;
    }

    public onMsg_TeamJoinBtnClicked(msg: FWKMsg<number>): boolean {
        let index: number = msg.data;
        this._teamIdx = index;
        this._teamItemArr.forEach(element => {
            element.getComponent(TeamItem).joinBtn.getComponent(Sprite).color = new Color().fromHEX('#FFFFFF');
        });
        this._teamItemArr[index].getComponent(TeamItem).joinBtn.getComponent(Sprite).color = new Color().fromHEX('#5ABDFF');

        return true;
    }

    public onCreateBtn(): void {
        if (this.nameBox.textLabel.string == '') {
            let warn = instantiate(this.warnPrefab);
            warn.parent = this.node;
            warn.getComponent(Warn).label.string = '请输入竞赛名称';
            return;
        }

        if (this._teamArr.length == 0) {
            let warn = instantiate(this.warnPrefab);
            warn.parent = this.node;
            warn.getComponent(Warn).label.string = '请选择上场团队';
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
        gameManager.readyRace(() => {
            this.startBtn.interactable = false;
        });
    }

    public onBackBtn(): void {
        this.startView.active = true;
        this.node.active = false;
    }
}

