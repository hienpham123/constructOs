import { useState, useEffect } from 'react';
import { rolesAPI, RolePermission } from '../services/api';
import { useAuthStore } from '../stores/authStore';

export interface UserPermissions extends RolePermission {}

const defaultPermissions: UserPermissions = {
  view_drawing: false,
  view_contract: false,
  view_report: false,
  view_daily_report: false,
  view_project_report: false,
};

export function usePermissions() {
  const { user } = useAuthStore();
  const [permissions, setPermissions] = useState<UserPermissions>(defaultPermissions);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPermissions();
    } else {
      setPermissions(defaultPermissions);
      setIsLoading(false);
    }
  }, [user]);

  const fetchPermissions = async () => {
    try {
      setIsLoading(true);
      const data = await rolesAPI.getMyPermissions();
      setPermissions(data.permissions || defaultPermissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions(defaultPermissions);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions to check specific permissions
  const canViewDrawing = permissions.view_drawing;
  const canViewContract = permissions.view_contract;
  const canViewReport = permissions.view_report;
  const canViewDailyReport = permissions.view_daily_report;
  const canViewProjectReport = permissions.view_project_report;

  // Check if user can view a specific document type
  // For reports, we check the document name to determine if it's a daily report or project report
  const canViewDocumentType = (
    type: 'drawing' | 'contract' | 'report' | 'photo' | 'other',
    documentName?: string
  ): boolean => {
    switch (type) {
      case 'drawing':
        return canViewDrawing;
      case 'contract':
        return canViewContract;
      case 'report':
        // Try to determine if it's a daily report or project report based on name
        if (documentName) {
          const nameLower = documentName.toLowerCase();
          // Check for daily report keywords
          if (
            nameLower.includes('báo cáo ngày') ||
            nameLower.includes('daily report') ||
            nameLower.includes('nhật ký')
          ) {
            return canViewDailyReport;
          }
          // Check for project report keywords
          if (
            nameLower.includes('báo cáo dự án') ||
            nameLower.includes('project report') ||
            nameLower.includes('báo cáo')
          ) {
            return canViewProjectReport;
          }
        }
        // Default: if user has either permission, allow viewing
        return canViewDailyReport || canViewProjectReport;
      case 'photo':
      case 'other':
        // Photos and other documents are generally viewable
        return true;
      default:
        return false;
    }
  };

  return {
    permissions,
    isLoading,
    canViewDrawing,
    canViewContract,
    canViewReport,
    canViewDailyReport,
    canViewProjectReport,
    canViewDocumentType,
    refreshPermissions: fetchPermissions,
  };
}

