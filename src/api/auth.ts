// src/api/user.ts
import { http } from "@/utils/request";

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  status: "active" | "inactive";
  createTime: string;
  avatar?: string;
}

export interface UserListResponse {
  list: User[];
  total: number;
  page: number;
  size: number;
}

export const userApi = {
  getUsers(params: {
    page?: number;
    size?: number;
    username?: string;
    role?: string;
    status?: string;
  }): Promise<UserListResponse> {
    return http.get("/users", { params });
  },

  createUser(user: Omit<User, "id" | "createTime">): Promise<User> {
    return http.post("/users", user);
  },

  updateUser(id: string, user: Partial<User>): Promise<User> {
    return http.put(`/users/${id}`, user);
  },

  deleteUser(id: string): Promise<void> {
    return http.delete(`/users/${id}`);
  },

  batchDeleteUsers(ids: string[]): Promise<void> {
    return http.post("/users/batch-delete", { ids });
  },
};
