import apiClient from "@/lib/apiClient";

export interface Badge {
  badgeName: string;
  earnedAt: string;
}

export interface ProfileResponse {
  id: number;
  email: string;
  displayName: string;
  profilePhotoUrl?: string;
  phoneNumber?: string;
  bio?: string;
  role: string;
  civicPoints: number;
  createdAt: string;
  preferredLocality?: {
    id: number;
    name: string;
    pinCode: string;
  };
  badges: Badge[];
}

export const getMyProfile = async (): Promise<ProfileResponse> => {
  const res = await apiClient.get<ProfileResponse>("/profile/me");
  return res.data;
};
