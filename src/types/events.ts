export type MovesenseDevice = {
    address: string;
};

export type MovesenseReadyDevice = {
    serial: string;
} & MovesenseDevice;

export type MovesenseScannedDevice = {
    name?: string;
} & MovesenseDevice;

export type ResponseMessage = {
    uri: string;
    contract: string;
    data: string;
};

export type ErrorEvent = {
    message: string;
    uri?: string;
    contract?: string;
    requestType?: string;
};

type Subscription = {
    subscription: string;
};

export type NotificationEvent = {
    data: string;
} & Subscription;

export type NotificationErrorEvent = {
    message: string;
} & Subscription;

export type NotificationData<T> = {
    Body: T;
    Uri: string;
    Methods: string;
};
