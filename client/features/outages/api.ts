import apiClient from "@/lib/apiClient";
import { Outage, CreateOutagePayload, LocalityStatus } from "./types";

export async function createOutage(payload: CreateOutagePayload): Promise<Outage> {
    const res = await apiClient.post("/outage", payload);
    return res.data;
}

import { PaginatedResult } from "@/lib/types";

export async function getOutagesByLocality(localityId: number, search: string = "", page: number = 1, pageSize: number = 10): Promise<PaginatedResult<Outage>> {
    const res = await apiClient.get(`/outage`, { params: { localityId, search, page, pageSize } });
    return res.data;
}

export async function getLocalityStatus(localityId: number): Promise<LocalityStatus> {
    const res = await apiClient.get(`/outage/status?localityId=${localityId}`);
    return res.data;
}

export async function resolveOutage(id: number): Promise<void> {
    await apiClient.patch(`/outage/${id}/resolve`);
}