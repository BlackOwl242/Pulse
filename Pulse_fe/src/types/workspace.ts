export interface Workspace {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    description?: string;
    plan: 'free' | 'pro' | 'enterprise';
    memberCount: number;
    createdAt: string;
}

export interface Team {
    id: string;
    name: string;
    description?: string;
    color?: string;
    memberCount: number;
    members: TeamMember[];
    createdAt: string;
}

export interface TeamMember {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    role: 'lead' | 'member';
}

export interface UserProfile {
    id: string;
    userId: string;
    jobTitle?: string;
    department?: string;
    phone?: string;
    timezone?: string;
    bio?: string;
    skills: string[];
    socialLinks: Record<string, string>;
}

export interface Invitation {
    id: string;
    email: string;
    status: 'pending' | 'accepted' | 'expired' | 'revoked';
    expiresAt: string;
    createdAt: string;
}
