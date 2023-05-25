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
    teamChoose: Node;

    @property(Prefab)
    teamItemPrefab: Prefab;

    @property(Prefab)
    warnPrefab: Prefab;

    @property(EditBox)
    nameBox: EditBox;

    @property(Node)
    startView: Node;

    @property(Node)
    block: Node;

    @property(Button)
    startBtn: Button;

    private _teamArr: number[] = [];
    private _teamIdx: number = -1;
    private _teamItemArr: Node[] = [];
    private _winDis: number = 50;

    onLoad() {
        this.startBtn.interactable = false;

        let yOffset = 0;
        for (let i = 0; i < 5; i++) {
            let teamItem = instantiate(this.teamItemPrefab);
            teamItem.parent = this.teamChoose;
            teamItem.position = new Vec3(100, yOffset, 0);
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

    update(deltaTime: number) {

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

    onCreateBtn() {
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

        gameManager.createRace(this.nameBox.textLabel.string, this._teamArr, this._teamIdx, this._winDis, () => {
            this.startBtn.interactable = true;
            this.block.active = true;
        }, (err) => {
            let warn = instantiate(this.warnPrefab);
            warn.parent = this.node;
            warn.getComponent(Warn).label.string = err;
        });
    }

    onStartBtn() {
        gameManager.readyRace(() => {
            this.startBtn.interactable = false;
        });
    }

    onBackBtn() {
        this.startView.active = true;
        this.node.active = false;
    }
}

