import apiClient from "@/lib/apiClient";

export interface CreateComplaintDto {
    category: string;
    type: string;
    title?: string;
    description: string;
    localityId?: number;
    specificLocation?: string;
    evidenceUrl?: string;
}

export interface ComplaintResponseDto {
    id: number;
    publicReferenceId: string;
    category: string;
    type: string;
    title?: string;
    description?: string;
    localityId?: number;
    localityName?: string;
    specificLocation?: string;
    status: string;
    evidenceUrl?: string;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
    vouchCount: number;
    submitterName: string;
    submitterIsVerified: boolean;
}

export interface PaginatedComplaints {
    items: ComplaintResponseDto[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export const createComplaint = async (data: CreateComplaintDto): Promise<ComplaintResponseDto> => {
    const res = await apiClient.post<ComplaintResponseDto>("/complaints", data);
    return res.data;
};

export const getPublicComplaints = async (localityId?: number, page: number = 1, pageSize: number = 10): Promise<PaginatedComplaints> => {
    const params = new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
    if (localityId) params.append("localityId", localityId.toString());
    const res = await apiClient.get<PaginatedComplaints>(`/complaints?${params.toString()}`);
    return res.data;
};

export const getMyComplaints = async (page: number = 1, pageSize: number = 10): Promise<PaginatedComplaints> => {
    const res = await apiClient.get<PaginatedComplaints>(`/complaints/me?page=${page}&pageSize=${pageSize}`);
    return res.data;
};

export const getMyComplaint = async (id: number): Promise<ComplaintResponseDto> => {
    const res = await apiClient.get<ComplaintResponseDto>(`/complaints/me/${id}`);
    return res.data;
};

export const uploadEvidence = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post("/complaints/upload-evidence", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data.url;
};

export const vouchForComplaint = async (id: number): Promise<{ message: string }> => {
    const res = await apiClient.post(`/complaints/${id}/vouch`);
    return res.data;
};
