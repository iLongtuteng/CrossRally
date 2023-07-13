import { ServiceProto } from 'tsrpc-proto';
import { MsgClientInput } from './client/MsgClientInput';
import { ReqEndRace, ResEndRace } from './PtlEndRace';
import { ReqJoinRace, ResJoinRace } from './PtlJoinRace';
import { ReqLogin, ResLogin } from './PtlLogin';
import { ReqStartRace, ResStartRace } from './PtlStartRace';
import { ReqUpdateTeams, ResUpdateTeams } from './PtlUpdateTeams';
import { MsgFrame } from './server/MsgFrame';
import { MsgRaceInfo } from './server/MsgRaceInfo';
import { MsgRaceResult } from './server/MsgRaceResult';

export interface ServiceType {
    api: {
        "EndRace": {
            req: ReqEndRace,
            res: ResEndRace
        },
        "JoinRace": {
            req: ReqJoinRace,
            res: ResJoinRace
        },
        "Login": {
            req: ReqLogin,
            res: ResLogin
        },
        "StartRace": {
            req: ReqStartRace,
            res: ResStartRace
        },
        "UpdateTeams": {
            req: ReqUpdateTeams,
            res: ResUpdateTeams
        }
    },
    msg: {
        "client/ClientInput": MsgClientInput,
        "server/Frame": MsgFrame,
        "server/RaceInfo": MsgRaceInfo,
        "server/RaceResult": MsgRaceResult
    }
}

export const serviceProto: ServiceProto<ServiceType> = {
    "version": 21,
    "services": [
        {
            "id": 11,
            "name": "client/ClientInput",
            "type": "msg"
        },
        {
            "id": 21,
            "name": "EndRace",
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
            "id": 7,
            "name": "Login",
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
            "id": 18,
            "name": "UpdateTeams",
            "type": "api",
            "conf": {}
        },
        {
            "id": 12,
            "name": "server/Frame",
            "type": "msg"
        },
        {
            "id": 20,
            "name": "server/RaceInfo",
            "type": "msg"
        },
        {
            "id": 22,
            "name": "server/RaceResult",
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
        "PtlEndRace/ReqEndRace": {
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
                    "name": "winnerIdx",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                }
            ]
        },
        "base/BaseRequest": {
            "type": "Interface"
        },
        "PtlEndRace/ResEndRace": {
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
        "base/BaseResponse": {
            "type": "Interface"
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
                    "id": 2,
                    "name": "teamIdx",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 3,
                    "name": "patientName",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
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
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "difficulty",
                    "type": {
                        "type": "Number"
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
            ]
        },
        "PtlUpdateTeams/ReqUpdateTeams": {
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
        "PtlUpdateTeams/ResUpdateTeams": {
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
        "server/MsgRaceInfo/MsgRaceInfo": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "difficulty",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "winDis",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 2,
                    "name": "hillArr",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../game/Models/Race/Hill"
                        }
                    }
                },
                {
                    "id": 4,
                    "name": "teamObjArr",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../game/Models/Race/TeamObj"
                        }
                    }
                },
                {
                    "id": 5,
                    "name": "nameObjArr",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../game/Models/Race/NameObj"
                        }
                    }
                }
            ]
        },
        "../../game/Models/Race/Hill": {
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
        "../../game/Models/Race/TeamObj": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "teamIdx",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "memberArr",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Number"
                        }
                    }
                }
            ]
        },
        "../../game/Models/Race/NameObj": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "playerId",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "patientName",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "server/MsgRaceResult/MsgRaceResult": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "winnerIdx",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                }
            ]
        }
    }
};