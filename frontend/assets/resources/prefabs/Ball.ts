import { _decorator, Component, RigidBody2D } from 'cc';
const { ccclass, property } = _decorator;

const MOVE_RIGHT = 2;

@ccclass('Ball')
export class Ball extends Component {

    private moveFlags: number = 0;
    private maxSpeed: number = 0;
    private body: RigidBody2D = null;

    onLoad() {
        this.body = this.getComponent(RigidBody2D);
    }

    public setState(maxSpeed: number): void {
        this.maxSpeed = maxSpeed;
        if (maxSpeed <= 0) {
            this.moveFlags &= ~MOVE_RIGHT;
        } else {
            this.moveFlags |= MOVE_RIGHT;
        }
    }

    private updateMotorSpeed(): void {
        if (!this.body)
            return;

        var desiredSpeed = 0;
        if ((this.moveFlags & MOVE_RIGHT) == MOVE_RIGHT)
            desiredSpeed = -this.maxSpeed;
        this.body.angularVelocity = desiredSpeed;
    }

    update(deltaTime: number) {
        if (this.moveFlags) {
            this.updateMotorSpeed();
        }
    }
}

