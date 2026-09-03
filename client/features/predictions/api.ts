import apiClient from "@/lib/apiClient";
import { PredictionResponse } from "./types";

export async function getPredictions(localityId: number): Promise<PredictionResponse> {
  const res = await apiClient.get(`/prediction?localityId=${localityId}`);
  return res.data;
}
