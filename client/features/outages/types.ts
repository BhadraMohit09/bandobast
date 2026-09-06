export enum OutageType {
  Power = 0,
  Water = 1,
}

export interface Outage {
  id: number;
  localityId: number;
  localityName: string;
  type: OutageType;
  reportedAt: string;
  userId: number | null;
}

export interface CreateOutagePayload {
  localityId: number;
  type: OutageType;
  latitude?: number;
  longitude?: number;
}

export interface LocalityStatus {
  hasActivePowerOutage: boolean;
  hasActiveWaterOutage: boolean;
  lastPowerReport: string | null;
  lastWaterReport: string | null;
}