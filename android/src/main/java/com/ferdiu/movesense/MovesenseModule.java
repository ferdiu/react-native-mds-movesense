package com.ferdiu.movesense;

import android.bluetooth.BluetoothDevice;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.movesense.mds.Logger;
import com.movesense.mds.Mds;
import com.movesense.mds.MdsConnectionListener;
import com.movesense.mds.MdsException;
import com.movesense.mds.MdsNotificationListener;
import com.movesense.mds.MdsResponseListener;
import com.movesense.mds.MdsSubscription;

import com.ferdiu.movesense.BleScanner;
import com.ferdiu.movesense.BleScanner.BleScannerCallback;

@ReactModule(name = MovesenseModule.NAME)
public class MovesenseModule extends ReactContextBaseJavaModule {
    public static final String NAME = "Movesense";

    ReactApplicationContext reactContext;

    private Mds mds;
    private BleScanner scanner = null;

    private Map<String, MdsSubscription> subscriptionMap;

    private boolean mIsScanning = false;
    private boolean mInitialized = false;

    private HashMap<String, BluetoothDevice> mAvailableDevices;
    private HashMap<String, String> mConnectedDevices;

    private MovesenseModule lock;

    public MovesenseModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.mAvailableDevices = new HashMap<String, BluetoothDevice>();
        this.mConnectedDevices = new HashMap<String, String>();
        this.lock = this;
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }


    @ReactMethod
    public void init(final Promise promise) {
        try {
            if (!this.mInitialized) {
                this.mds = Mds.builder().build(this.reactContext);
                Logger.setPipeToOSLoggingEnabled(true);
                this.subscriptionMap = new HashMap<>();
                this.scanner = new BleScanner(reactContext, 10000, new BleScannerCallback() {
                    @Override
                    public void onDeviceFound(BluetoothDevice device) {
                        synchronized (lock) {
                            if (!mAvailableDevices.containsKey(device.getAddress())) {
                                mAvailableDevices.put(device.getAddress(), device);
                            }
                            sendNewScannedDeviceEvent(device.getName(), device.getAddress());
                        }
                    }

                    @Override
                    public void onScanFailed(int errorCode) {
                        WritableMap m = Arguments.createMap();
                        m.putString("message", "Scan failed");
                        sendEvent("Error", m);
                    }

                    @Override
                    public void onScanStarted() {
                        sendEvent("ScanStarted", null);
                    }

                    @Override
                    public void onScanStopped() {
                        sendEvent("ScanStopped", null);
                    }
                });
                this.mInitialized = true;
            }
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("MovesenseModule initialization failed:", e);
        }
    }

    @ReactMethod
    public void scan(final Promise promise) {
        try {
            this.mAvailableDevices.clear();
            this.scanner.scan();
            this.mIsScanning = true;
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("Start scanning failed:", e);
        }
    }

    @ReactMethod
    public void stopScan(final Promise promise) {
        try {
            this.scanner.stopScan();
            this.mIsScanning = false;
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("Stop scanning failed:", e);
        }
    }

    @ReactMethod
    public void isScanning(final Promise promise) {
        promise.resolve(this.mIsScanning);
    }

    @ReactMethod
    public void connect(String address, final Promise promise) {
        mds.connect(address, new MdsConnectionListener() {
            @Override
            public void onConnect(String address) {
                WritableMap m = Arguments.createMap();
                m.putString("address", address);
                sendEvent("Connected", m);
            }

            @Override
            public void onConnectionComplete(String address, String serial) {
                synchronized (lock) {
                    if (!mConnectedDevices.containsKey(address)) {
                        mConnectedDevices.put(address, serial);
                    }

                    WritableMap m = Arguments.createMap();
                    m.putString("address", address);
                    m.putString("serial", serial);
                    sendEvent("ConnectionCompleted", m.copy());

                    promise.resolve(m);
                }
            }

            @Override
            public void onError(MdsException e) {
                WritableMap m = Arguments.createMap();
                m.putString("message", e.getMessage());
                sendEvent("Error", m.copy());

                promise.reject("Error occurred", m);
            }

            @Override
            public void onDisconnect(String address) {
                synchronized (lock) {
                    if (!mConnectedDevices.containsKey(address)) {
                        mConnectedDevices.remove(address);
                    }

                    WritableMap m = Arguments.createMap();
                    m.putString("address", address);
                    sendEvent("Disconnected", m);
                }
            }
        });
    }

    @ReactMethod
    public void disconnect(String address, final Promise promise) {
        try {
            synchronized (lock) {
                if (this.mConnectedDevices.containsKey(address)) {
                    this.mConnectedDevices.remove(address);
                }
            }
            mds.disconnect(address);
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("Error while disconnecting device " + address + ":", e);
        }
    }

    @ReactMethod
    public void getAvailableDevices(final Promise promise) {
        synchronized (lock) {
            WritableArray a = Arguments.createArray();
            for(Map.Entry<String, BluetoothDevice> entry : this.mAvailableDevices.entrySet()) {
                BluetoothDevice d = entry.getValue();
                if (mConnectedDevices.containsKey(d.getAddress()))
                    continue;
                WritableMap m = Arguments.createMap();
                m.putString("address", d.getAddress());
                m.putString("name", d.getName());
                a.pushMap(m);
            }
            promise.resolve(a);
        }
    }

    @ReactMethod
    public void getConnectedDevices(final Promise promise) {
        synchronized (lock) {
            WritableArray a = Arguments.createArray();
            for(Map.Entry<String, String> device : this.mConnectedDevices.entrySet()) {
                WritableMap m = Arguments.createMap();
                m.putString("address", device.getKey());
                m.putString("serial", device.getValue());
                a.pushMap(m);
            }
            promise.resolve(a);
        }
    }

    @ReactMethod
    public void get(@NonNull String uri, String contract, final Promise promise) {
        mds.get(uri, contract, new MdsResponseListener() {
            @Override
            public void onSuccess(String data) {
                WritableMap m = Arguments.createMap();
                m.putString("uri", uri);
                m.putString("contract", contract);
                m.putString("data", data);
                sendEvent("GETSuccess", m.copy());

                promise.resolve(m);
            }

            @Override
            public void onError(MdsException e) {
                WritableMap m = Arguments.createMap();
                m.putString("uri", uri);
                m.putString("contract", contract);
                m.putString("requestType", "GET");
                m.putString("message", e.getMessage());
                sendEvent("Error", m.copy());

                promise.reject("Error occurred", m);
            }
        });
    }

    @ReactMethod
    public void put(@NonNull String uri, String contract, final Promise promise) {
        mds.put(uri, contract, new MdsResponseListener() {
            @Override
            public void onSuccess(String data) {
                WritableMap m = Arguments.createMap();
                m.putString("uri", uri);
                m.putString("contract", contract);
                m.putString("data", data);
                sendEvent("PUTSuccess", m.copy());

                promise.resolve(m);
            }

            @Override
            public void onError(MdsException e) {
                WritableMap m = Arguments.createMap();
                m.putString("uri", uri);
                m.putString("contract", contract);
                m.putString("requestType", "PUT");
                m.putString("message", e.getMessage());
                sendEvent("Error", m.copy());

                promise.reject("Error occurred", m);
            }
        });
    }

    @ReactMethod
    public void post(@NonNull String uri, String contract, final Promise promise) {
        mds.post(uri, contract, new MdsResponseListener() {
            @Override
            public void onSuccess(String data) {
                WritableMap m = Arguments.createMap();
                m.putString("uri", uri);
                m.putString("contract", contract);
                m.putString("data", data);
                sendEvent("POSTSuccess", m.copy());

                promise.resolve(m);
            }

            @Override
            public void onError(MdsException e) {
                WritableMap m = Arguments.createMap();
                m.putString("uri", uri);
                m.putString("contract", contract);
                m.putString("requestType", "POST");
                m.putString("message", e.getMessage());
                sendEvent("Error", m.copy());

                promise.reject("Error occurred", m);
            }
        });
    }

    @ReactMethod
    public void del(@NonNull String uri, String contract, final Promise promise) {
        mds.delete(uri, contract, new MdsResponseListener() {
            @Override
            public void onSuccess(String data) {
                WritableMap m = Arguments.createMap();
                m.putString("uri", uri);
                m.putString("contract", contract);
                m.putString("data", data);
                sendEvent("DELETESuccess", m.copy());

                promise.resolve(m);
            }

            @Override
            public void onError(MdsException e) {
                WritableMap m = Arguments.createMap();
                m.putString("uri", uri);
                m.putString("contract", contract);
                m.putString("requestType", "DELETE");
                m.putString("message", e.getMessage());
                sendEvent("Error", m.copy());

                promise.reject("Error occurred", m);
            }
        });
    }

    @ReactMethod
    public void subscribe(@NonNull String uri, String contract, final Promise promise) {
        try {
            String subscriptionId = UUID.randomUUID().toString();
            MdsSubscription subscription = mds.subscribe(uri, contract, new MdsNotificationListener() {
                @Override
                public void onNotification(String s) {
                    sendNotificationEvent(subscriptionId, s);
                }

                @Override
                public void onError(MdsException e) {
                    sendNotificationErrorEvent(subscriptionId, e.getMessage());
                }
            });
            subscriptionMap.put(subscriptionId, subscription);
            promise.resolve(subscriptionId);
        } catch (Exception e) {
            promise.reject("Failed to subscribe:", e);
        }
    }

    @ReactMethod
    public void unsubscribe(String subscriptionId, final Promise promise) {
        MdsSubscription subscription = subscriptionMap.get(subscriptionId);

        if (null != subscription) {
            // NOTE: should throw when unsubscribing from not subscribed subscriptionId?
            subscription.unsubscribe();
            subscriptionMap.remove(subscriptionId);
        }
    }

    private void sendNotificationEvent(String subscriptionId, String data) {
        WritableMap params = Arguments.createMap();
        params.putString("subscription", subscriptionId);
        params.putString("data", data);
        sendEvent("Notification", params);
    }

    private void sendNewScannedDeviceEvent(String name, String address) {
        WritableMap params = Arguments.createMap();
        params.putString("name", name);
        params.putString("address", address);
        sendEvent("ScannedDevice", params);
    }

    private void sendNotificationErrorEvent(String subscriptionId, String message) {
        WritableMap params = Arguments.createMap();
        params.putString("subscription", subscriptionId);
        params.putString("message", message);
        sendEvent("NotificationError", params);
    }

    private void sendEvent(String eventName, @Nullable WritableMap params) {
        this.reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
    }

    // Required for rn built in EventEmitter Calls.
    @ReactMethod
    public void addListener(String eventName) {

    }

    @ReactMethod
    public void removeListeners(Integer count) {

    }
}
