import { PlayerHeart, BallMove } from "../../game/GameSystem";

export interface MsgClientInput {
    inputs: ClientInput[]
}

export type ClientInput = Omit<PlayerHeart, 'playerId'> | Omit<BallMove, 'playerId'>;