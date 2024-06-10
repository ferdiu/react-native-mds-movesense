import type { TimestampData } from '../timestamp';

// https://bitbucket.org/movesense/movesense-device-lib/src/master/MovesenseCoreLib/resources/movesense-api/system/states.yaml
// /System/States/{StateID} : GET, SUBSCRIBE
// - 0: movement:
//     - 0: device not moving
//     - 1: device moving
// - 1: battery status:
//     - 0: battery OK
//     - 1: battery low
// - 2: connectors:
//     - 0: disconnected
//     - 1: connected to gear
//     - 2: unknown state
// - 3: double-tap:
//     - 0: normal state
//     - 1: device was double-tapped
// - 4: tap:
//     - 1: device was tapped
// - 5: free-fall:
//     - 0: device is under acceleration
//     - 1: device is in free fall
export type SystemStateChangeData = {
    StateId: [number, string];
    NewState: SYSTEM_STATE_ID;
} & TimestampData;

export enum SYSTEM_STATE_ID {
    MOVEMENT,
    BATTERY_STATUS,
    CONNECTORS,
    DOUBLE_TAP,
    TAP,
    FREE_FALL,
}

export enum MOVEMENT_STATE {
    NOT_MOVING,
    MOVING,
}

export enum BATTERY_STATUS {
    OK,
    LOW,
}

export enum CONNECTORS {
    DISCONNECTED,
    CONNECTED_TO_GEAR,
    UNKNOWN_STATE,
}

export enum DOUBLE_TAP {
    NORMAL_STATE,
    DEVICE_WAS_DOUBLE_TAPPED,
}

export enum TAP {
    DEVICE_WAS_TAPPED,
}

export enum FREE_FALL {
    DEVICE_IS_UNDER_ACCELERATION,
    DEVICE_IS_IN_FREE_FALL,
}
