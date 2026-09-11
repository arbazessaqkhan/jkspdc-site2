export interface Stats {
  operationalCount: number;
  constructionCount: number;
  upcomingCount?: number;
  directorsCount: number;
  dignitariesCount?: number;
  tendersCount: number;
  notificationsCount?: number;
  downloadsCount?: number;
  agmCount?: number;
  policiesCount?: number;
  galleryCount?: number;
  inquiriesCount?: number;
  usersCount?: number;
  logsCount?: number;
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

export type AdminTab = 'dashboard' | 'construction' | 'directors' | 'dignitaries' | 'operational' | 'tenders' | 'contacts' | 'users' | 'audit-logs' | 'media-manager' | 'policies' | 'upcoming' | 'agm' | 'gallery' | 'notifications' | 'downloads' | 'site-settings' | 'official-contacts' | 'contact-sub-offices';
