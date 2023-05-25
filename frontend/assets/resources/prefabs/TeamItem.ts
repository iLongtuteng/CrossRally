import { _decorator, Button, Component, Label, Toggle } from 'cc';
import GameMsgs from '../../scripts/game/GameMsgs';
const { ccclass, property } = _decorator;

export enum TeamItemType {
    CREATE = 1,
    JOIN
}

@ccclass('TeamItem')
export class TeamItem extends Component {

    @property(Toggle)
    toggle: Toggle;

    @property(Label)
    nameLbl: Label;

    @property(Button)
    joinBtn: Button;

    private _index: number = 0;

    public init(type: TeamItemType, index: number): void {
        this._index = index;
        this.nameLbl.string = '第' + (index + 1) + '队';
        this.toggle.node.active = type == TeamItemType.CREATE ? true : false;
        this.toggle.isChecked = false;
        this.joinBtn.interactable = false;
    }

    onToggle(toggle: Toggle) {
        if (toggle.isChecked) {
            this.joinBtn.interactable = true;
            GameMsgs.send<number>(GameMsgs.Names.TeamToggleChecked, this._index);
        } else {
            this.joinBtn.interactable = false;
            GameMsgs.send<number>(GameMsgs.Names.TeamToggleUnchecked, this._index);
        }
    }

    onJoinBtn() {
        GameMsgs.send<number>(GameMsgs.Names.TeamJoinBtnClicked, this._index);
    }
}

