import { _decorator, Button, Component, Label } from 'cc';
import { audioManager } from '../AudioManager';
import GameMsgs from '../GameMsgs';
const { ccclass, property } = _decorator;

@ccclass('Team')
export class Team extends Component {

    @property(Label)
    nameLbl: Label;

    @property(Button)
    teamBtn: Button;

    private _key: number = 0;

    public init(key: number): void {
        this._key = key;
        this.nameLbl.string = (key + 1) + '队';
    }

    public onTeamBtn(): void {
        audioManager.playSound('Button');
        GameMsgs.send<number>(GameMsgs.Names.TeamBtnClicked, this._key);
    }
}

