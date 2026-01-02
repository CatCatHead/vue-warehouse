// src/api/trackingEntry.ts
import { http } from "@/utils/request";

export type TrackingEntryStatus =
  | "NEW"
  | "CONFIRMED"
  | "REJECTED"
  | "DUPLICATE";

export interface TrackingEntry {
  id: string;
  carrier: string;
  trackingNumber: string;
  status: TrackingEntryStatus;
  scanSource?: string;
  scannedAt?: string;
  createdAt?: string;
  createdBy?: string;
}

export interface TrackingEntryListParams {
  page?: number;
  size?: number;
  carrier?: string;
  trackingNumber?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
}

export interface TrackingEntryListResponse {
  list: TrackingEntry[];
  total: number;
  page: number;
  size: number;
}

export interface CreateTrackingEntryDto {
  carrier: string;
  trackingNumber: string;
  scanSource?: string;
  scannedAt?: string;
}

const fromBackendTrackingEntry = (e: any): TrackingEntry => ({
  id: String(e.id),
  carrier: e.carrier,
  trackingNumber: e.trackingNumber,
  status: e.status,
  scanSource: e.scanSource,
  scannedAt: e.scannedAt,
  createdAt: e.createdAt,
  createdBy: e.createdBy,
});

export const trackingEntryApi = {
  async getTrackingEntries(
    params: TrackingEntryListParams,
  ): Promise<TrackingEntryListResponse> {
    const res = await http.get<any>("/tracking-entries", params);
    return {
      list: (res.list || []).map(fromBackendTrackingEntry),
      total: res.total ?? 0,
      page: res.page ?? params.page ?? 1,
      size: res.size ?? params.size ?? 20,
    };
  },

  async createTrackingEntry(
    data: CreateTrackingEntryDto,
  ): Promise<TrackingEntry> {
    const res = await http.post<any>("/tracking-entries", data);

    const raw = res.data ?? res;
    return fromBackendTrackingEntry(raw);
  },

  // Confirm
  async confirmEntry(id: string | number): Promise<any> {
    return http.post<any>(`/tracking-entries/${id}/confirm`, {});
  },

  // Reject
  async rejectEntry(id: string | number): Promise<void> {
    await http.post(`/tracking-entries/${id}/reject`, {});
  },
};

export function createTrackingEntry(data: CreateTrackingEntryDto) {
  return trackingEntryApi.createTrackingEntry(data);
}
