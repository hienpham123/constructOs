// Export all API modules
export { authAPI } from './auth';
export { usersAPI } from './users';
export { materialsAPI } from './materials';
export { projectsAPI } from './projects';
export { personnelAPI } from './personnel';
export { dashboardAPI } from './dashboard';
export { rolesAPI } from './roles';
export type { Role, RolePermission } from './roles';
export { dailyReportsAPI } from './dailyReports';

// Export default axios instance
export { default as api } from './instance';
export { default } from './instance';

