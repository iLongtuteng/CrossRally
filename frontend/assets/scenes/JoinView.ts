import { _decorator, Color, instantiate, Node, Prefab, Sprite, UITransform, Vec3 } from 'cc';
import { gameManager } from '../scripts/game/GameManager';
import { RaceItem } from '../resources/prefabs/RaceItem';
import { TeamItem, TeamItemType } from '../resources/prefabs/TeamItem';
import { FWKMsg } from '../scripts/fwk/mvc/FWKMvc';
import FWKComponent from '../scripts/fwk/FWKComponent';
import { Warn } from '../resources/prefabs/Warn';
import { RaceType } from '../scripts/shared/game/Models/Race';
const { ccclass, property } = _decorator;

@ccclass('JoinView')
export class JoinView extends FWKComponent {

    @property(Node)
    listContent: Node;

    @property(Prefab)
    raceItemPrefab: Prefab;

    @property(Node)
    teamChoose: Node;

    @property(Prefab)
    teamItemPrefab: Prefab;

    @property(Prefab)
    warnPrefab: Prefab;

    @property(Node)
    startView: Node;

    @property(Node)
    block: Node;

    private _raceList: RaceType[] = [];
    private _raceIdx: number = -1;
    private _raceItemArr: Node[] = [];
    private _teamIdx: number = -1;
    private _teamItemArr: Node[] = [];

    onLoad() {
        let yOffset = 0;
        for (let i = 0; i < 5; i++) {
            let teamItem = instantiate(this.teamItemPrefab);
            teamItem.parent = this.teamChoose;
            teamItem.position = new Vec3(0, yOffset, 0);
            yOffset -= teamItem.getComponent(UITransform).height;
            teamItem.getComponent(TeamItem).init(TeamItemType.JOIN, i);
            this._teamItemArr.push(teamItem);
        }
    }

    async onEnable() {
        super.onEnable();

        this.teamChoose.active = false;
        this._raceList = await gameManager.getRaceList();
        this.applyRaceList(this._raceList);
    }

    public applyRaceList(list: RaceType[]): void {
        this.listContent.removeAllChildren();
        this._raceItemArr = [];
        this._raceIdx = -1;

        let yOffset = 0;
        for (let i = 0; i < list.length; i++) {
            let raceItem = instantiate(this.raceItemPrefab);
            raceItem.parent = this.listContent;
            raceItem.position = new Vec3(0, yOffset, 0);
            yOffset -= raceItem.getComponent(UITransform).height;
            raceItem.getComponent(RaceItem).init(i, list[i].name);
            this._raceItemArr.push(raceItem);
        }

        this.listContent.getComponent(UITransform).height = - yOffset;
    }

    public onMsg_RefreshRaceList(msg: FWKMsg<RaceType[]>): boolean {
        this.teamChoose.active = false;
        this._raceList = msg.data;
        this.applyRaceList(this._raceList);

        return true;
    }

    public onMsg_CreatorLeave(msg: FWKMsg<any>): boolean {
        this.block.active = false;

        let warn = instantiate(this.warnPrefab);
        warn.parent = this.node;
        warn.getComponent(Warn).label.string = '创建者已离线，竞赛中止';

        return true;
    }

    public onMsg_RaceItemClicked(msg: FWKMsg<number>): boolean {
        let index: number = msg.data;
        this._raceIdx = index;
        this._raceItemArr.forEach(element => {
            element.getComponent(Sprite).color = new Color().fromHEX('#FFFFFF');
        });
        this._raceItemArr[index].getComponent(Sprite).color = new Color().fromHEX('#5ABDFF');

        this.teamChoose.active = true;
        this.applyTeamChoose((this._raceList[index] as RaceType).teamArr);

        return true;
    }

    private applyTeamChoose(teamArr: number[]): void {
        this._teamItemArr.forEach(element => {
            element.getComponent(TeamItem).joinBtn.interactable = false;
            element.getComponent(TeamItem).joinBtn.getComponent(Sprite).color = new Color().fromHEX('#FFFFFF');
            this._teamIdx = -1;
        });

        teamArr.forEach(element => {
            this._teamItemArr[element].getComponent(TeamItem).joinBtn.interactable = true;
        });
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

    public onReadyBtn(): void {
        if (this._raceIdx < 0) {
            let warn = instantiate(this.warnPrefab);
            warn.parent = this.node;
            warn.getComponent(Warn).label.string = '请加入一个竞赛';
            return;
        }

        if (this._teamIdx < 0) {
            let warn = instantiate(this.warnPrefab);
            warn.parent = this.node;
            warn.getComponent(Warn).label.string = '请加入一个团队';
            return;
        }

        gameManager.joinRace(this._raceList[this._raceIdx].id, this._teamIdx, () => {
            this.block.active = true;

            let warn = instantiate(this.warnPrefab);
            warn.parent = this.node;
            warn.getComponent(Warn).label.string = '请等待游戏开始';
        }, (err) => {
            let warn = instantiate(this.warnPrefab);
            warn.parent = this.node;
            warn.getComponent(Warn).label.string = err;
        });
    }

    public onBackBtn(): void {
        this.startView.active = true;
        this.node.active = false;
    }
}

