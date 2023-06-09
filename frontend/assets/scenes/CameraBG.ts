import { _decorator, Component, Node, UITransform, Vec3, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraBG')
export class CameraBG extends Component {

    public ball: Node = null;

    lateUpdate(deltaTime: number) {
        if (!this.ball) return;

        let worldPos = this.ball.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);
        let ratio = worldPos.y / view.getDesignResolutionSize().height;
        this.node.position = new Vec3(this.node.position.x, this.node.position.y, 700 * (1 + (ratio - 0.5) * 0.2));
        // console.log('camera position: ' + this.node.position);
    }
}

