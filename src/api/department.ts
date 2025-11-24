//src/apu/department.ts

import { http } from "@/utils/request";

export interface Department {
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
};
