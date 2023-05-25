import { ServiceProto } from 'tsrpc-proto';
import { MsgClientInput } from './client/MsgClientInput';
import { ReqCreateRace, ResCreateRace } from './PtlCreateRace';
import { ReqGetRaceList, ResGetRaceList } from './PtlGetRaceList';
import { ReqJoinRace, ResJoinRace } from './PtlJoinRace';
import { ReqLeaveRace, ResLeaveRace } from './PtlLeaveRace';
import { ReqLogin, ResLogin } from './PtlLogin';
import { ReqReadyRace, ResReadyRace } from './PtlReadyRace';
import { ReqStartRace, ResStartRace } from './PtlStartRace';
import { MsgCreatorLeave } from './server/MsgCreatorLeave';
import { MsgFrame } from './server/MsgFrame';
import { MsgNotifyReady } from './server/MsgNotifyReady';
import { MsgRaceList } from './server/MsgRaceList';

export interface ServiceType {
    api: {
        "CreateRace": {
            req: ReqCreateRace,
            res: ResCreateRace
        },
        "GetRaceList": {
            req: ReqGetRaceList,
            res: ResGetRaceList
        },
        "JoinRace": {
            req: ReqJoinRace,
            res: ResJoinRace
        },
        "LeaveRace": {
            req: ReqLeaveRace,
            res: ResLeaveRace
        },
        "Login": {
            req: ReqLogin,
            res: ResLogin
        },
        "ReadyRace": {
            req: ReqReadyRace,
            res: ResReadyRace
        },
        "StartRace": {
            req: ReqStartRace,
            res: ResStartRace
        }
    },
    msg: {
        "client/ClientInput": MsgClientInput,
        "server/CreatorLeave": MsgCreatorLeave,
        "server/Frame": MsgFrame,
        "server/NotifyReady": MsgNotifyReady,
        "server/RaceList": MsgRaceList
    }
}

