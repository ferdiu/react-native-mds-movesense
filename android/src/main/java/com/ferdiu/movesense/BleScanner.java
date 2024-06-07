package com.ferdiu.movesense;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanResult;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.widget.Toast;

public class BleScanner {

    private BluetoothLeScanner bleScanner;
    private boolean scanning;
    private Handler handler;

    // Stops scanning after 10 seconds.
    private long scanPeriod;

    private BleScannerCallback callback;

    public BleScanner(Context context, long scanPeriod, BleScannerCallback callback) {
        BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        if (bluetoothAdapter == null) {
            Toast.makeText(context, "Bluetooth not supported", Toast.LENGTH_SHORT).show();
            return;
        }
        this.scanPeriod = scanPeriod;
        this.bleScanner = bluetoothAdapter.getBluetoothLeScanner();
        this.handler = new Handler(Looper.getMainLooper());
        this.callback = callback;
    }

    public void scan() {
        if (bleScanner == null || scanning) {
            return;
        }
        // Stop scanning after a predefined scan period.
        handler.postDelayed(this::stopScan, this.scanPeriod);

        scanning = true;
        bleScanner.startScan(bleScanCallback);
        if (this.callback != null) {
            this.callback.onScanStarted();
        }
    }

    public void stopScan() {
        if (bleScanner == null || !scanning) {
            return;
        }
        scanning = false;
        bleScanner.stopScan(bleScanCallback);
        if (this.callback != null) {
            this.callback.onScanStopped();
        }
    }

    // Device scan callback.
    private final ScanCallback bleScanCallback = new ScanCallback() {
        @Override
        public void onScanResult(int callbackType, ScanResult result) {
            super.onScanResult(callbackType, result);
            BluetoothDevice device = result.getDevice();
            if (callback != null) {
                callback.onDeviceFound(device);
            }
        }

        @Override
        public void onBatchScanResults(java.util.List<ScanResult> results) {
            super.onBatchScanResults(results);
            for (ScanResult result : results) {
                BluetoothDevice device = result.getDevice();
                if (callback != null) {
                    callback.onDeviceFound(device);
                }
            }
        }

        @Override
        public void onScanFailed(int errorCode) {
            super.onScanFailed(errorCode);
            if (callback != null) {
                callback.onScanFailed(errorCode);
            }
        }
    };

    public interface BleScannerCallback {
        void onDeviceFound(BluetoothDevice device);
        void onScanFailed(int errorCode);

        void onScanStarted();

        void onScanStopped();
    }
}
