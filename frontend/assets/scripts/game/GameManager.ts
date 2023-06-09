import { MINIGAME } from 'cc/env';
import { BaseWsClient } from 'tsrpc-base-client';
import { WsClient as WsClientBrowser } from "tsrpc-browser";
import { WsClient as WsClientMiniapp } from "tsrpc-miniapp";
import { ServiceType, serviceProto } from '../shared/protocols/serviceProto';
import GameMsgs from './GameMsgs';
import { Hill, RaceType } from '../shared/game/Models/Race';
import { ClientInput } from '../shared/protocols/client/MsgClientInput';
import { GameSystemState } from '../shared/game/GameSystem';

export class GameManager {

    private _client: BaseWsClient<ServiceType>;
    private _raceId: number = 0;
    private _isInit: boolean = false;
    public selfPlayerId: number = 0;
    public difficulty: number = 1;
    public hillArr: Hill[] = [];
    public winDis: number = 100;
    public delayTime: number = 2000;
    public isHardware: boolean = false;

    public initClient(host?: string): void {
        if (this._isInit) {
            return;
        }

        this._client = new (MINIGAME ? WsClientMiniapp : WsClientBrowser)(serviceProto, {
            server: host ? 'ws://' + host + ':3000' : `ws://${location.hostname}:3000`,
            json: true,
            // logger: console,
            heartbeat: {
                interval: 1000,
                timeout: 5000
            }
        });
        this._client.listenMsg('server/RaceList', msg => {
            GameMsgs.send<RaceType[]>(GameMsgs.Names.RefreshRaceList, msg.list);
        });
        this._client.listenMsg('server/CreatorLeave', msg => {
            GameMsgs.send<any>(GameMsgs.Names.CreatorLeave);
        });
        this._client.listenMsg('server/NotifyReady', msg => {
            this.difficulty = msg.difficulty;
            this.hillArr = msg.hillArr;
            this.winDis = msg.winDis;
            GameMsgs.send<any>(GameMsgs.Names.ReadyEnterRace);
        });
        this._client.listenMsg('server/Frame', msg => {
            GameMsgs.send<GameSystemState>(GameMsgs.Names.ApplySystemState, msg.state);
        });
        this._isInit = true;
        console.log('客户端初始化成功');
    }

    public async connect(cb: Function): Promise<void> {
        if (this._client.isConnected) {
            cb && cb();
            return;
        }

        let resConnect = await this._client.connect();
        if (!resConnect.isSucc) {
            await new Promise(rs => { setTimeout(rs, 2000) })
            return this.connect(cb);
        }

        console.log(`ws://${location.hostname}:3000` + ' 连接成功');
        await this.login();
        cb && cb();
    }

    public async login(): Promise<void> {
        let ret = await this._client.callApi('Login', {});

        if (!ret.isSucc) {
            console.log(ret.err.message);
            return;
        }

        this.selfPlayerId = ret.res.id;
        console.log('登录成功, playerId: ' + this.selfPlayerId);
    }

    public async createRace(name: string, teamArr: number[], difficulty: number, teamIdx: number, succCb: Function, errCb: Function): Promise<void> {
        let ret = await this._client.callApi('CreateRace', {
            name: name,
            teamArr: teamArr,
            difficulty: difficulty
        });

        if (!ret.isSucc) {
            errCb && errCb(ret.err.message);
            return;
        }

        this._raceId = ret.res.id;
        await this.joinRace(ret.res.id, teamIdx, succCb, errCb);
    }

    public async joinRace(raceId: number, teamIdx: number, succCb: Function, errCb: Function): Promise<void> {
        let ret = await this._client.callApi('JoinRace', {
            raceId: raceId,
            teamIdx: teamIdx
        });

        if (!ret.isSucc) {
            errCb && errCb(ret.err.message);
            return;
        }

        succCb && succCb();
    }

    public async getRaceList(): Promise<RaceType[]> {
        let ret = await this._client.callApi('GetRaceList', {});

        if (!ret.isSucc) {
            console.log(ret.err.message);
            return [];
        }

        return ret.res.list;
    }

    public async readyRace(cb: Function): Promise<void> {
        let ret = await this._client.callApi('ReadyRace', {
            raceId: this._raceId
        });

        if (!ret.isSucc) {
            console.log(ret.err.message);
            return;
        }

        cb && cb();
    }

    public async startRace(): Promise<any> {
        let ret = await this._client.callApi('StartRace', {});

        if (!ret.isSucc) {
            console.log(ret.err.message);
            return null;
        }

        return ret.res.data;
    }

    public async leaveRace(cb: Function): Promise<void> {
        let ret = await this._client.callApi('LeaveRace', {});

        if (!ret.isSucc) {
            console.log(ret.err.message);
            return;
        }

        cb && cb();
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