export interface Pattern {
  dayOfWeek: string;
  hourBucketStart: number;
  hourBucketEnd: number;
  outageType: string;
  occurrenceCount: number;
}

export interface PredictionResponse {
  localityId: number;
  localityName: string;
  patterns: Pattern[];
}
