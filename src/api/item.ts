//src/api/item.ts

import { http } from "@/utils/request";

export interface Item {
  id: string;
  itemId: string;
  itemDescription: string;
  unitOfPrice: number;
  unit: string;
  itemGraph: string;
}

export interface ItemListParams {
  page?: number;
  size?: number;
  itemId?: string;
  itemDescription?: string;
  unit?: string;
}

export interface ItemListResponse {
  list: Item[];
  total: number;
  page: number;
  size: number;
}

export interface PriceUpdateRequest {
  unitOfPrice: number;
  reason?: string;
}

export interface ItemCreateRequest {
  itemId: string;
  itemDescription: string;
  unitOfPrice: number;
  unit: string;
  itemGraph?: string;
}

export interface ItemUpdateRequest {
  itemDescription?: string;
  unitOfPrice?: number;
  unit?: string;
  itemGraph?: string;
}

// Transform backend data to frontend format
const fromBackendItem = (item: any): Item => ({
  id: String(item.id),
  itemId: item.itemId,
  itemDescription: item.itemDescription,
  unitOfPrice: Number(item.unitOfPrice),
  unit: item.unit,
  itemGraph: item.itemGraph || "",
});

// Transform frontend data to backend format
const toBackendItem = (item: ItemCreateRequest | ItemUpdateRequest): any => ({
  itemId: (item as ItemCreateRequest).itemId,
  itemDescription: item.itemDescription,
  unitOfPrice: item.unitOfPrice,
  unit: item.unit,
  itemGraph: item.itemGraph,
});

export const itemApi = {
  /**
   * Get paginated list of items with optional filters
   */
  async getItems(params: ItemListParams): Promise<ItemListResponse> {
    const res = await http.get<any>("/items", params);
    return {
      list: (res.list || []).map(fromBackendItem),
      total: res.total ?? 0,
      page: res.page ?? params.page ?? 1,
      size: res.size ?? params.size ?? 10,
    };
  },

  /**
   * Get single item by ID
   */
  async getItem(id: string): Promise<Item> {
    const res = await http.get<any>(`/items/${id}`);
    return fromBackendItem(res);
  },

  /**
   * Create a new item
   */
  async createItem(item: ItemCreateRequest): Promise<Item> {
    const res = await http.post<any>("/items", toBackendItem(item));
    return fromBackendItem(res);
  },

  /**
   * Update an existing item
   */
  async updateItem(id: string, item: ItemUpdateRequest): Promise<Item> {
    const res = await http.put<any>(`/items/${id}`, toBackendItem(item));
    return fromBackendItem(res);
  },

  /**
   * Delete an item
   */
  async deleteItem(id: string): Promise<void> {
    return http.delete<void>(`/items/${id}`);
  },

  /**
   * Batch delete multiple items
   */
  async batchDeleteItems(ids: string[]): Promise<void> {
    return http.post<void>("/items/batch-delete", { ids });
  },

  /**
   * Update item price with optional reason
   */
  async updatePrice(id: string, request: PriceUpdateRequest): Promise<Item> {
    const res = await http.patch<any>(`/items/${id}/price`, {
      unitOfPrice: request.unitOfPrice,
      reason: request.reason,
    });
    return fromBackendItem(res);
  },

  /**
   * Search items by description (full-text search)
   */
  async searchItems(
    query: string,
    params?: Omit<ItemListParams, "itemDescription">,
  ): Promise<ItemListResponse> {
    const res = await http.get<any>("/items/search", {
      ...params,
      q: query,
    });
    return {
      list: (res.list || []).map(fromBackendItem),
      total: res.total ?? 0,
      page: res.page ?? params?.page ?? 1,
      size: res.size ?? params?.size ?? 10,
    };
  },

  /**
   * Get items by unit type
   */
  async getItemsByUnit(
    unit: string,
    params?: Omit<ItemListParams, "unit">,
  ): Promise<ItemListResponse> {
    const res = await http.get<any>("/items/by-unit", {
      ...params,
      unit,
    });
    return {
      list: (res.list || []).map(fromBackendItem),
      total: res.total ?? 0,
      page: res.page ?? params?.page ?? 1,
      size: res.size ?? params?.size ?? 10,
    };
  },

  /**
   * Upload item image
   */
  async uploadItemImage(
    id: string,
    imageFile: File,
  ): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append("image", imageFile);

    const res = await http.post<any>(`/items/${id}/upload-image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return {
      imageUrl: res.imageUrl,
    };
  },

  /**
   * Validate item ID uniqueness
   */
  async validateItemId(
    itemId: string,
  ): Promise<{ valid: boolean; message?: string }> {
    const res = await http.get<any>(`/items/validate/${itemId}`);
    return {
      valid: res.valid,
      message: res.message,
    };
  },

  /**
   * Get price history for an item
   */
  async getPriceHistory(id: string): Promise<
    Array<{
      unitOfPrice: number;
      updatedAt: string;
      updatedBy: string;
      reason?: string;
    }>
  > {
    const res = await http.get<any>(`/items/${id}/price-history`);
    return res.history || [];
  },

  /**
   * Export items to Excel
   */
  async exportItems(params?: ItemListParams): Promise<Blob> {
    return http.get<Blob>("/items/export", {
      ...params,
      responseType: "blob",
    });
  },
};
