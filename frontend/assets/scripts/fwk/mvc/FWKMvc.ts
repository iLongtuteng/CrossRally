/*
 * @Description: mvc基础框架
 * @Author: adaemon 
 * @Date: 2018-08-19 01:06:32 
 * @Last Modified by: adaemon
 * @Last Modified time: 2020-03-04 09:25:40
 */

import { log } from "cc";


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/** NOTE: mvc 消息系统 */


/**消息 */
export class FWKMsg<T>{
    /**
     * 
     * @param id 消息id
     * @param data 消息中的数据
     * @param queueId 消息所属的队列
     */
    constructor(id: string, data: T, queueId: string = '') {
        this._id = id;
        this._data = data;
        this._queueId = queueId;
        this._isCompleted = false;
        this._result = undefined;
    }

    public send(): void {
        if (this._isSended) return;
        MsgRouter.Instance.send(this);
    }

    get id() {
        return this._id;
    }

    get data() {
        return this._data;
    }

    get isSended() {
        return this._isSended;
    }

    get queueId() {
        return this._queueId;
    }

    get isCompleted() {
        return this._isCompleted;
    }

    public setCompleted(): void {
        this._isCompleted = true;
        MsgRouter.Instance.complete(this);
    }

    get result() {
        return this._result;
    }
    set result(v) {
        this._result = v;
    }

    /**消息id */
    protected _id: string;
    /**消息所属队列 */
    protected _queueId: string;
    /**消息中的数据 */
    protected _data: T;
    /**消息是否已经发送了 */
    protected _isSended: boolean;
    /**消息是否已经完成 */
    protected _isCompleted: boolean;
    /**消息完成后的结果 */
    protected _result: any;

}
/**
 * 消息路由中的节点接口。
 * 需要接受处理消息，必须将自己作为一个消息路由节点放在消息路由中。
 */
export interface IFWKMsgRouterNode {

    /**
     * 连接到消息路由器中
     */
    connectToMsgRouter(): void;
    /**
     * 从消息路由器中断开连接
     */
    disConnectFromMsgRouter(): void;

    onProcessMsg(msg: FWKMsg<any>): boolean;

}


export class FWKMsgRouterNode implements IFWKMsgRouterNode {

    constructor() {
    }
    public connectToMsgRouter(): void {
        MsgRouter.Instance.connectToMsgRouter(this);
    }
    public disConnectFromMsgRouter(): void {
        MsgRouter.Instance.disConnectFromMsgRouter(this);
    }
    public onProcessMsg(msg: FWKMsg<any>): boolean {
        return false;
    }

}

/**作为成员 !delegate! 一般用于显示组件的消息处理   */
export class FWKMsgRouterNodeDelegate extends FWKMsgRouterNode {

    constructor(owner) {
        super();
        this._owner = owner;
    }


    public onProcessMsg(msg: FWKMsg<any>): boolean {
        super.onProcessMsg(msg);

        let msgFunName: string = 'onMsg_' + msg.id;
        let msgHandler: Function = this._owner[msgFunName];
        if (msgHandler) {
            return msgHandler.call(this._owner, msg);
        }
        return false;
    }


    private _owner: any = null;
}

/**作为父类继承 !继承使用!  一般用于独立类 */
export abstract class FWKMsgRouterNodeAbstract extends FWKMsgRouterNode {

    constructor() {
        super();
    }

    public onProcessMsg(msg: FWKMsg<any>): boolean {
        super.onProcessMsg(msg);

        let msgFunName: string = 'onMsg_' + msg.id;
        let msgHandler: Function = this[msgFunName];
        if (msgHandler) {
            return msgHandler.call(this, msg);
        }
        return false;
    }

}




class MsgRouter {


    /**
     * 将某个节点连接到消息路由
     * @param msgRouterNode 要连接到消息路由的节点
     */
    public connectToMsgRouter(msgRouterNode: IFWKMsgRouterNode): void {
        //是否已经存在了
        let index: number = this._msgRouterNodeArray.indexOf(msgRouterNode);
        if (index >= 0) return;
        this._msgRouterNodeArray.push(msgRouterNode);
    }

    /**
     * 断开某个节点的连接
     * @param msgRouterNode 要断开连接消息路由器节点
     */
    public disConnectFromMsgRouter(msgRouterNode: IFWKMsgRouterNode): void {
        let index: number = this._msgRouterNodeArray.indexOf(msgRouterNode);
        if (index < 0) return;
        this._msgRouterNodeArray.splice(index, 1);
    }



    /**发送一个消息到路由器 */
    public send(msg: FWKMsg<any>): void {
        if (msg.isSended) return;

        let msgQueueId: string = msg.queueId;
        if (msgQueueId.length > 0) {
            //NOTE: 如果没有添加一个新的 还是不处理？
            if (!this._msgArrayMap.has(msgQueueId)) {
                this._msgArrayMap.set(msgQueueId, new Array<FWKMsg<any>>());
            }

            let msgArray = this._msgArrayMap.get(msgQueueId);
            if (msgArray.length <= 0) {
                //直接处理消息
                this._processMsg(msg);
            }
            else {
                msgArray.push(msg);
                this._checkQueueMsg(msgQueueId);
            }
        }
        else {
            this._processMsg(msg);
        }
    }


    /**
     * 某个消息完成了。如果是队列中的消息则检测队列中的下一个消息。
     * @param msg 完成的消息
     */
    public complete(msg: FWKMsg<any>): void {

        if (!msg.isCompleted) return;

        if (msg.queueId.length <= 0) return;
        this._checkQueueMsg(msg.queueId);
    }

    private _checkQueueMsg(queueId: string): void {
        if (!this._msgArrayMap.has(queueId)) return;

        let msgArray = this._msgArrayMap.get(queueId);
        if (msgArray.length <= 0) return;

        let frontMsg: FWKMsg<any> = msgArray[0];
        if (null === frontMsg || !frontMsg.isCompleted) return;

        msgArray.shift();
        if (msgArray.length <= 0) return;

        frontMsg = msgArray[0];
        this._processMsg(frontMsg);

    }



    private _processMsg(msg: FWKMsg<any>): void {
        let nodeArray = this._msgRouterNodeArray;

        /**用于在队列中的消息，如果有某个节点把这个节点hold住了，不能完成。需要手动完成这个消息。 */
        let holdCounter: number = 0;
        /**将消息分发给每个节点进行处理 */
        nodeArray.forEach(element => {
            try {
                let isHold: boolean = element.onProcessMsg(msg);

                if (isHold) ++holdCounter;

            } catch (error) {
                log(error);
                debugger
            }
        });

        /**
         * 不在队列中的消息直接完成了。
         * 在队列中的检测是否需要自动完成
         */
        //不在队列中的消息直接完成了。
        if (msg.queueId.length <= 0) {
            msg.setCompleted();
        }
        else {
            if (holdCounter <= 0) {
                msg.setCompleted();
            }
        }




    }

    protected _msgArrayMap: Map<string, Array<FWKMsg<any>>>;

    /**消息路由器节点list */
    private _msgRouterNodeArray: Array<IFWKMsgRouterNode>;


    /*************************************************************************** */
    public static get Instance() {
        // Do you need arguments? Make it a regular method instead.
        return this._instance || (this._instance = new this());
    }

    private constructor() {
        this._msgArrayMap = new Map<string, Array<FWKMsg<any>>>();
        this._msgRouterNodeArray = new Array<IFWKMsgRouterNode>();
    }
    private static _instance: MsgRouter;
}


export function MsgRouterInstance(): MsgRouter {
    return MsgRouter.Instance;
}

