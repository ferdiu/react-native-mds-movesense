// React
import * as React from 'react';
import {
    StyleSheet,
    View,
    Text,
    PermissionsAndroid,
    type Permission,
    Button,
} from 'react-native';

// Testing module
import RNMovesense, {
    type MovesenseReadyDevice,
    type MovesenseDevice,
    type ResponseMessage,
    type ErrorEvent,
    type NotificationErrorEvent,
    type NotificationEvent,
    type MovesenseScannedDevice,
} from 'react-native-movesense';

// Emitter
import { NativeEventEmitter, NativeModules } from 'react-native';
const { Movesense } = NativeModules;
const eventEmitter = new NativeEventEmitter(Movesense);

// Required permissions
const permissions = [
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION as Permission,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT as Permission,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN as Permission,
];

export default function App() {
    // State
    const [initialized, setInitialized] = React.useState<boolean>(false);
    const [scanning, setScanning] = React.useState<boolean>(false);
    const [availableDevices, setAvailableDevices] = React.useState<
        MovesenseScannedDevice[]
    >([]);
    const [connectedDevices, setConnectedDevices] = React.useState<
        MovesenseReadyDevice[]
    >([]);

    // Methods
    const requestPermissions = async () => {
        try {
            const granted =
                await PermissionsAndroid.requestMultiple(permissions);
            if (
                permissions
                    .map(
                        (p) => granted[p] === PermissionsAndroid.RESULTS.GRANTED
                    )
                    .includes(false)
            ) {
                console.log('Permissions granted');
            } else {
                console.log('Permissions denied');
            }
        } catch (err) {
            console.warn(err);
        }
    };
    const p = (x: any) => JSON.stringify(x, null, 2);

    const startScan = (): void => {
        // Start scanning
        RNMovesense.scan().then(() => {
            RNMovesense.isScanning().then(() => {
                setScanning(true);
                updateAvailableAndConnected();
            });
        });
    };
    const stopScan = (): void => {
        // Start scanning
        RNMovesense.stopScan().then(() => {
            RNMovesense.isScanning().then(() => {
                setScanning(false);
                updateAvailableAndConnected();
            });
        });
    };
    const connect = (address: string): void => {
        RNMovesense.connect(address)
            .then((device: MovesenseDevice) => {
                console.log('Connected to device', device);
                updateAvailableAndConnected();
            })
            .catch((err) => {
                console.log('Connection error with device ' + address, err);
            });
    };
    const disconnect = (address: string): void => {
        RNMovesense.disconnect(address)
            .then(() => {
                updateAvailableAndConnected();
                console.log('Disconnected from device', address);
            })
            .catch((err) => {
                console.log('Disconnection error with device ' + address, err);
            });
    };
    const updateAvailableAndConnected = (): void => {
        RNMovesense.getAvailableDevices().then(
            (devices: MovesenseScannedDevice[]) => {
                setAvailableDevices(devices);
            }
        );
        RNMovesense.getConnectedDevices().then(
            (devices: MovesenseReadyDevice[]) => {
                setConnectedDevices(devices);
            }
        );
    };

    // Effects
    React.useEffect(() => {
        requestPermissions().then(() => {
            // Initialize module
            RNMovesense.init()
                .then(() => {
                    setInitialized(true);
                })
                .catch((err) => {
                    setInitialized(false);
                    console.error(err);
                });
        });

        // If scan started stop it
        return stopScan;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Event handling
    React.useEffect(() => {
        // Scan/connection-related
        eventEmitter.addListener('ScanStarted', () => {
            setScanning(true);
            console.log('ScanStarted');
        });
        eventEmitter.addListener('ScanStopped', () => {
            setScanning(false);
            console.log('ScanStopped');
        });
        eventEmitter.addListener(
            'ScannedDevice',
            (event: MovesenseScannedDevice) => {
                if (event.name?.startsWith('Movesense')) {
                    console.log('ScannedDevice ->', p(event));
                    updateAvailableAndConnected();
                }
            }
        );
        eventEmitter.addListener('Connected', (event: MovesenseDevice) => {
            console.log('Connected ->', p(event));
        });
        eventEmitter.addListener(
            'ConnectionCompleted',
            (event: MovesenseReadyDevice) => {
                console.log('ConnectionCompleted ->', p(event));
                updateAvailableAndConnected();
            }
        );
        eventEmitter.addListener('Disconnected', (event: MovesenseDevice) => {
            console.log('Disconnected ->', p(event));
            updateAvailableAndConnected();
        });
        // Errors
        eventEmitter.addListener('Error', (event: ErrorEvent) => {
            // NOTE: this is useful only for debugging purposes:
            //       to handle errors use .then(...).catch(...) on used methods
            console.log('Error ->', p(event));
        });
        // Requests
        eventEmitter.addListener('GETSuccess', (event: ResponseMessage) => {
            console.log('GETSuccess ->', p(event));
        });
        eventEmitter.addListener('PUTSuccess', (event: ResponseMessage) => {
            console.log('PUTSuccess ->', p(event));
        });
        eventEmitter.addListener('POSTSuccess', (event: ResponseMessage) => {
            console.log('POSTSuccess ->', p(event));
        });
        eventEmitter.addListener('DELETESuccess', (event: ResponseMessage) => {
            console.log('DELETESuccess ->', p(event));
        });
        // Notification
        eventEmitter.addListener('Notification', (event: NotificationEvent) => {
            console.log('Notification ->', p(event));
        });
        eventEmitter.addListener(
            'NotificationError',
            (event: NotificationErrorEvent) => {
                console.log('NotificationError ->', p(event));
            }
        );

        console.log('Added listeners');

        return () => {
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

            console.log('Removed listeners');
        };
    }, [initialized]);

    const listAvailableDevices = () => {
        return availableDevices
            .filter((d: MovesenseScannedDevice) =>
                d.name?.startsWith('Movesense')
            )
            .map((d: MovesenseScannedDevice) => {
                return (
                    <Button
                        key={d.address}
                        title={'Connect to ' + d.name}
                        onPress={() => connect(d.address)}
                    />
                );
            });
    };

    const listConnectedDevices = () => {
        return connectedDevices.map((d: MovesenseReadyDevice) => {
            return (
                <Button
                    key={d.address}
                    title={'Disconnect from ' + d.address}
                    onPress={() => disconnect(d.address)}
                />
            );
        });
    };

    return (
        <View style={styles.container}>
            <Text>Initialized: {initialized ? 'true' : 'false'}</Text>

            {scanning ? (
                <Button title={'Stop scan'} onPress={stopScan} />
            ) : (
                <Button title={'Start scan'} onPress={startScan} />
            )}
            <Text>Scanning: {scanning ? 'true' : 'false'}</Text>
            <View style={styles.spacer} />
            {listAvailableDevices()}
            <View style={styles.spacer} />
            {listConnectedDevices()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
    },
    box: {
        width: 60,
        height: 60,
        marginVertical: 20,
    },
    spacer: {
        marginVertical: 35,
    },
});
