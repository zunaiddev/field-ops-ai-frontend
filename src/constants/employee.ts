export const EMPLOYEE_ROLE_OPTIONS = [
  { value: 'ORG_OWNER', label: 'Owner' },
  { value: 'ORG_ADMIN', label: 'Admin' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'DISPATCHER', label: 'Dispatcher' },
  { value: 'TECHNICIAN', label: 'Technician' },
  { value: 'INVENTORY_MANAGER', label: 'Inventory Manager' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'VIEWER', label: 'Viewer' },
] as const

export const ADD_MEMBER_ROLE_OPTIONS = EMPLOYEE_ROLE_OPTIONS.filter(
  (role) => role.value !== 'ORG_OWNER',
)

export const EMPLOYEE_ROLE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Roles' },
  ...EMPLOYEE_ROLE_OPTIONS,
] as const

export const EMPLOYEE_ROLES = {
  ALL: 'All Roles',
  ORG_OWNER: 'Owner',
  ORG_ADMIN: 'Admin',
  MANAGER: 'Manager',
  DISPATCHER: 'Dispatcher',
  TECHNICIAN: 'Technician',
  INVENTORY_MANAGER: 'Inventory Manager',
  FINANCE: 'Finance',
  VIEWER: 'Viewer',
} as const

export const EMPLOYEE_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_LEAVE', label: 'On Leave' },
  { value: 'INACTIVE', label: 'Inactive' },
] as const

export const EMPLOYEE_STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  ...EMPLOYEE_STATUS_OPTIONS,
] as const

export const EMPLOYEE_DEPARTMENTS = [
  { value: 'HVAC & Climate Systems', label: 'HVAC & Climate Systems' },
  { value: 'Electrical Maintenance', label: 'Electrical Maintenance' },
  { value: 'Plumbing & Hydraulic', label: 'Plumbing & Hydraulic' },
  { value: 'Security & Telemetry', label: 'Security & Telemetry' },
  { value: 'Heavy Equipment', label: 'Heavy Equipment' },
  { value: 'Dispatch & Logistics', label: 'Dispatch & Logistics' },
] as const
