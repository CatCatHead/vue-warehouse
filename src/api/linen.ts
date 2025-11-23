// src/api/linen.ts
import { http } from "@/utils/request";

export interface LinenItem {
  id: string;
  itemId: string;
  description: string;
  onHand: number;
  minStock: number;
  maxStock: number;
  category: string;
  location: string;
  status: "ACTIVE" | "INACTIVE" | "LOW_STOCK";
  lastUpdated: string;
  createdAt: string;
}

export interface LinenListParams {
  page?: number;
  size?: number;
  itemId?: string;
  description?: string;
  category?: string;
  status?: string;
}

export interface LinenListResponse {
  list: LinenItem[];
  total: number;
  page: number;
  size: number;
}

export interface OperationRequest {
  quantity: number;
  notes?: string;
}

const fromBackendLinen = (l: any): LinenItem => ({
  id: String(l.id),
  itemId: l.itemId,
  description: l.description,
  onHand: l.onHand,
  minStock: l.minStock,
  maxStock: l.maxStock,
  category: l.category,
  location: l.location,
  status: l.status,
  lastUpdated: l.lastUpdated,
  createdAt: l.createdAt,
});

export const linenApi = {
  async getLinenItems(params: LinenListParams): Promise<LinenListResponse> {
    const res = await http.get<any>("/linen", params);
    return {
      list: (res.list || []).map(fromBackendLinen),
      total: res.total ?? 0,
      page: res.page ?? params.page,
      size: res.size ?? params.size,
    };
  },

  async createLinen(
    linen: Omit<LinenItem, "id" | "createdAt" | "lastUpdated">,
  ): Promise<LinenItem> {
    const res = await http.post<any>("/linen", linen);
    return fromBackendLinen(res);
  },

  async updateLinen(id: string, linen: Partial<LinenItem>): Promise<LinenItem> {
    const res = await http.put<any>(`/linen/${id}`, linen);
    return fromBackendLinen(res);
  },

  deleteLinen(id: string): Promise<void> {
    return http.delete<void>(`/linen/${id}`);
  },

  async inbound(
    id: string,
    quantity: number,
    notes?: string,
  ): Promise<LinenItem> {
    const res = await http.post<any>(`linen/${id}/inbound`, {
      quantity,
      notes,
    });
    return fromBackendLinen(res);
  },

  async outbound(
    id: string,
    quantity: number,
    notes?: string,
  ): Promise<LinenItem> {
    const res = await http.post<any>(`/linen/${id}/outbound`, {
      quantity,
      notes,
    });
    return fromBackendLinen(res);
  },
};
