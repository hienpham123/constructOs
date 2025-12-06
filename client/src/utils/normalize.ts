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
    name: data.name || '',
    type: data.type || '',
    unit: data.unit || '',
    currentStock: normalizeNumber(data.currentStock || data.current_stock),
    importPrice: normalizeNumber(data.importPrice || data.import_price || data.unit_price),
    supplier: data.supplier || '',
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
    description: data.description || '',
    investor: data.investor || data.client || '',
    contactPerson: data.contactPerson || data.contact_person || '',
    location: data.location || '',
    startDate: data.startDate || data.start_date || '',
    endDate: data.endDate || data.end_date || '',
    status: data.status || 'quoting',
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
 * Normalize MaterialTransaction data from API
 */
export const normalizeMaterialTransaction = (data: any): any => {
  if (!data) return null;
  
  // Handle attachments: can be array, JSON string, or single string (backward compatibility)
  let attachments: string[] | undefined = undefined;
  if (data.attachments) {
    if (Array.isArray(data.attachments)) {
      attachments = data.attachments.map((att: string) => {
        // Convert filename to full URL if it's just a filename
        if (att && !att.startsWith('http://') && !att.startsWith('https://') && !att.startsWith('blob:')) {
          // Get base URL without /api suffix for static files
          const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:2222/api';
          const baseUrl = apiUrl.replace('/api', '') || 'http://localhost:2222';
          return `${baseUrl}/uploads/transactions/${att}`;
        }
        return att;
      });
    } else if (typeof data.attachments === 'string') {
      try {
        const parsed = JSON.parse(data.attachments);
        const attArray = Array.isArray(parsed) ? parsed : [parsed];
        attachments = attArray.map((att: string) => {
          if (att && !att.startsWith('http://') && !att.startsWith('https://') && !att.startsWith('blob:')) {
            // Get base URL without /api suffix for static files
          const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:2222/api';
          const baseUrl = apiUrl.replace('/api', '') || 'http://localhost:2222';
            return `${baseUrl}/uploads/transactions/${att}`;
          }
          return att;
        });
      } catch {
        const att = data.attachments;
        if (att && !att.startsWith('http://') && !att.startsWith('https://') && !att.startsWith('blob:')) {
          // Get base URL without /api suffix for static files
          const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:2222/api';
          const baseUrl = apiUrl.replace('/api', '') || 'http://localhost:2222';
          attachments = [`${baseUrl}/uploads/transactions/${att}`];
        } else {
          attachments = [att];
        }
      }
    }
  } else if (data.attachment) {
    // Backward compatibility: convert single attachment to array
    // attachment can be JSON string (array of filenames) or single filename/URL
    let att = data.attachment;
    if (typeof att === 'string') {
      // Try to parse as JSON first (in case it's a JSON string array)
      try {
        const parsed = JSON.parse(att);
        if (Array.isArray(parsed)) {
          // It's a JSON array of filenames
          attachments = parsed.map((filename: string) => {
            if (filename && !filename.startsWith('http://') && !filename.startsWith('https://') && !filename.startsWith('blob:')) {
              // Get base URL without /api suffix for static files
          const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:2222/api';
          const baseUrl = apiUrl.replace('/api', '') || 'http://localhost:2222';
              return `${baseUrl}/uploads/transactions/${filename}`;
            }
            return filename;
          });
        } else {
          // Single value from JSON
          att = parsed;
        }
      } catch {
        // Not JSON, treat as single filename/URL
      }
    }
    
    // If attachments not set yet, handle as single attachment
    if (!attachments) {
      if (att && !att.startsWith('http://') && !att.startsWith('https://') && !att.startsWith('blob:')) {
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:2222';
        attachments = [`${baseUrl}/uploads/transactions/${att}`];
      } else {
        attachments = [att];
      }
    }
  }
  
  return {
    id: data.id,
    materialId: data.materialId || data.material_id || '',
    materialName: data.materialName || data.material_name || '',
    type: data.type || 'import',
    quantity: normalizeNumber(data.quantity),
    unit: data.unit || '',
    projectId: data.projectId || data.project_id || undefined,
    projectName: data.projectName || data.project_name || undefined,
    reason: data.reason || '',
    attachments: attachments,
    performedBy: data.performed_by_name || data.performedBy || data.performed_by || '',
    performedAt: data.performedAt || data.performed_at || '',
  };
};

/**
 * Normalize PurchaseRequest data from API
 */
export const normalizePurchaseRequest = (data: any): any => {
  if (!data) return null;
  
  return {
    id: data.id,
    materialId: data.materialId || data.material_id || '',
    materialName: data.materialName || data.material_name || '',
    quantity: normalizeNumber(data.quantity),
    unit: data.unit || '',
    reason: data.reason || '',
    requestedBy: data.requested_by_name || data.requestedBy || data.requested_by || '', // Prioritize name
    requestedAt: data.requestedAt || data.requested_at || '',
    status: data.status || 'pending',
    approvedBy: data.approved_by_name || data.approvedBy || data.approved_by || undefined, // Prioritize name
    approvedAt: data.approvedAt || data.approved_at || undefined,
  };
};
