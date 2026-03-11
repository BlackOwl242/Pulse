export interface Permission {
    id: string;
    module: string;
    action: string;
    resource: string;
    description?: string;
}

export interface PermissionGroup {
    module: string;
    permissions: Permission[];
}

export interface Role {
    id: string;
    name: string;
    description?: string;
    isSystem: boolean;
    permissions: Permission[];
}

export interface CreateRoleRequest {
    name: string;
    description?: string;
    permissionIds?: string[];
}

export interface UpdateRoleRequest {
    name?: string;
    description?: string;
    permissionIds?: string[];
}

export interface WorkspaceMember {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    roleId: string;
    roleName: string;
    assignedAt: string;
}
