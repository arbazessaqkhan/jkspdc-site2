export interface Stats {
  operationalCount: number;
  constructionCount: number;
  directorsCount: number;
  tendersCount: number;
  careersCount: number;
  pressCount: number;
}

export interface ProjectDto {
  id?: string | number;
  status?: string;
}

export interface DirectorDto {
  id?: string | number;
}

export interface TenderDto {
  id?: string | number;
  status?: string;
}

export interface CareerDto {
  id?: string | number;
  status?: string;
}

export interface ContactSubmissionDto {
  id?: string | number;
  name?: string;
  email?: string;
  message?: string;
  createdAt?: string;
}

export interface AuditLogDto {
  id?: string | number;
  action?: string;
  createdAt?: string;
  ipAddress?: string;
  details?: unknown;
}

export type AdminTab = 'dashboard' | 'construction' | 'directors' | 'operational' | 'tenders' | 'careers' | 'press' | 'contacts' | 'users' | 'audit-logs' | 'media-manager';
