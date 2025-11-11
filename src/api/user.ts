// src/api/user.ts
import { http } from "@/utils/request";

export interface User {
  id: string; //
  username: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  status: "active" | "inactive"; // refelt back-end ACTIVE/INACTIVE
  createTime: string;
  avatar?: string;
}

export interface UserListParams {
  page: number;
  size: number;
  username?: string;
  role?: string;
  status?: "active" | "inactive" | "";
}

export interface UserListResponse {
  list: User[];
  total: number;
  page: number;
  size: number;
}

// backend enum ACTIVE/INACTIVE -> front-end active/inactive
const fromBackendUser = (u: any): User => ({
  id: String(u.id),
  username: u.username,
  email: u.email,
  role: u.role,
  department: u.department,
  phone: u.phone,
  createTime: u.createTime,
  avatar: u.avatar,
  status: String(u.status || "ACTIVE").toLowerCase() as "active" | "inactive",
});

const toBackendUser = (u: Partial<User>) => ({
  ...u,
  status: u.status ? u.status.toUpperCase() : undefined,
});

export const userApi = {
  async getUserList(params: UserListParams): Promise<UserListResponse> {
    const res = await http.get<any>("/users", params);
    return {
      list: (res.list || []).map(fromBackendUser),
      total: res.total ?? 0,
      page: res.page ?? params.page,
      size: res.size ?? params.size,
    };
  },

  async createUser(user: Omit<User, "id" | "createTime">): Promise<User> {
    const res = await http.post<any>("/users", toBackendUser(user));
    return fromBackendUser(res);
  },

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const res = await http.put<any>(`/users/${id}`, toBackendUser(user));
    return fromBackendUser(res);
  },

  deleteUser(id: string): Promise<void> {
    return http.delete<void>(`/users/${id}`);
  },

  batchDeleteUsers(ids: string[]): Promise<void> {
    const numericIds = ids.map((id) => Number(id));
    return http.post<void>("/users/batch-delete", { ids: numericIds });
  },
};
