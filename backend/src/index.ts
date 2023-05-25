import 'k8w-extend-native';
import * as path from "path";
import { WsConnection, WsServer } from "tsrpc";
import { ServiceType, serviceProto } from './shared/protocols/serviceProto';
import { gameManager } from './game/GameManager';

// 创建 TSRPC WebSocket Server
export const server = new WsServer(serviceProto, {
    port: 3000,
    // Remove this to use binary mode (remove from the client too)
    json: true,
    heartbeatWaitTime: 10000,
    // Enable this to see send/recv message details
    logMsg: false,
});

// 断开连接后退出竞赛
server.flows.postDisconnectFlow.push(v => {
    let conn = v.conn as WsConnection<ServiceType>;
    gameManager.leaveRace(conn);

    return v;
});

// 初始化
async function init() {
    // 挂载 API 接口
    await server.autoImplementApi(path.resolve(__dirname, 'api'));

    // TODO
    // Prepare something... (e.g. connect the db)
};

// Entry function
async function main() {
    await init();
    await server.start();
}
main();