/**
 * Normalize number value - parse string to number, handle decimals
 */
export const normalizeNumber = (value: any): number => {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Remove commas and spaces, then parse
    const cleaned = value.replace(/[,\s]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

/**
 * Normalize Material data from API (snake_case -> camelCase, parse numbers)
 */
export const normalizeMaterial = (data: any): any => {
  if (!data) return null;
  
  return {
    id: data.id || data.material_id,
    code: data.code || '',
    name: data.name || '',
    category: data.category || '',
    unit: data.unit || '',
    currentStock: normalizeNumber(data.currentStock || data.current_stock),
    minStock: normalizeNumber(data.minStock || data.min_stock),
    maxStock: normalizeNumber(data.maxStock || data.max_stock),
    unitPrice: normalizeNumber(data.unitPrice || data.unit_price),
    supplier: data.supplier || '',
    location: data.location || '',
    barcode: data.barcode || undefined,
    qrCode: data.qr_code || data.qrCode || undefined,
    status: data.status || 'available',
    createdAt: data.created_at || data.createdAt || '',
  };
};

/**
 * Normalize Project data from API
 */
export const normalizeProject = (data: any): any => {
  if (!data) return null;
  
  return {
    id: data.id,
    name: data.name || '',
    code: data.code || '',
    description: data.description || '',
    client: data.client || '',
    location: data.location || '',
    startDate: data.startDate || data.start_date || '',
    endDate: data.endDate || data.end_date || '',
    status: data.status || 'planning',
    progress: normalizeNumber(data.progress),
    budget: normalizeNumber(data.budget),
    actualCost: normalizeNumber(data.actualCost || data.actual_cost),
    managerId: data.managerId || data.manager_id || '',
    managerName: data.managerName || data.manager_name || '',
    stages: data.stages || [],
    documents: data.documents || [],
    createdAt: data.created_at || data.createdAt || '',
  };
};

/**
 * Normalize Contract data from API
 */
export const normalizeContract = (data: any): any => {
  if (!data) return null;
  
  return {
    id: data.id,
    code: data.code || '',
    name: data.name || '',
    type: data.type || 'construction',
    client: data.client || '',
    projectId: data.projectId || data.project_id || undefined,
    projectName: data.projectName || data.project_name || undefined,
    value: normalizeNumber(data.value),
    startDate: data.startDate || data.start_date || '',
    endDate: data.endDate || data.end_date || '',
    status: data.status || 'draft',
    signedDate: data.signedDate || data.signed_date || undefined,
    documents: data.documents || [],
    createdAt: data.created_at || data.createdAt || '',
  };
};

/**
 * Normalize Personnel data from API
 */
export const normalizePersonnel = (data: any): any => {
  if (!data) return null;
  
  return {
    id: data.id,
    code: data.code || '',
    name: data.name || '',
    phone: data.phone || '',
    email: data.email || undefined,
    position: data.position || 'worker',
    team: data.team || undefined,
    projectId: data.projectId || data.project_id || undefined,
    projectName: data.projectName || data.project_name || undefined,
    status: data.status || 'active',
    hireDate: data.hireDate || data.hire_date || '',
    createdAt: data.created_at || data.createdAt || '',
  };
};

/**
 * Normalize Equipment data from API
 */
export const normalizeEquipment = (data: any): any => {
  if (!data) return null;
  
  return {
    id: data.id,
    code: data.code || '',
    name: data.name || '',
    type: data.type || 'excavator',
    brand: data.brand || '',
    model: data.model || '',
    serialNumber: data.serialNumber || data.serial_number || '',
    purchaseDate: data.purchaseDate || data.purchase_date || '',
    status: data.status || 'available',
    currentProjectId: data.currentProjectId || data.current_project_id || undefined,
    currentProjectName: data.currentProjectName || data.current_project_name || undefined,
    currentUser: data.currentUser || data.current_user || undefined,
    lastMaintenanceDate: data.lastMaintenanceDate || data.last_maintenance_date || undefined,
    nextMaintenanceDate: data.nextMaintenanceDate || data.next_maintenance_date || undefined,
    totalHours: normalizeNumber(data.totalHours || data.total_hours || 0),
    createdAt: data.created_at || data.createdAt || '',
  };
};
