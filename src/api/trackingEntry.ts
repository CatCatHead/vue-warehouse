//src/api/trackingEntry.ts
import { http } from "@/utils/request";

export interface TrackingEntryQuery {
  page?: number;
  size?: number;
  carrier?: string;
  trackingNumber?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
}

export interface TrackingEntry {
  id: number;
  carrier: string;
  trackingNumber: string;
  scanSource?: string;
  scannedAt?: string;
  createdBy?: string;
  createdAt?: string;
  status?: string;
}

export function fetchTrackingEntries(params: TrackingEntryQuery) {
  return http.get<{ list: TrackingEntry[]; total: number }>(
    "/tracking-entries",
    {
      params,
    },
  );
}

export function confirmTrackingEntry(id: number) {
  return http.post(`/tracking-entries/${id}/confirm`);
}

export function rejectTrackingEntry(id: number) {
  return http.post(`/tracking-entries/${id}/reject`);
}

//======= Created: TrackingEntry for scanning =====

export interface CreateTrackingEntryDto {
  carrier: string;
  trackingNumber: string;
  scanSource?: string;
  scannedAt?: string;
}

export function createTrackingEntry(data: CreateTrackingEntryDto) {
  return http.post("/tracking-entries", data);
}
