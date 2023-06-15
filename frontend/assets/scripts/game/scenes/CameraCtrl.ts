import { _decorator, Component, Node, UITransform, Vec3, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraCtrl')
export class CameraCtrl extends Component {

    public ball: Node = null;

    lateUpdate(deltaTime: number) {
        if (!this.ball) return;

        let worldPos = this.ball.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);
        let nodePos = this.node.parent.getComponent(UITransform).convertToNodeSpaceAR(worldPos);
        let ratio = worldPos.y / view.getDesignResolutionSize().height;
        this.node.position = new Vec3(nodePos.x, nodePos.y, 700 * (1 + (ratio - 0.5) * 0.8));
        // console.log('camera position: ' + this.node.position);
    }
}

