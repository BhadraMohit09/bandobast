import apiClient from "@/lib/apiClient";
import { PaginatedResult } from "@/lib/types";

export interface OutageDto {
    id: number;
    localityId: number;
    localityName: string;
    type: string;
    reportedAt: string;
    resolvedAt: string | null;
}

export interface Badge {
    badgeName: string;
    earnedAt: string;
}

export interface UserProfile {
    id: number;
    email: string;
    displayName: string;
    profilePhotoUrl: string | null;
    phoneNumber?: string;
    bio?: string;
    preferredLocalityId?: number;
    createdAt: string;
    civicPoints: number;
    isVerified: boolean;
    badges: Badge[];
}

export interface UpdateProfilePayload {
    displayName: string;
    phoneNumber?: string;
    bio?: string;
    preferredLocalityId?: number;
}

export async function purchaseVerification(token: string): Promise<void> {
    await apiClient.post(`/User/purchase-verification`);
}

export async function getUserProfile(token: string): Promise<UserProfile> {
    const response = await apiClient.get(`/User/profile`);
    return response.data;
}

export async function getUserOutages(token: string, search: string = "", page: number = 1, pageSize: number = 10): Promise<PaginatedResult<OutageDto>> {
    const response = await apiClient.get(`/User/profile/outages`, { params: { search, page, pageSize } });
    return response.data;
}

export async function updateUserProfile(token: string, payload: UpdateProfilePayload): Promise<void> {
    await apiClient.put(`/User/profile`, payload);
}

export async function uploadProfilePhoto(token: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.put(`/User/profile-photo`, formData, {
        headers: { 
            "Content-Type": "multipart/form-data" 
        }
    });
    return response.data.url;
}
