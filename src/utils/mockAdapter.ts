// src/utils/mockAdapter.ts
import { config } from "./config";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockData = {
  users: [
    {
      id: "1",
      username: "admin",
      email: "admin@example.com",
      role: "admin",
      department: "Technology",
      phone: "13800138000",
      createTime: "2024-01-15T10:30:00Z",
      status: "active",
    },
    {
      id: "2",
      username: "john_doe",
      email: "john.doe@example.com",
      role: "editor",
      department: "Content",
      phone: "13800138001",
      createTime: "2024-01-16T14:20:00Z",
      status: "active",
    },
  ],
  linen: [
    {
      id: "1",
      itemId: "LIN-001",
      description: "Bed Sheet - King Size",
      onHand: 45,
      minStock: 50,
      maxStock: 200,
      category: "Bedding",
      location: "Warehouse A",
      status: "low_stock",
      lastUpdated: "2024-01-20T10:30:00Z",
      createdAt: "2024-01-15T10:30:00Z",
    },
  ],
};

export const mockAdapter = {
  async request(config: any) {
    await delay(config.mockDelay || config.mockDelay);

    const { method, url, data, params } = config;

    console.log(`[Mock] ${method?.toUpperCase()} ${url}`, { params, data });

    if (url === "/auth/login" && method === "post") {
      return {
        accessToken: "mock-jwt-token-" + Date.now(),
        refreshToken: "mock-refresh-token-" + Date.now(),
        user: {
          id: "1",
          username: data.username,
          role: "admin",
          email: `${data.username}@example.com`,
          permissions: ["user:add", "user:edit", "user:delete", "linen:manage"],
        },
      };
    }

    if (url === "/auth/me" && method === "get") {
      return {
        id: "1",
        username: "admin",
        role: "admin",
        email: "admin@example.com",
        permissions: ["user:add", "user:edit", "user:delete", "linen:manage"],
      };
    }

    if (url === "/users" && method === "get") {
      return {
        list: mockData.users,
        total: mockData.users.length,
        page: params?.page || 1,
        size: params?.size || 10,
      };
    }

    if (url === "/linen" && method === "get") {
      let filtered = mockData.linen;

      if (params?.itemId) {
        filtered = filtered.filter((item) =>
          item.itemId.toLowerCase().includes(params.itemId.toLowerCase()),
        );
      }

      if (params?.description) {
        filtered = filtered.filter((item) =>
          item.description
            .toLowerCase()
            .includes(params.description.toLowerCase()),
        );
      }

      return {
        list: filtered,
        total: filtered.length,
        page: params?.page || 1,
        size: params?.size || 10,
      };
    }

    return {
      code: 200,
      message: "Success",
      data: data || null,
    };
  },
};
