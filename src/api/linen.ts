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
  status: "active" | "inactive" | "low_stock";
  location: string;
  lastUpdated: string;
  createdAt: string;
}

export interface LinenListResponse {
  list: LinenItem[];
  total: number;
  page: number;
  size: number;
}

export const linenApi = {
  getLinenItems(params: {
    page?: number;
    size?: number;
    itemId?: string;
    description?: string;
    status?: string;
  }): Promise<LinenListResponse> {
    return http.get("/linen", { params });
  },

  createLinen(
    item: Omit<LinenItem, "id" | "lastUpdated" | "createdAt">,
  ): Promise<LinenItem> {
    return http.post("/linen", item);
  },

  updateLinen(id: string, item: Partial<LinenItem>): Promise<LinenItem> {
    return http.put(`/linen/${id}`, item);
  },

  deleteLinen(id: string): Promise<void> {
    return http.delete(`/linen/${id}`);
  },

  inbound(id: string, quantity: number, notes?: string): Promise<LinenItem> {
    return http.post(`/linen/${id}/inbound`, { quantity, notes });
  },

  outbound(id: string, quantity: number, notes?: string): Promise<LinenItem> {
    return http.post(`/linen/${id}/outbound`, { quantity, notes });
  },
};
