import type { TimestampData as T } from '../timestamp';
import type { MeasAccData as A } from './acc';
import type { MeasGyroData as G } from './gyro';
import type { MeasMagnData as M } from './magn';

// https://bitbucket.org/movesense/movesense-device-lib/src/master/MovesenseCoreLib/resources/movesense-api/meas/imu.yaml
// /Meas/IMU/Info : GET
// /Meas/IMU/Config : GET, PUT
// /Meas/IMU6/{SampleRate} : SUBSCRIBE   Combined Acc & Gyro
// /Meas/IMU6m/{SampleRate} : SUBSCRIBE   Combined Acc & Magn
// /Meas/IMU9/{SampleRate} : SUBSCRIBE   Combined Acc, Gyro & Magn
export type MeasIMU6Data = A & G & T;
export type MeasIMU6mData = A & M & T;
export type MeasIMU9Data = A & G & M & T;
