# react-native-mds-movesense

React native wrapper for [movesense](https://www.movesense.com/movesense-active/) library.

## ⚠️ WARNING ⚠️

This library currently supports only Android but not iOS. I have little experience with Swift and I don't have access to any iOS device. If you are able to help, please open an issue or PR.

## Installation

```sh
npm install react-native-mds-movesense
```

## Android permissions

Add the following permissions to your `android/src/main/AndroidManifest.xml`:

```xml
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
```

## Usage

Simple usage:

```typescript
import RNMovesense, {
    type MovesenseReadyDevice,
    type MovesenseDevice,
    type MovesenseScannedDevice,
} from 'react-native-mds-movesense';

// ...

// Always call `init` first to initialize the module
RNMovesense.init(): Promise<void>;

// Then you can access all of these function
RNMovesense.scan(): Promise<void>;
RNMovesense.stopScan(): Promise<void>;
RNMovesense.isScanning(): Promise<boolean>;

RNMovesense.connect(address: string): Promise<MovesenseDevice>;
RNMovesense.disconnect(address: string): Promise<void>;

RNMovesense.getAvailableDevices(): Promise<MovesenseScannedDevice[]>;
RNMovesense.getConnectedDevices(): Promise<MovesenseReadyDevice[]>;

RNMovesense.get(uri: string, contract: string): Promise<string>;
RNMovesense.put(uri: string, contract: string): Promise<string>;
RNMovesense.post(uri: string, contract: string): Promise<string>;
RNMovesense.del(uri: string, contract: string): Promise<string>;

RNMovesense.subscribe(uri: string, contract: string): Promise<string>;
RNMovesense.unsubscribe(subscriptionId: string): Promise<void>;
```

where:
- `address` always means the MAC address of the device;
- `uri` is the URI of the resource (for deafult application is always `suunto://MDS/EventListener`);
- `contract` is the contract of the resource in the form of `{"Uri": "<movesense-serial-number>/<resource-path>"}` (for example `{"Uri": "688089625742/Meas/HR"}`, where `688089625742` is the serial number of the device).

To find more informations about the `contract` parameter check the [documentation](https://www.movesense.com/docs/esw/api_reference/).

> For a more comprehensive example, check out the [example app](https://github.com/ferdiu/react-native-mds-movesense/blob/main/example/src/App.tsx).

### Events

Instantiate an event emitter for the module:

```typescript
// Emitter
import { NativeEventEmitter, NativeModules } from 'react-native';
const { Movesense } = NativeModules;
const movesenseEventEmitter = new NativeEventEmitter(Movesense);
```

and then subscribe to the events:

```typescript
// Scan/connection-related
movesenseEventEmitter.addListener('ScanStarted', () => { /** ... */ });
movesenseEventEmitter.addListener('ScanStopped', () => { /** ... */ });
movesenseEventEmitter.addListener('ScannedDevice', (event: MovesenseScannedDevice) => { /** ... */ });
movesenseEventEmitter.addListener('Connected', (event: MovesenseDevice) => { /** ... */ });
movesenseEventEmitter.addListener('ConnectionCompleted', async (event: MovesenseReadyDevice) => { /** ... */ });
movesenseEventEmitter.addListener('Disconnected', (event: MovesenseDevice) => { /** ... */ });
// Errors
    // NOTE: this is useful only for debugging purposes:
    //       to handle errors use .then(...).catch(...) on used methods
movesenseEventEmitter.addListener('Error', (event: ErrorEvent) => { /** ... */ });
// Requests
movesenseEventEmitter.addListener('GETSuccess', (event: ResponseMessage) => { /** ... */ });
movesenseEventEmitter.addListener('PUTSuccess', (event: ResponseMessage) => { /** ... */ });
movesenseEventEmitter.addListener('POSTSuccess', (event: ResponseMessage) => { /** ... */ });
movesenseEventEmitter.addListener('DELETESuccess', (event: ResponseMessage) => { /** ... */ });
// Notification
movesenseEventEmitter.addListener('Notification', (event: NotificationEvent) => { /** ... */ });
movesenseEventEmitter.addListener('NotificationError', (event: NotificationErrorEvent) => { /** ... */ });
```

do not forget to unsubscribe from the events!

```typescript
// Scan/connection-related
eventEmitter.removeAllListeners('ScanStarted');
eventEmitter.removeAllListeners('ScanStopped');
eventEmitter.removeAllListeners('ScannedDevice');
eventEmitter.removeAllListeners('Connected');
eventEmitter.removeAllListeners('ConnectionCompleted');
eventEmitter.removeAllListeners('Disconnected');
// Errors
eventEmitter.removeAllListeners('Error');
// Requests
eventEmitter.removeAllListeners('GETSuccess');
eventEmitter.removeAllListeners('PUTSuccess');
eventEmitter.removeAllListeners('POSTSuccess');
eventEmitter.removeAllListeners('DELETESuccess');
// Notification
eventEmitter.removeAllListeners('Notification');
eventEmitter.removeAllListeners('NotificationError');
```

> For a more comprehensive example, check out the [example app](https://github.com/ferdiu/react-native-mds-movesense/blob/main/example/src/App.tsx).

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

### TODOs

- [ ] Add tests;
- [ ] Add more inline documentation for types;
- [ ] Add iOS implementation;
- [ ] Implement types in files:
    - [ ] `src/types/info.ts`;
    - [ ] `src/types/comm/ble.ts`;
    - [ ] `src/types/system/memory.ts`;
    - [ ] `src/types/system/debug.ts`;
    - [ ] `src/types/system/mode.ts`;
    - [ ] `src/types/ui/ind/visual.ts`;
    - [ ] `src/types/misc/manufacturing.ts`;
    - [ ] `src/types/component/leds.ts`;
    - [ ] `src/types/component/eeprom.ts`;
    - [ ] `src/types/component/max3000x.ts`.


## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
