import { _decorator, Component, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Warn')
export class Warn extends Component {

    @property(Label)
    label: Label;

    destroyNode() {
        this.node.destroy();
    }
}

