import type { TimestampData } from '../timestamp';
import type { Vec3 } from './_vec';

// https://bitbucket.org/movesense/movesense-device-lib/src/master/MovesenseCoreLib/resources/movesense-api/meas/acc.yaml
// /Meas/Acc/Info : GET
// /Meas/Acc/Config : GET, PUT
// /Meas/Acc/{SampleRate} : SUBSCRIBE
export type MeasAccData = {
    ArrayAcc: Vec3[];
} & TimestampData;
