import apiClient from "@/lib/apiClient";
import { Area } from "./types";

import { PaginatedResult } from "@/lib/types";

export async function getAreas(search: string = "", page: number = 1, pageSize: number = 10): Promise<PaginatedResult<Area>> {
    const res = await apiClient.get("/area", { params: { search, page, pageSize } });
    return res.data;
}

export async function getAreaById(id: number): Promise<Area> {
    const res = await apiClient.get(`/area/${id}`);
    return res.data;
}

export async function createArea(payload: {
  name: string;
  pinCode: string;
  latitude: number;
  longitude: number;
}): Promise<Area> {
  const res = await apiClient.post("/area", payload);
  return res.data;
}