export const serviceProto: ServiceProto<ServiceType> = {
    "version": 10,
    "services": [
        {
            "id": 11,
            "name": "client/ClientInput",
            "type": "msg"
        },
        {
            "id": 2,
            "name": "CreateRace",
            "type": "api",
            "conf": {}
        },
        {
            "id": 3,
            "name": "GetRaceList",
            "type": "api",
            "conf": {}
        },
        {
            "id": 4,
            "name": "JoinRace",
            "type": "api",
            "conf": {}
        },
        {
            "id": 17,
            "name": "LeaveRace",
            "type": "api",
            "conf": {}
        },
        {
            "id": 7,
            "name": "Login",
            "type": "api",
            "conf": {}
        },
        {
            "id": 14,
            "name": "ReadyRace",
            "type": "api",
            "conf": {}
        },
        {
            "id": 16,
            "name": "StartRace",
            "type": "api",
            "conf": {}
        },
        {
            "id": 9,
            "name": "server/CreatorLeave",
            "type": "msg"
        },
        {
            "id": 12,
            "name": "server/Frame",
            "type": "msg"
        },
        {
            "id": 15,
            "name": "server/NotifyReady",
            "type": "msg"
        },
        {
            "id": 5,
            "name": "server/RaceList",
            "type": "msg"
        }
    ],
    "types": {
        "client/MsgClientInput/MsgClientInput": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "inputs",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "client/MsgClientInput/ClientInput"
                        }
                    }
                }
            ]
        },
        "client/MsgClientInput/ClientInput": {
            "type": "Union",
            "members": [
                {
                    "id": 0,
                    "type": {
                        "target": {
                            "type": "Reference",
                            "target": "../game/GameSystem/PlayerHeart"
                        },
                        "keys": [
                            "playerId"
                        ],
                        "type": "Omit"
                    }
                },
                {
                    "id": 1,
                    "type": {
                        "target": {
                            "type": "Reference",
                            "target": "../game/GameSystem/BallMove"
                        },
                        "keys": [
                            "playerId"
                        ],
                        "type": "Omit"
                    }
                }
            ]
        },
        "../game/GameSystem/PlayerHeart": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "type",
                    "type": {
                        "type": "Literal",
                        "literal": "PlayerHeart"
                    }
                },
                {
                    "id": 1,
                    "name": "playerId",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 2,
                    "name": "heartState",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "../game/GameSystem/BallMove": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "type",
                    "type": {
                        "type": "Literal",
                        "literal": "BallMove"
                    }
                },
                {
                    "id": 1,
                    "name": "playerId",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 2,
                    "name": "pos",
                    "type": {
                        "type": "Interface",
                        "properties": [
                            {
                                "id": 0,
                                "name": "x",
                                "type": {
                                    "type": "Number"
                                }
                            },
                            {
                                "id": 1,
                                "name": "y",
                                "type": {
                                    "type": "Number"
                                }
                            }
                        ]
                    }
                }
            ]
        },
        "PtlCreateRace/ReqCreateRace": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 3,
                    "name": "name",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "teamArr",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Number"
                        }
                    }
                },
                {
                    "id": 4,
                    "name": "winDis",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "base/BaseRequest": {
            "type": "Interface"
        },
        "PtlCreateRace/ResCreateRace": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 1,
                    "name": "id",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "base/BaseResponse": {
            "type": "Interface"
        },
        "PtlGetRaceList/ReqGetRaceList": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseRequest"
                    }
                }
            ]
        },
        "PtlGetRaceList/ResGetRaceList": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "list",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../game/Models/Race/RaceType"
                        }
                    }
                }
            ]
        },
        "../game/Models/Race/RaceType": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "id",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "name",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "teamArr",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Number"
                        }
                    }
                }
            ]
        },
        "PtlJoinRace/ReqJoinRace": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "raceId",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 2,
                    "name": "teamIdx",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "PtlJoinRace/ResJoinRace": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseResponse"
                    }
                }
            ]
        },
        "PtlLeaveRace/ReqLeaveRace": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseRequest"
                    }
                }
            ]
        },
        "PtlLeaveRace/ResLeaveRace": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseResponse"
                    }
                }
            ]
        },
        "PtlLogin/ReqLogin": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseRequest"
                    }
                }
            ]
        },
        "PtlLogin/ResLogin": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "id",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "PtlReadyRace/ReqReadyRace": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "raceId",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "PtlReadyRace/ResReadyRace": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseResponse"
                    }
                }
            ]
        },
        "PtlStartRace/ReqStartRace": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseRequest"
                    }
                }
            ]
        },
        "PtlStartRace/ResStartRace": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "data",
                    "type": {
                        "type": "Interface",
                        "properties": [
                            {
                                "id": 0,
                                "name": "teamArr",
                                "type": {
                                    "type": "Array",
                                    "elementType": {
                                        "type": "Number"
                                    }
                                }
                            },
                            {
                                "id": 1,
                                "name": "teamIdx",
                                "type": {
                                    "type": "Number"
                                }
                            },
                            {
                                "id": 2,
                                "name": "memberArr",
                                "type": {
                                    "type": "Array",
                                    "elementType": {
                                        "type": "Number"
                                    }
                                }
                            }
                        ]
                    }
                }
            ]
        },
        "server/MsgCreatorLeave/MsgCreatorLeave": {
            "type": "Interface"
        },
        "server/MsgFrame/MsgFrame": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "state",
                    "type": {
                        "type": "Reference",
                        "target": "../game/GameSystem/GameSystemState"
                    }
                }
            ]
        },
        "../game/GameSystem/GameSystemState": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "balls",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../game/GameSystem/BallState"
                        }
                    }
                }
            ]
        },
        "../game/GameSystem/BallState": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "idx",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "maxSpeed",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 3,
                    "name": "pos",
                    "type": {
                        "type": "Interface",
                        "properties": [
                            {
                                "id": 0,
                                "name": "x",
                                "type": {
                                    "type": "Number"
                                }
                            },
                            {
                                "id": 1,
                                "name": "y",
                                "type": {
                                    "type": "Number"
                                }
                            }
                        ]
                    }
                },
                {
                    "id": 2,
                    "name": "players",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../game/GameSystem/PlayerState"
                        }
                    }
                },
                {
                    "id": 4,
                    "name": "result",
                    "type": {
                        "type": "Reference",
                        "target": "../game/GameSystem/ResultType"
                    }
                }
            ]
        },
        "../game/GameSystem/PlayerState": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "id",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "heartState",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "../game/GameSystem/ResultType": {
            "type": "Enum",
            "members": [
                {
                    "id": 0,
                    "value": 0
                },
                {
                    "id": 1,
                    "value": 1
                },
                {
                    "id": 2,
                    "value": 2
                }
            ]
        },
        "server/MsgNotifyReady/MsgNotifyReady": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "hillArr",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../game/Models/Race/Hill"
                        }
                    }
                },
                {
                    "id": 1,
                    "name": "winDis",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "../game/Models/Race/Hill": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "yOffset",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "width",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 2,
                    "name": "height1",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 3,
                    "name": "height2",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "server/MsgRaceList/MsgRaceList": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "list",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../game/Models/Race/RaceType"
                        }
                    }
                }
            ]
        }
    }
};