import { _decorator, Component, Label, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Rank')
export class Rank extends Component {

    @property(Label)
    label: Label;

    public ball: Node = null;

    update(deltaTime: number) {
        if (!this.ball) return;

        this.node.position = new Vec3(this.ball.position.x, this.ball.position.y + 60, 0);
    }
}

