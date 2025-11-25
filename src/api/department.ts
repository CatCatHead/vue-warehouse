//src/apu/department.ts

import { http } from "@/utils/request";

export interface Department {
  id: string;
  departmentCode: string;
  departmentName: string;
}

export interface DepartmentListParams {
  page?: number;
  size?: number;
  departmentCode?: string;
  departmentName?: string;
}

export interface DepartmentResponse {
  list: Department[];
  total: number;
  page: number;
  size: number;
}

const fromBackendDepartment = (l: any): Department => ({
  id: String(l.id),
  departmentCode: String(l.departmentCode),
  departmentName: String(l.departmentName),
});

export const departmentApi = {
  async getDepartments(
    params: DepartmentListParams,
  ): Promise<DepartmentResponse> {
    const res = await http.get<any>("/departments", params);
    return {
      list: (res.list || []).map(fromBackendDepartment),
      total: res.total ?? 0,
      page: res.page ?? params.page,
      size: res.size ?? params.size,
    };
  },
  async createDepartment(department: Department): Promise<Department> {
    const res = await http.post<any>("/departments", department);
    return fromBackendDepartment(res);
  },
  async updateDepartment(
    id: string,
    department: Department,
  ): Promise<Department> {
    const res = await http.put<any>(`/departments/${id}`, department);
    return fromBackendDepartment(res);
  },
  async deleteDepartment(id: string): Promise<Department> {
    const res = await http.delete<any>(`/departments/${id}`);
    return fromBackendDepartment(res);
  },
};
