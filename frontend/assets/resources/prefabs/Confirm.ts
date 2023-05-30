import { _decorator, Component, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Confirm')
export class Confirm extends Component {

    @property(Label)
    label: Label;

    private _target: any = null;

    public init(target: any, content: string): void {
        this._target = target;
        this.label.string = content;
    }

    public onYesBtn(): void {
        this._target.onYesBtn && this._target.onYesBtn();
        this.node.destroy();
    }

    public onNoBtn(): void {
        this._target.onNoBtn && this._target.onNoBtn();
        this.node.destroy();
    }
}

