import { _decorator, Component, EventTouch, Input, Label, Node } from 'cc';
import GameMsgs from '../../scripts/game/GameMsgs';
const { ccclass, property } = _decorator;

@ccclass('RaceItem')
export class RaceItem extends Component {

    @property(Label)
    nameLbl: Label;

    private _index: number = 0;

    onLoad() {
        this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onDestroy() {
        this.node.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onTouchEnd(event: EventTouch) {
        GameMsgs.send<number>(GameMsgs.Names.RaceItemClicked, this._index);
    }

    public init(index: number, name: string): void {
        this._index = index;
        this.nameLbl.string = name;
    }
}

