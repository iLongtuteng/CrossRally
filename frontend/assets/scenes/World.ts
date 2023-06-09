import { _decorator, Component, Node, PolygonCollider2D, RigidBody2D, ERigidBody2DType, Vec2, Vec3, Graphics, Layers } from 'cc';
import { Hill } from '../scripts/shared/game/Models/Race';
import { gameManager } from '../scripts/game/GameManager';
import { gameConfig } from '../scripts/shared/game/GameConfig';
const { ccclass, property } = _decorator;

export interface hillPiece {
    node: Node,
    collider: PolygonCollider2D
}

@ccclass('World')
export class World extends Component {

    @property(Node)
    startNode: Node;

    @property(Node)
    finishNode: Node;

    public ball: Node = null;

    private xOffset: number = 0;
    private hills: hillPiece[] = [];
    private hillArr: Hill[] = [];

    onLoad() {
        this.hillArr.push(...gameManager.hillArr);

        while (this.xOffset < 1200) {
            this.generateHill();
        }
    }

    private generateHillPiece(xOffset: number, points: Vec2[]): void {
        if (xOffset >= 640 && xOffset < 640 + gameConfig.pixelStep) {
            this.startNode.position = new Vec3(xOffset, points[1].y + 50, 0);
        }
        if (xOffset >= 640 + gameManager.winDis * gameConfig.disUnit && xOffset < 640 + gameConfig.pixelStep + gameManager.winDis * gameConfig.disUnit) {
            this.finishNode.position = new Vec3(xOffset, points[1].y + 50, 0);
        }

        let hills = this.hills;

        let first = hills[0];
        if (first && this.ball && (this.ball.position.x - first.node.position.x > 1000)) {
            first.node.position = new Vec3(xOffset, first.node.position.y, first.node.position.z);
            first.collider.points = points;
            first.collider.apply();

            let g = first.node.getComponent(Graphics);
            g.clear();
            g.fillColor.fromHEX('#8C5F35');
            g.moveTo(points[0].x, points[0].y - 240);
            g.lineTo(points[1].x, points[1].y);
            g.lineTo(points[2].x, points[2].y);
            g.lineTo(points[3].x, points[3].y - 240);
            g.fill();
            g.fillColor.fromHEX('#824F1E');
            g.moveTo(points[0].x, points[1].y - 18);
            g.lineTo(points[1].x, points[1].y);
            g.lineTo(points[2].x, points[2].y);
            g.lineTo(points[3].x, points[2].y - 18);
            g.fill();
            g.fillColor.fromHEX('#357E32');
            g.moveTo(points[0].x, points[1].y - 10);
            g.lineTo(points[1].x, points[1].y);
            g.lineTo(points[2].x, points[2].y);
            g.lineTo(points[3].x, points[2].y - 10);
            g.fill();

            hills.push(hills.shift());
            return;
        }

        let node = new Node();
        node.position = new Vec3(xOffset, 0, 0);
        node.layer = 1 << Layers.nameToLayer('canvas_5');

        let body = node.addComponent(RigidBody2D);
        body.type = ERigidBody2DType.Static;

        let collider = node.addComponent(PolygonCollider2D);
        collider.points = points;
        collider.friction = 1;

        let g = node.addComponent(Graphics);
        g.fillColor.fromHEX('#8C5F35');
        g.moveTo(points[0].x, points[0].y - 240);
        g.lineTo(points[1].x, points[1].y);
        g.lineTo(points[2].x, points[2].y);
        g.lineTo(points[3].x, points[3].y - 240);
        g.fill();
        g.fillColor.fromHEX('#824F1E');
        g.moveTo(points[0].x, points[1].y - 18);
        g.lineTo(points[1].x, points[1].y);
        g.lineTo(points[2].x, points[2].y);
        g.lineTo(points[3].x, points[2].y - 18);
        g.fill();
        g.fillColor.fromHEX('#357E32');
        g.moveTo(points[0].x, points[1].y - 10);
        g.lineTo(points[1].x, points[1].y);
        g.lineTo(points[2].x, points[2].y);
        g.lineTo(points[3].x, points[2].y - 10);
        g.fill();

        node.parent = this.node;

        hills.push({ node: node, collider: collider });
    }

    generateHill() {
        let hill: Hill = this.hillArr.shift();

        let xOffset = this.xOffset;
        let yOffset = hill.yOffset;
        let hillWidth = hill.width;
        let numberOfSlices = hillWidth / gameConfig.pixelStep;

        // first step
        let j;
        let randomHeight;

        randomHeight = hill.height1;

        yOffset += randomHeight;

        for (j = 0; j < numberOfSlices / 2; j++) {
            let points = [];
            points.push(new Vec2(0, 0));
            points.push(new Vec2(0, yOffset - randomHeight * Math.cos(2 * Math.PI / numberOfSlices * j)));
            points.push(new Vec2(gameConfig.pixelStep, yOffset - randomHeight * Math.cos(2 * Math.PI / numberOfSlices * (j + 1))));
            points.push(new Vec2(gameConfig.pixelStep, 0));

            this.generateHillPiece(xOffset + j * gameConfig.pixelStep, points);
        }

        yOffset += randomHeight;

        // second step
        randomHeight = hill.height2;

        yOffset -= randomHeight;

        for (j = numberOfSlices / 2; j < numberOfSlices; j++) {
            let points = [];
            points.push(new Vec2(0, 0));
            points.push(new Vec2(0, yOffset - randomHeight * Math.cos(2 * Math.PI / numberOfSlices * j)));
            points.push(new Vec2(gameConfig.pixelStep, yOffset - randomHeight * Math.cos(2 * Math.PI / numberOfSlices * (j + 1))));
            points.push(new Vec2(gameConfig.pixelStep, 0));

            this.generateHillPiece(xOffset + j * gameConfig.pixelStep, points);
        }

        yOffset -= randomHeight;

        this.xOffset += hillWidth;
    }

    update(deltaTime: number) {
        if (!this.ball) return;

        if (this.hillArr.length <= 1) {
            this.hillArr.push(...gameManager.hillArr);
        }

        while (this.ball.position.x + 1200 > this.xOffset) {
            this.generateHill();
        }
    }
}

