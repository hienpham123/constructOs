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
  code: string;
  description: string;
  client: string;
  location: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
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

export interface SiteLog {
  id: string;
  projectId: string;
  projectName: string;
  date: string;
  weather: string;
  workDescription: string;
  issues: string;
  photos: string[];
  createdBy: string;
  createdAt: string;
}

// Material Management
export interface Material {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string; // kg, m3, m2, etc.
  currentStock: number;
  minStock: number; // Cảnh báo khi xuống dưới mức này
  maxStock: number;
  unitPrice: number;
  supplier: string;
  location: string; // Vị trí trong kho
  barcode?: string;
  qrCode?: string;
  status: 'available' | 'low_stock' | 'out_of_stock';
  createdAt: string;
}

export interface MaterialTransaction {
  id: string;
  materialId: string;
  materialName: string;
  type: 'import' | 'export' | 'adjustment';
  quantity: number;
  unit: string;
  projectId?: string;
  projectName?: string;
  reason: string;
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

// Equipment Management
export interface Equipment {
  id: string;
  code: string;
  name: string;
  type: 'excavator' | 'crane' | 'truck' | 'concrete_mixer' | 'generator' | 'other';
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  status: 'available' | 'in_use' | 'maintenance' | 'broken';
  currentProjectId?: string;
  currentProjectName?: string;
  currentUser?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  totalHours: number;
  createdAt: string;
}

export interface EquipmentUsage {
  id: string;
  equipmentId: string;
  equipmentName: string;
  projectId: string;
  projectName: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime?: string;
  fuelConsumption?: number;
  notes?: string;
}

export interface MaintenanceSchedule {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: 'routine' | 'repair' | 'inspection';
  scheduledDate: string;
  completedDate?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  description: string;
  cost?: number;
  technician?: string;
}

// Contract Management
export interface Contract {
  id: string;
  code: string;
  name: string;
  type: 'construction' | 'supply' | 'service' | 'labor';
  client: string;
  projectId?: string;
  projectName?: string;
  value: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'pending' | 'active' | 'completed' | 'terminated';
  documents: string[];
  signedDate?: string;
  createdAt: string;
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
  totalEquipment: number;
  equipmentInUse: number;
  lowStockMaterials: number;
  overdueMaintenance: number;
  recentProjects: Project[];
  recentSiteLogs: SiteLog[];
  upcomingMaintenance: MaintenanceSchedule[];
  alerts: Alert[];
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  relatedId?: string;
  createdAt: string;
}
