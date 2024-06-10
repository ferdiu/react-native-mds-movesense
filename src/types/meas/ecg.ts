import type { TimestampData } from '../timestamp';

// https://bitbucket.org/movesense/movesense-device-lib/src/master/MovesenseCoreLib/resources/movesense-api/meas/ecg.yaml
// /Meas/ECG/Info : GET
// /Meas/ECG/Config : GET, PUT
// /Meas/ECG/{RequiredSampleRate} : SUBSCRIBE
export type MeasECGData = {
    Samples: number[];
} & TimestampData;
