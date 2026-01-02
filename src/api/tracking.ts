// src/api/tracking.ts
import { http } from "@/utils/request";

export interface TrackingNumber {
  id: string | number;
  trackingNumber: string;
  carrierType: string;
  status: string;
  createdAt: string; // ISO date string, e.g. "2025-11-01T10:00:00"
  note?: string;
}

export interface TrackingListParams {
  page?: number;
  size?: number;
  trackingNumber?: string;
  carrierType?: string; // when multiple types are selected, send as "UPS,FedEx"
  status?: string;
  startDate?: string; // "YYYY-MM-DD"
  endDate?: string; // "YYYY-MM-DD"
}

export interface TrackingListResponse {
  list: TrackingNumber[];
  total: number;
  page: number;
  size: number;
}

export interface TrackingCreateRequest {
  trackingNumber: string;
  carrierType: string;
  status: string;
  createdAt?: string;
  note?: string;
}

export interface TrackingUpdateRequest {
  trackingNumber?: string;
  carrierType?: string;
  status?: string;
  createdAt?: string;
  note?: string;
}

export const trackingApi = {
  async getTrackingNumbers(
    params: TrackingListParams,
  ): Promise<TrackingListResponse> {
    // Adjust path if your backend uses a different prefix
    const res = await http.get<any>("/tracking-numbers", params);
    return res;
  },

  async createTrackingNumber(
    payload: TrackingCreateRequest,
  ): Promise<TrackingNumber> {
    const res = await http.post<TrackingNumber>("/tracking-numbers", payload);
    return res;
  },

  async updateTrackingNumber(
    id: string | number,
    payload: TrackingUpdateRequest,
  ): Promise<TrackingNumber> {
    const res = await http.put<TrackingNumber>(
      `/tracking-numbers/${id}`,
      payload,
    );
    return res;
  },

  async deleteTrackingNumber(id: string | number): Promise<void> {
    await http.delete(`/tracking-numbers/${id}`);
  },
};
