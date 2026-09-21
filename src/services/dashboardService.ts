import ApiResponse from "../api/ApiResponse.ts";
import type { AddMemberDto, Employee, EmployeeResponse, UpdateMemberDto } from "../types/organization.ts";
import { protectedApi } from "../api/axios.ts";
import type { AxiosResponse } from "axios";

class DashboardService {
    async getEmployees(): Promise<ApiResponse<EmployeeResponse>> {
        try {
            const response: AxiosResponse = await protectedApi.get("/organizations/current/members");
            return ApiResponse.success<EmployeeResponse>(response);
        } catch (err) {
            return ApiResponse.error<EmployeeResponse>(err);
        }
    }

    async addMember(payload: AddMemberDto): Promise<ApiResponse<Employee>> {
        try {
            const response: AxiosResponse = await protectedApi.post("/organizations/current/members", payload);
            return ApiResponse.success<Employee>(response);
        } catch (err) {
            return ApiResponse.error<Employee>(err);
        }
    }

    async updateMember(id: string, payload: UpdateMemberDto): Promise<ApiResponse<Employee>> {
        try {
            const response: AxiosResponse = await protectedApi.patch(`/organizations/current/members/${id}`, payload);
            return ApiResponse.success<Employee>(response);
        } catch (err) {
            return ApiResponse.error<Employee>(err);
        }
    }

    async updateUser(id: string, payload: UpdateMemberDto): Promise<ApiResponse<Employee>> {
        return this.updateMember(id, payload);
    }

    async deleteMember(id: string): Promise<ApiResponse<void>> {
        try {
            const response: AxiosResponse = await protectedApi.delete(`/organizations/current/members/${id}`);
            return ApiResponse.success<void>(response);
        } catch (err) {
            return ApiResponse.error<void>(err);
        }
    }

    async deleteUser(id: string): Promise<ApiResponse<void>> {
        return this.deleteMember(id);
    }
}

export default new DashboardService();
