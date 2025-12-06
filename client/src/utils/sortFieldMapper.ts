/**
 * Map frontend field names (camelCase) to backend field names (snake_case) for sorting
 */

// Field mapping for Personnel
const personnelFieldMap: Record<string, string> = {
  name: 'name',
  code: 'code',
  phone: 'phone',
  email: 'email',
  position: 'position',
  team: 'team',
  projectName: 'project_name',
  status: 'status',
  hireDate: 'hire_date',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

// Field mapping for Projects
const projectFieldMap: Record<string, string> = {
  name: 'name',
  investor: 'investor',
  location: 'location',
  status: 'status',
  progress: 'progress',
  budget: 'budget',
  actualCost: 'actual_cost',
  startDate: 'start_date',
  endDate: 'end_date',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

// Field mapping for Materials
const materialFieldMap: Record<string, string> = {
  name: 'name',
  code: 'code',
  type: 'type',
  currentStock: 'current_stock',
  importPrice: 'import_price',
  supplier: 'supplier',
  status: 'status',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

// Field mapping for Transactions
const transactionFieldMap: Record<string, string> = {
  materialName: 'material_name',
  type: 'type',
  quantity: 'quantity',
  projectName: 'project_name',
  performedAt: 'performed_at',
};

// Field mapping for Purchase Requests
const purchaseRequestFieldMap: Record<string, string> = {
  materialName: 'material_name',
  quantity: 'quantity',
  status: 'status',
  requestedAt: 'requested_at',
  approvedAt: 'approved_at',
};

// Field mapping for Project Reports
const projectReportFieldMap: Record<string, string> = {
  projectName: 'project_name',
  reportDate: 'report_date',
  createdAt: 'created_at',
};

/**
 * Map frontend field name to backend field name for sorting
 */
export function mapSortField(
  frontendField: string,
  type: 'personnel' | 'project' | 'material' | 'transaction' | 'purchaseRequest' | 'project-report'
): string {
  let fieldMap: Record<string, string>;
  
  switch (type) {
    case 'personnel':
      fieldMap = personnelFieldMap;
      break;
    case 'project':
      fieldMap = projectFieldMap;
      break;
    case 'material':
      fieldMap = materialFieldMap;
      break;
    case 'transaction':
      fieldMap = transactionFieldMap;
      break;
    case 'purchaseRequest':
      fieldMap = purchaseRequestFieldMap;
      break;
    case 'project-report':
      fieldMap = projectReportFieldMap;
      break;
    default:
      return frontendField;
  }
  
  return fieldMap[frontendField] || frontendField;
}

/**
 * Get reverse mapping (backend -> frontend) for a given type
 */
export function getReverseFieldMap(
  type: 'personnel' | 'project' | 'material' | 'transaction' | 'purchaseRequest' | 'project-report'
): Record<string, string> {
  let fieldMap: Record<string, string>;
  
  switch (type) {
    case 'personnel':
      fieldMap = personnelFieldMap;
      break;
    case 'project':
      fieldMap = projectFieldMap;
      break;
    case 'material':
      fieldMap = materialFieldMap;
      break;
    case 'transaction':
      fieldMap = transactionFieldMap;
      break;
    case 'purchaseRequest':
      fieldMap = purchaseRequestFieldMap;
      break;
    case 'project-report':
      fieldMap = projectReportFieldMap;
      break;
    default:
      return {};
  }
  
  // Reverse the map
  const reverseMap: Record<string, string> = {};
  Object.entries(fieldMap).forEach(([frontend, backend]) => {
    reverseMap[backend] = frontend;
  });
  
  return reverseMap;
}

