import { NativeModules, Platform } from 'react-native';
import {
    type MovesenseDevice,
    type MovesenseScannedDevice,
    type MovesenseReadyDevice,
} from './types/events';

const LINKING_ERROR =
    `The package 'react-native-mds-movesense' doesn't seem to be linked. Make sure: \n\n` +
    Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
    '- You rebuilt the app after installing the package\n' +
    '- You are not using Expo Go\n';

const Movesense = NativeModules.Movesense
    ? NativeModules.Movesense
    : new Proxy(
          {},
          {
              get() {
                  throw new Error(LINKING_ERROR);
              },
          }
      );

interface MovesenseInterface {
    /**
     * Initialize module. This method is the first that needs to be called.
     */
    init(): Promise<void>;
    /**
     * Starts a Bluetooth scan for nearby Movesense devices.
     */
    scan(): Promise<void>;
    /**
     * Stops the ongoing Bluetooth scan for nearby Movesense devices.
     */
    stopScan(): Promise<void>;
    /**
     * Check whether the module is scanning or not.
     */
    isScanning(): Promise<boolean>;
    /**
     * Connects to a Movesense device with the given MAC address.
     * @param address - The MAC address of the device to connect to.
     * @returns A promise of an object containing the MAC address of the connected device and its serial number.
     */
    connect(address: string): Promise<MovesenseDevice>;
    /**
     * Disconnects from a Movesense device with the given MAC address.
     * @param address - The MAC address of the device to disconnect from.
     */
    disconnect(address: string): Promise<void>;
    /**
     * Get all scanned devices.
     * @returns All devices available for connection.
     */
    getAvailableDevices(): Promise<MovesenseScannedDevice[]>;
    /**
     * Get all connected devices.
     * @returns Get all connected devices.
     */
    getConnectedDevices(): Promise<MovesenseReadyDevice[]>;
    /**
     * Sends a GET request to the specified Movesense device and contract.
     * @param uri - The URI of the resource to retrieve.
     * @param contract - The contract to use for the request.
     * @returns The response data.
     */
    get(uri: string, contract: string): Promise<string>;
    /**
     * Sends a PUT request to the specified Movesense device and contract.
     * @param uri - The URI of the resource to update.
     * @param contract - The contract to use for the request.
     * @returns The response data.
     */
    put(uri: string, contract: string): Promise<string>;
    /**
     * Sends a POST request to the specified Movesense device and contract.
     * @param uri - The URI of the resource to update.
     * @param contract - The contract to use for the request.
     * @returns The response data.
     */
    post(uri: string, contract: string): Promise<string>;
    /**
     * Sends a DELETE request to the specified Movesense device and contract.
     * @param uri - The URI of the resource to delete.
     * @param contract - The contract to use for the request.
     * @returns The response data.
     */
    del(uri: string, contract: string): Promise<string>;
    /**
     * Subscribe to a URI on a Movesense device to recieve updates about it.
     * @param uri - The URI of the resource to subscribe to.
     * @param contract - The contract to use for the subscription request.
     * @returns The subscription ID that can be used later to unsubscribe.
     */
    subscribe(uri: string, contract: string): Promise<string>;
    /**
     * Unsubscribe from a subscription to a device update.
     * @param subscriptionId - The subscription ID of the subscription to unsbscribe from.
     */
    unsubscribe(subscriptionId: string): Promise<void>;
}

// Export all types...
export * from './types/index';
// ... and the module it self
export default Movesense as MovesenseInterface;
