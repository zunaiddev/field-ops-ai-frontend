export const OrganizationRole = {
    ORG_OWNER: 'ORG_OWNER',
    ORG_ADMIN: 'ORG_ADMIN',
    MANAGER: 'MANAGER',
    DISPATCHER: 'DISPATCHER',
    TECHNICIAN: 'TECHNICIAN',
    INVENTORY_MANAGER: 'INVENTORY_MANAGER',
    FINANCE: 'FINANCE',
    VIEWER: 'VIEWER',
} as const;

export type OrganizationRole = (typeof OrganizationRole)[keyof typeof OrganizationRole];

export interface AddMemberDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: Exclude<OrganizationRole, 'ORG_OWNER'> | string;
    phone?: string;
}

export interface UpdateMemberDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    role?: Exclude<OrganizationRole, 'ORG_OWNER'> | string;
    status?: string;
    phone?: string;
}

export interface EmployeeResponse {
    employees: Employee[];
}

export interface Employee {
    id: string | number;
    employeeId?: string | number;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    role: string;
    phone?: string;
    emailVerifiedAt?: Date | string | null;
    lastLoginAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface Organization {
    id: string;
    name: string;
    slug: string;
    status: string;
    timezone: string;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
    user: Employee;
}
