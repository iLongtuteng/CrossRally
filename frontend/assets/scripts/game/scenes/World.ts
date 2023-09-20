import { _decorator, Component, Node, PolygonCollider2D, RigidBody2D, ERigidBody2DType, Vec2, Vec3, Graphics, Layers, Prefab, Label, instantiate } from 'cc';
import { gameManager } from '../GameManager';
import { gameConfig } from '../../shared/game/GameConfig';
const { ccclass, property } = _decorator;

export interface Hill {
    yOffset: number,
    width: number,
    height1: number,
    height2: number
}

export interface hillPiece {
    node: Node,
    collider: PolygonCollider2D
}

@ccclass('World')
export class World extends Component {

    @property(Prefab)
    signPrefab: Prefab;

    @property(Node)
    signs: Node;

    public ball: Node = null;

    private _totalWidth: number = 0;
    private _xOffset: number = -360;
    private _hillIdx: number = 0;
    private _hills: hillPiece[] = [];
    private _signs: Node[] = [];

    onLoad() {
        for (let hill of gameManager.hillArr) {
            this._totalWidth += hill.width;
        }

        while (this._xOffset < 1640) {
            this._generateHill();
        }
    }

    public resetHill(): void {
        this._xOffset = -360;
        this._hillIdx = 0;
        this._xOffset += this._totalWidth * Math.floor(this.ball.position.x / this._totalWidth); //小球运动距离等于地形xOffset的增量

        while ((this._xOffset + gameManager.hillArr[this._hillIdx].width) <= this.ball.position.x + 640 - 1000) {
            this._xOffset += gameManager.hillArr[this._hillIdx].width;
            this._hillIdx++;
        }

        this.node.removeAllChildren();
        this.signs.removeAllChildren();
    }

    private _generateHillPiece(xOffset: number, points: Vec2[]): void {
        let first = this._hills[0];
        if (first && this.ball && (this.ball.position.x + 640 - first.node.position.x > 1000)) {
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

            if (!first.node.isChildOf(this.node)) {
                first.node.parent = this.node;
            }

            this._hills.push(this._hills.shift());
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

        this._hills.push({ node: node, collider: collider });
    }

    private _generateSign(xOffset: number, points: Vec2[]): void {
        let firstSign = this._signs[0];
        if (firstSign && this.ball && (this.ball.position.x + 640 - firstSign.position.x > 1000)) {
            firstSign.position = new Vec3(xOffset, points[1].y + 50, 0);
            let distance = gameManager.winDis * gameConfig.disUnit - (xOffset - 640);
            if (distance == 0) {
                firstSign.getChildByName('Label').getComponent(Label).string = 'FINISH!';
            } else {
                firstSign.getChildByName('Label').getComponent(Label).string = distance / 100 + 'm';
            }

            if (!firstSign.isChildOf(this.signs)) {
                firstSign.parent = this.signs;
            }

            this._signs.push(this._signs.shift());
            return;
        }

        let sign = instantiate(this.signPrefab);
        sign.position = new Vec3(xOffset, points[1].y + 50, 0);
        let distance = gameManager.winDis * gameConfig.disUnit - (xOffset - 640);
        if (distance == 0) {
            sign.getChildByName('Label').getComponent(Label).string = 'FINISH!';
        } else {
            sign.getChildByName('Label').getComponent(Label).string = distance / 100 + 'm';
        }
        sign.parent = this.signs;
        this._signs.push(sign);
    }

    private _generateHill(): void {
        let hill: Hill = gameManager.hillArr[this._hillIdx];
        this._hillIdx++;
        if (this._hillIdx >= gameManager.hillArr.length) {
            this._hillIdx = 0;
        }

        let xOffset = this._xOffset;
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

            this._generateHillPiece(xOffset + j * gameConfig.pixelStep, points);
            if (xOffset + j * gameConfig.pixelStep - 640 >= 0 && xOffset + j * gameConfig.pixelStep - 640 <= gameManager.winDis * gameConfig.disUnit && (xOffset + j * gameConfig.pixelStep - 640) % gameConfig.disUnit == 0) {
                this._generateSign(xOffset + j * gameConfig.pixelStep, points);
            }
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

            this._generateHillPiece(xOffset + j * gameConfig.pixelStep, points);
            if (xOffset + j * gameConfig.pixelStep - 640 >= 0 && xOffset + j * gameConfig.pixelStep - 640 <= gameManager.winDis * gameConfig.disUnit && (xOffset + j * gameConfig.pixelStep - 640) % gameConfig.disUnit == 0) {
                this._generateSign(xOffset + j * gameConfig.pixelStep, points);
            }
        }

        yOffset -= randomHeight;

        this._xOffset += hillWidth;
    }

    update(deltaTime: number) {
        if (!this.ball) return;

        while (this.ball.position.x + 640 + 1000 > this._xOffset) {
            this._generateHill();
        }
    }
}

