// User & Role Management
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'project_manager' | 'accountant' | 'warehouse' | 'site_manager' | 'engineer' | 'client';
  status: 'active' | 'inactive' | 'banned';
  avatar?: string;
  createdAt: string;
}

// Project Management
export interface Project {
  id: string;
  name: string;
  description: string;
  investor: string; // Chủ đầu tư (đổi từ client)
  contactPerson?: string; // Đầu mối
  location: string;
  startDate: string;
  endDate: string;
  status: 'quoting' | 'contract_signed_in_progress' | 'completed' | 'on_hold' | 'design_consulting' | 'in_progress' | 'design_appraisal' | 'preparing_acceptance' | 'failed';
  progress: number; // 0-100
  budget: number;
  actualCost: number;
  managerId: string;
  managerName: string;
  stages: ProjectStage[];
  documents: ProjectDocument[];
  createdAt: string;
}

export interface ProjectStage {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  checklist: StageChecklist[];
}

export interface StageChecklist {
  id: string;
  task: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: 'drawing' | 'contract' | 'report' | 'photo' | 'other';
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface CommentAttachment {
  id: string;
  commentId: string;
  filename: string;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  createdAt: string;
}

export interface ProjectComment {
  id: string;
  projectId: string;
  category: 'contract' | 'project_files';
  content: string;
  createdBy: string;
  createdByName?: string;
  createdByAvatar?: string | null;
  createdAt: string;
  updatedAt: string;
  attachments: CommentAttachment[];
}

// Material Management
export interface Material {
  id: string;
  name: string;
  type: string; // Chủng loại
  unit: string; // kg, m3, m2, etc.
  currentStock: number;
  importPrice: number; // Đơn giá nhập (đổi từ unitPrice)
  supplier: string;
  barcode?: string;
  qrCode?: string;
  status: 'available' | 'low_stock' | 'out_of_stock';
  createdAt: string;
}

export interface MaterialTransaction {
  id: string;
  materialId: string;
  materialName: string;
  type: 'import' | 'export';
  quantity: number;
  unit: string;
  projectId?: string;
  projectName?: string;
  reason: string;
  attachments?: string[]; // Mảng URL hoặc path đến các file đính kèm
  performedBy: string;
  performedAt: string;
}

export interface PurchaseRequest {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  reason: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'ordered';
  approvedBy?: string;
  approvedAt?: string;
  projectId?: string;
  projectName?: string;
}

// Personnel Management
export interface Personnel {
  id: string;
  name: string;
  code: string;
  phone: string;
  email?: string;
  position: 'worker' | 'engineer' | 'supervisor' | 'team_leader';
  team?: string;
  projectId?: string;
  projectName?: string;
  status: 'active' | 'inactive' | 'on_leave';
  hireDate: string;
  createdAt: string;
}

export interface Attendance {
  id: string;
  personnelId: string;
  personnelName: string;
  projectId: string;
  projectName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  location?: { lat: number; lng: number };
  hours: number;
  shift: 'morning' | 'afternoon' | 'night' | 'full_day';
  status: 'present' | 'absent' | 'late' | 'early_leave';
}

// Financial Reports
export interface FinancialReport {
  id: string;
  projectId: string;
  projectName: string;
  period: string; // YYYY-MM
  revenue: number;
  expenses: number;
  profit: number;
  breakdown: {
    materialCost: number;
    laborCost: number;
    equipmentCost: number;
    otherCost: number;
  };
  createdAt: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  totalPersonnel: number;
  activePersonnel: number;
  lowStockMaterials: number;
  recentProjects: Project[];
}
