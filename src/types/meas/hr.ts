// https://bitbucket.org/movesense/movesense-device-lib/src/master/MovesenseCoreLib/resources/movesense-api/meas/hr.yaml
// /Meas/HR/Info : GET
// /Meas/HR : SUBSCRIBE
export type MeasHRData = {
    average: number;
    rrData: number[];
};
