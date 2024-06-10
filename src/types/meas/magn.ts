import type { TimestampData } from '../timestamp';
import type { Vec3 } from './_vec';

// https://bitbucket.org/movesense/movesense-device-lib/src/master/MovesenseCoreLib/resources/movesense-api/meas/magn.yaml
// /Meas/Magn/Info : GET
// /Meas/Magn/Config : GET, PUT
// /Meas/Magn/{SampleRate} : SUBSCRIBE
export type MeasMagnData = {
    ArrayMagn: Vec3[];
} & TimestampData;
