import type { TimestampData } from '../timestamp';
import type { Vec3 } from './_vec';

// https://bitbucket.org/movesense/movesense-device-lib/src/master/MovesenseCoreLib/resources/movesense-api/meas/gyro.yaml
// /Meas/Gyro/Info : GET
// /Meas/Gyro/Config : GET, PUT
// /Meas/Gyro/{SampleRate} : SUBSCRIBE
export type MeasGyroData = {
    ArrayGyro: Vec3[];
} & TimestampData;
