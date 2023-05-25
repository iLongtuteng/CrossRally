import { _decorator, Component, Node, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Battery')
export class Battery extends Component {

    @property(Node)
    hs1: Node;

    @property(Node)
    hs2: Node;

    @property(Node)
    hs3: Node;

    public setState(heartState: number): void {
        switch (heartState) {
            case 0:
                this.hs1.getComponent(UIOpacity).opacity = 255;
                this.hs2.getComponent(UIOpacity).opacity = 0;
                this.hs3.getComponent(UIOpacity).opacity = 0;
                break;

            case 1:
                this.hs1.getComponent(UIOpacity).opacity = 0;
                this.hs2.getComponent(UIOpacity).opacity = 255;
                this.hs3.getComponent(UIOpacity).opacity = 0;
                break;

            case 2:
                this.hs1.getComponent(UIOpacity).opacity = 0;
                this.hs2.getComponent(UIOpacity).opacity = 0;
                this.hs3.getComponent(UIOpacity).opacity = 255;
                break;

            default:
                this.hs1.getComponent(UIOpacity).opacity = 255;
                this.hs2.getComponent(UIOpacity).opacity = 0;
                this.hs3.getComponent(UIOpacity).opacity = 0;
                break;
        }
    }
}

