import { _decorator, Component } from "cc";
import { FWKMsgRouterNodeDelegate } from "./mvc/FWKMvc";

/*
 * @Description: 继承自 cc.Component 的组件类，
 * @Author: adaemon 
 * @Date: 2018-08-18 16:43:15 
 * @Last Modified by: adaemon
 * @Last Modified time: 2019-07-02 22:46:27
 */


const { ccclass, property } = _decorator;


@ccclass
export default class FWKComponent extends Component {

    public constructor() {
        super();
        this._msgRouterNodeDelegate = new FWKMsgRouterNodeDelegate(this);
    }

    // LIFE-CYCLE CALLBACKS:
    protected onLoad(): void { }


    protected start(): void { }

    protected update(dt): void { }

    protected updateSecond(dt): void { }
    protected onEnable(): void {
        this._msgRouterNodeDelegate.connectToMsgRouter();
        this.schedule(this.updateSecond, 1);
    }
    protected onDisable(): void {
        this._msgRouterNodeDelegate.disConnectFromMsgRouter();
        this.unschedule(this.updateSecond);
    }

    protected onDestroy() {
        delete this._msgRouterNodeDelegate;
    }

    private _msgRouterNodeDelegate: FWKMsgRouterNodeDelegate = null;
}
