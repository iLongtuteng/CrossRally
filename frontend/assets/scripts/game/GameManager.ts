import { MINIGAME } from 'cc/env';
import { BaseWsClient } from 'tsrpc-base-client';
import { WsClient as WsClientBrowser } from "tsrpc-browser";
import { WsClient as WsClientMiniapp } from "tsrpc-miniapp";
import { ServiceType, serviceProto } from '../shared/protocols/serviceProto';
import GameMsgs from './GameMsgs';
import { ClientInput } from '../shared/protocols/client/MsgClientInput';
import { GameSystemState } from '../shared/game/GameSystem';
import { SpriteFrame } from 'cc';
import { Hill } from './scenes/World';

export class GameManager {

    public isAdviser: boolean = false;
    public selfPlayerId: number = 0;
    public delayTime: number = 2000;
    public difficulty: number = 1;
    public winDis: number = 100;
    public hillArr: Hill[] = [];
    public teamMap: Map<number, number[]> = new Map<number, number[]>();
    public greenSprite: SpriteFrame = null;
    public blueSprite: SpriteFrame = null;
    private _client: BaseWsClient<ServiceType>;
    private _isInit: boolean = false;
    private _isLogin: boolean = false;

    public initClient(host?: string): void {
        if (this._isInit) {
            return;
        }

        let hostStr = host ? 'ws://' + host + ':3000' : `ws://${location.hostname}:3000`;
        this._client = new (MINIGAME ? WsClientMiniapp : WsClientBrowser)(serviceProto, {
            server: hostStr,
            json: true,
            // logger: console,
            heartbeat: {
                interval: 1000,
                timeout: 5000
            }
        });
        this._client.listenMsg('server/RaceInfo', msg => {
            this.difficulty = msg.difficulty;
            this.winDis = msg.winDis;
            this.hillArr = msg.hillArr;
            for (let teamObj of msg.teamObjArr) {
                this.teamMap.set(teamObj.teamIdx, teamObj.memberArr);
            }
            GameMsgs.send<any>(GameMsgs.Names.ReadyEnterRace);
        });
        this._client.listenMsg('server/Frame', msg => {
            GameMsgs.send<GameSystemState>(GameMsgs.Names.ApplySystemState, msg.state);
        });
        this._client.listenMsg('server/RaceResult', msg => {
            GameMsgs.send<number>(GameMsgs.Names.RaceShowResult, msg.winnerIdx);
        });
        this._isInit = true;
        console.log('客户端初始化成功，连接到：' + hostStr);
    }

    public async connect(cb: Function): Promise<void> {
        if (this._client.isConnected) {
            cb && cb();
            return;
        }

        let resConnect = await this._client.connect();
        if (!resConnect.isSucc) {
            await new Promise(rs => { setTimeout(rs, 2000) });
            return this.connect(cb);
        }

        console.log('连接成功');
        cb && cb();
    }

    public async login(cb: Function): Promise<void> {
        if (this._isLogin) {
            cb && cb();
            return;
        }

        let ret = await this._client.callApi('Login', {});

        if (!ret.isSucc) {
            console.log(ret.err.message);
            return;
        }

        this.selfPlayerId = ret.res.id;
        this._isLogin = true;
        console.log('登录成功, playerId: ' + ret.res.id);
        cb && cb();
    }

    public async updateTeams(teamArr: number[], cb: Function): Promise<void> {
        let ret = await this._client.callApi('UpdateTeams', {
            teamArr: teamArr
        })

        if (!ret.isSucc) {
            console.log(ret.err.message);
            return;
        }

        cb && cb();
    }

    public async joinRace(teamIdx?: number, succCb?: Function, errCb?: Function): Promise<void> {
        let ret = await this._client.callApi('JoinRace', {
            teamIdx: teamIdx
        });

        if (!ret.isSucc) {
            errCb && errCb(ret.err.message);
            return;
        }

        succCb && succCb();
    }

    public async startRace(difficulty: number): Promise<void> {
        let ret = await this._client.callApi('StartRace', {
            difficulty: difficulty
        });

        if (!ret.isSucc) {
            console.log(ret.err.message);
            return;
        }
    }

    public async endRace(winnerIdx?: number): Promise<void> {
        let ret = await this._client.callApi('EndRace', {
            winnerIdx: winnerIdx
        });

        if (!ret.isSucc) {
            console.log(ret.err.message);
            return;
        }
    }

    public sendClientInput(input: ClientInput): void {
        // 已掉线或暂未加入，忽略本地状态
        if (!this.selfPlayerId || !this._client.isConnected) {
            return;
        }

        this._client.sendMsg('client/ClientInput', {
            inputs: [input]
        })
    }

    public static get Instance() {
        return this._instance || (this._instance = new GameManager());
    }

    private static _instance: GameManager;
}

export let gameManager: GameManager = GameManager.Instance;