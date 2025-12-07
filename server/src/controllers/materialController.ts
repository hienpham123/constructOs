import { Request, Response } from 'express';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { toMySQLDateTime, normalizeProject, buildSearchClause, buildSortClause } from '../utils/dataHelpers.js';
import type { Material, MaterialTransaction, PurchaseRequest } from '../types/index.js';
import type { AuthRequest } from '../middleware/auth.js';
import { getTransactionAttachmentUrl } from '../middleware/upload.js';
import fs from 'fs';
import path from 'path';

export const getMaterials = async (req: Request, res: Response) => {
  try {
    const { pageSize, pageIndex, search, sortBy, sortOrder } = req.query;
    
    // Parse pagination params with defaults
    const pageSizeNum = pageSize ? parseInt(pageSize as string, 10) : 10;
    const pageIndexNum = pageIndex ? parseInt(pageIndex as string, 10) : 0;
    const offset = pageIndexNum * pageSizeNum;
    
    // Build search and sort clauses
    const queryParams: any[] = [];
    const searchClause = buildSearchClause(
      search as string,
      ['name', 'code', 'type', 'category', 'supplier', 'barcode', 'qr_code'],
      queryParams
    );
    
    const allowedSortFields = ['name', 'code', 'type', 'category', 'unit', 'current_stock', 'import_price', 'unit_price', 'supplier', 'status', 'created_at', 'updated_at'];
    const sortClause = buildSortClause(sortBy as string, allowedSortFields, 'created_at', sortOrder as string);
    
    // Get total count with search
    const countQuery = `SELECT COUNT(*) as total FROM materials ${searchClause}`;
    const countResults = await query<any[]>(countQuery, queryParams);
    const total = countResults[0]?.total || 0;
    
    // Get paginated data
    // Note: LIMIT and OFFSET cannot use placeholders in MySQL, so we inject the values directly
    // but we've already validated them as numbers above
    const results = await query<any[]>(
      `SELECT * FROM materials ${searchClause} ${sortClause} LIMIT ${pageSizeNum} OFFSET ${offset}`,
      queryParams
    );
    
    res.json({
      data: results,
      total,
      pageIndex: pageIndexNum,
      pageSize: pageSizeNum,
    });
  } catch (error: any) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách vật tư' });
  }
};

export const getMaterialById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const results = await query<any[]>(
      'SELECT * FROM materials WHERE id = ?',
      [id]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy vật tư' });
    }
    
    res.json(results[0]);
  } catch (error: any) {
    console.error('Error fetching material:', error);
    res.status(500).json({ error: 'Không thể lấy thông tin vật tư' });
  }
};

export const createMaterial = async (req: Request, res: Response) => {
  try {
    const materialData = req.body;
    const id = uuidv4();
    const createdAt = toMySQLDateTime();
    
    // Calculate status based on stock
    let status = 'available';
    if (materialData.currentStock === 0) {
      status = 'out_of_stock';
    } else if (materialData.currentStock <= 10) { // Default low stock threshold
      status = 'low_stock';
    }
    
    // Generate unique code from UUID (first 8 chars) to satisfy NOT NULL UNIQUE constraint
    const code = id.substring(0, 8).toUpperCase();
    
    await query(
      `INSERT INTO materials (
        id, code, name, category, type, unit, current_stock, min_stock, max_stock, 
        unit_price, import_price, supplier, location, barcode, qr_code, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        code, // code - use first 8 chars of UUID for unique constraint
        materialData.name,
        materialData.type || '', // category - use type value for backward compatibility
        materialData.type || '',
        materialData.unit,
        materialData.currentStock || 0,
        0, // min_stock
        0, // max_stock
        materialData.importPrice || 0, // unit_price - use importPrice for backward compatibility
        materialData.importPrice || 0,
        materialData.supplier || null,
        null, // location
        materialData.barcode || null,
        materialData.qrCode || null,
        status,
        createdAt,
        createdAt,
      ]
    );
    
    const newMaterial = await query<any[]>(
      'SELECT * FROM materials WHERE id = ?',
      [id]
    );
    
    res.status(201).json(newMaterial[0]);
  } catch (error: any) {
    console.error('Error creating material:', error);
    res.status(500).json({ error: 'Không thể tạo vật tư' });
  }
};

export const updateMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const materialData = req.body;
    const updatedAt = toMySQLDateTime();
    
    // Check if exists
    const existing = await query<any[]>(
      'SELECT * FROM materials WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy vật tư' });
    }
    
    // Calculate status
    let status = 'available';
    if (materialData.currentStock === 0) {
      status = 'out_of_stock';
    } else if (materialData.currentStock <= 10) { // Default low stock threshold
      status = 'low_stock';
    }
    
    await query(
      `UPDATE materials SET
        name = ?, type = ?, unit = ?, current_stock = ?,
        import_price = ?, supplier = ?, barcode = ?, qr_code = ?, status = ?, updated_at = ?
      WHERE id = ?`,
      [
        materialData.name,
        materialData.type,
        materialData.unit,
        materialData.currentStock,
        materialData.importPrice,
        materialData.supplier || null,
        materialData.barcode || null,
        materialData.qrCode || null,
        status,
        updatedAt,
        id,
      ]
    );
    
    const updated = await query<any[]>(
      'SELECT * FROM materials WHERE id = ?',
      [id]
    );
    
    res.json(updated[0]);
  } catch (error: any) {
    console.error('Error updating material:', error);
    res.status(500).json({ error: 'Không thể cập nhật vật tư' });
  }
};

export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if exists
    const existing = await query<any[]>(
      'SELECT * FROM materials WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy vật tư' });
    }
    
    await query('DELETE FROM materials WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting material:', error);
    res.status(500).json({ error: 'Không thể xóa vật tư' });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { pageSize, pageIndex, search, sortBy, sortOrder } = req.query;
    
    // Parse pagination params with defaults
    const pageSizeNum = pageSize ? parseInt(pageSize as string, 10) : 10;
    const pageIndexNum = pageIndex ? parseInt(pageIndex as string, 10) : 0;
    const offset = pageIndexNum * pageSizeNum;
    
    // Build search and sort clauses
    const queryParams: any[] = [];
    const searchClause = buildSearchClause(
      search as string,
      ['mt.material_name', 'mt.project_name', 'mt.reason', 'mt.type', 'u.name'],
      queryParams
    );
    
    const allowedSortFields = ['material_name', 'type', 'quantity', 'project_name', 'performed_at', 'created_at'];
    const sortClause = buildSortClause(sortBy as string, allowedSortFields, 'performed_at', sortOrder as string);
    // Map frontend field names to database field names
    const sortFieldMap: Record<string, string> = {
      'material_name': 'mt.material_name',
      'type': 'mt.type',
      'quantity': 'mt.quantity',
      'project_name': 'mt.project_name',
      'performed_at': 'mt.performed_at',
      'created_at': 'mt.performed_at',
    };
    const dbSortField = sortFieldMap[sortBy as string] || 'mt.performed_at';
    const validSortOrder = sortOrder === 'desc' ? 'DESC' : 'ASC';
    const finalSortClause = `ORDER BY ${dbSortField} ${validSortOrder}`;
    
    // Get total count with search
    const countQuery = `SELECT COUNT(*) as total FROM material_transactions mt LEFT JOIN users u ON mt.performed_by = u.id ${searchClause}`;
    const countResults = await query<any[]>(countQuery, queryParams);
    const total = countResults[0]?.total || 0;
    
    // Get paginated data with JOIN to get user name
    // Note: LIMIT and OFFSET cannot use placeholders in MySQL, so we inject the values directly
    // but we've already validated them as numbers above
    const results = await query<any[]>(
      `SELECT 
        mt.*,
        u.name as performed_by_name
      FROM material_transactions mt
      LEFT JOIN users u ON mt.performed_by = u.id
      ${searchClause} ${finalSortClause} LIMIT ${pageSizeNum} OFFSET ${offset}`,
      queryParams
    );
    
    res.json({
      data: results,
      total,
      pageIndex: pageIndexNum,
      pageSize: pageSizeNum,
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách giao dịch' });
  }
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const transactionData = req.body;
    
    // Validation
    if (!transactionData.materialId) {
      return res.status(400).json({ error: 'Vật tư là bắt buộc' });
    }
    if (!transactionData.type || !['import', 'export'].includes(transactionData.type)) {
      return res.status(400).json({ error: 'Loại giao dịch không hợp lệ' });
    }
    if (!transactionData.quantity || transactionData.quantity <= 0) {
      return res.status(400).json({ error: 'Số lượng phải lớn hơn 0' });
    }
    if (!transactionData.reason) {
      return res.status(400).json({ error: 'Lý do là bắt buộc' });
    }
    
    // Get userId from JWT token (required for foreign key constraint)
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }
    
    // Check if material exists
    const material = await query<any[]>(
      'SELECT * FROM materials WHERE id = ?',
      [transactionData.materialId]
    );
    
    if (material.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy vật tư' });
    }
    
    const currentStock = parseFloat(material[0].current_stock) || 0;
    const transactionQuantity = parseFloat(transactionData.quantity) || 0;
    
    // Validate stock for export
    if (transactionData.type === 'export' && currentStock < transactionQuantity) {
      return res.status(400).json({ 
        error: `Không đủ tồn kho. Tồn kho hiện tại: ${currentStock} ${material[0].unit || ''}` 
      });
    }
    
    // Validate and normalize project if provided
    let projectId = null;
    let projectName = null;
    
    if (transactionData.projectId) {
      const normalized = await normalizeProject(
        transactionData.projectId,
        transactionData.projectName,
        query
      );
      
      if (!normalized.projectId) {
        return res.status(400).json({ error: 'Dự án không hợp lệ' });
      }
      
      // Double check project exists
      const projectCheck = await query<any[]>(
        'SELECT id, name FROM projects WHERE id = ?',
        [normalized.projectId]
      );
      
      if (projectCheck.length === 0) {
        return res.status(400).json({ error: 'Dự án không tồn tại' });
      }
      
      projectId = normalized.projectId;
      projectName = normalized.projectName || projectCheck[0].name;
    }
    
    // Calculate new stock
    let newStock = currentStock;
    if (transactionData.type === 'import') {
      newStock += transactionQuantity;
    } else if (transactionData.type === 'export') {
      newStock -= transactionQuantity;
    } else if (transactionData.type === 'adjustment') {
      // For adjustment, we set the stock to the quantity value
      // But typically adjustment should be a delta, so we'll treat it as a direct set
      // If you want adjustment to be relative, change this logic
      newStock = transactionQuantity;
    }
    
    // Ensure stock doesn't go negative (safety check)
    if (newStock < 0) {
      return res.status(400).json({ 
        error: `Không thể thực hiện giao dịch. Tồn kho sẽ âm: ${newStock}` 
      });
    }
    
    const id = uuidv4();
    const performedAt = toMySQLDateTime();
    
    // Handle attachments: extract filenames from URLs and convert to JSON string for storage
    let attachmentValue = null;
    if (transactionData.attachments && Array.isArray(transactionData.attachments) && transactionData.attachments.length > 0) {
      // Extract filenames from URLs (remove base URL, keep only filename)
      const filenames = transactionData.attachments.map((url: string) => {
        if (url.startsWith('http://') || url.startsWith('https://')) {
          // Extract filename from URL
          const urlParts = url.split('/');
          return urlParts[urlParts.length - 1];
        }
        // If already a filename, return as is
        return url;
      });
      attachmentValue = JSON.stringify(filenames);
    } else if (transactionData.attachment) {
      // Backward compatibility
      const att = transactionData.attachment;
      if (att.startsWith('http://') || att.startsWith('https://')) {
        const urlParts = att.split('/');
        attachmentValue = urlParts[urlParts.length - 1];
      } else {
        attachmentValue = att;
      }
    }
    
    // Insert transaction - use userId from JWT for performed_by
    await query(
      `INSERT INTO material_transactions (
        id, material_id, material_name, type, quantity, unit,
        project_id, project_name, reason, attachment, performed_by, performed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        transactionData.materialId,
        transactionData.materialName || material[0].name,
        transactionData.type,
        transactionData.quantity,
        transactionData.unit || material[0].unit,
        projectId,
        projectName,
        transactionData.reason,
        attachmentValue,
        userId, // Use userId from JWT token, not the name
        performedAt,
      ]
    );
    
    // Update material stock (trigger will update status automatically)
    await query(
      'UPDATE materials SET current_stock = ? WHERE id = ?',
      [newStock, transactionData.materialId]
    );
    
    const newTransaction = await query<any[]>(
      'SELECT * FROM material_transactions WHERE id = ?',
      [id]
    );
    
    res.status(201).json(newTransaction[0]);
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    console.error('Transaction data:', JSON.stringify(req.body, null, 2));
    
    // Handle specific database errors
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Vật tư hoặc dự án không tồn tại' });
    }
    
    res.status(500).json({ error: 'Không thể tạo giao dịch' });
  }
};

export const getPurchaseRequests = async (req: Request, res: Response) => {
  try {
    const { pageSize, pageIndex, search, sortBy, sortOrder } = req.query;
    
    // Parse pagination params with defaults
    const pageSizeNum = pageSize ? parseInt(pageSize as string, 10) : 10;
    const pageIndexNum = pageIndex ? parseInt(pageIndex as string, 10) : 0;
    const offset = pageIndexNum * pageSizeNum;
    
    // Build search and sort clauses
    const queryParams: any[] = [];
    const searchClause = buildSearchClause(
      search as string,
      ['pr.material_name', 'pr.reason', 'pr.status', 'u1.name', 'u2.name'],
      queryParams
    );
    
    const allowedSortFields = ['material_name', 'quantity', 'status', 'requested_at', 'approved_at'];
    const sortClause = buildSortClause(sortBy as string, allowedSortFields, 'requested_at', sortOrder as string);
    // Map frontend field names to database field names
    const sortFieldMap: Record<string, string> = {
      'material_name': 'pr.material_name',
      'quantity': 'pr.quantity',
      'status': 'pr.status',
      'requested_at': 'pr.requested_at',
      'approved_at': 'pr.approved_at',
    };
    const dbSortField = sortFieldMap[sortBy as string] || 'pr.requested_at';
    const validSortOrder = sortOrder === 'desc' ? 'DESC' : 'ASC';
    const finalSortClause = `ORDER BY ${dbSortField} ${validSortOrder}`;
    
    // Get total count with search
    const countQuery = `SELECT COUNT(*) as total FROM purchase_requests pr LEFT JOIN users u1 ON pr.requested_by = u1.id LEFT JOIN users u2 ON pr.approved_by = u2.id ${searchClause}`;
    const countResults = await query<any[]>(countQuery, queryParams);
    const total = countResults[0]?.total || 0;
    
    // Get paginated data with JOIN to get user names and project name
    // Note: LIMIT and OFFSET cannot use placeholders in MySQL, so we inject the values directly
    // but we've already validated them as numbers above
    const results = await query<any[]>(
      `SELECT 
        pr.*,
        u1.name as requested_by_name,
        u2.name as approved_by_name,
        p.name as project_name
      FROM purchase_requests pr
      LEFT JOIN users u1 ON pr.requested_by = u1.id
      LEFT JOIN users u2 ON pr.approved_by = u2.id
      LEFT JOIN projects p ON pr.project_id = p.id
      ${searchClause} ${finalSortClause} LIMIT ${pageSizeNum} OFFSET ${offset}`,
      queryParams
    );
    
    res.json({
      data: results,
      total,
      pageIndex: pageIndexNum,
      pageSize: pageSizeNum,
    });
  } catch (error: any) {
    console.error('Error fetching purchase requests:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách yêu cầu mua hàng' });
  }
};

export const createPurchaseRequest = async (req: AuthRequest, res: Response) => {
  try {
    const requestData = req.body;
    
    // Validation
    if (!requestData.materialId) {
      return res.status(400).json({ error: 'Vật tư là bắt buộc' });
    }
    if (!requestData.quantity || requestData.quantity <= 0) {
      return res.status(400).json({ error: 'Số lượng phải lớn hơn 0' });
    }
    if (!requestData.reason) {
      return res.status(400).json({ error: 'Lý do là bắt buộc' });
    }
    
    // Get userId from JWT token (required for foreign key constraint)
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }
    
    // Check if material exists
    const material = await query<any[]>(
      'SELECT * FROM materials WHERE id = ?',
      [requestData.materialId]
    );
    
    if (material.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy vật tư' });
    }
    
    const id = uuidv4();
    const requestedAt = toMySQLDateTime();
    
    await query(
      `INSERT INTO purchase_requests (
        id, material_id, material_name, quantity, unit, reason,
        requested_by, requested_at, status, project_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        requestData.materialId,
        requestData.materialName || material[0].name,
        requestData.quantity,
        requestData.unit || material[0].unit,
        requestData.reason,
        userId, // Use userId from JWT token, not the name
        requestedAt,
        'pending',
        requestData.projectId || null,
      ]
    );
    
    const newRequest = await query<any[]>(
      `SELECT 
        pr.*,
        u.name as requested_by_name,
        p.name as project_name
      FROM purchase_requests pr
      LEFT JOIN users u ON pr.requested_by = u.id
      LEFT JOIN projects p ON pr.project_id = p.id
      WHERE pr.id = ?`,
      [id]
    );
    
    res.status(201).json(newRequest[0]);
  } catch (error: any) {
    console.error('Error creating purchase request:', error);
    console.error('Request data:', JSON.stringify(req.body, null, 2));
    
    // Handle specific database errors
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Vật tư hoặc người dùng không tồn tại' });
    }
    
    res.status(500).json({ error: 'Không thể tạo yêu cầu mua hàng' });
  }
};

export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const results = await query<any[]>(
      `SELECT 
        mt.*,
        u.name as performed_by_name
      FROM material_transactions mt
      LEFT JOIN users u ON mt.performed_by = u.id
      WHERE mt.id = ?`,
      [id]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy giao dịch' });
    }
    
    // Get attachments from transaction_attachments table
    const attachments = await query<any[]>(
      'SELECT * FROM transaction_attachments WHERE transaction_id = ? ORDER BY created_at ASC',
      [id]
    );
    
    // Convert attachments to full URLs
    const { getTransactionAttachmentUrl } = await import('../middleware/upload.js');
    const attachmentsWithUrls = attachments.map((att) => ({
      id: att.id,
      transactionId: att.transaction_id,
      filename: att.filename,
      originalFilename: att.original_filename,
      fileType: att.file_type,
      fileSize: att.file_size,
      fileUrl: getTransactionAttachmentUrl(att.filename) || '',
      createdAt: att.created_at,
    }));
    
    // Return transaction with attachments
    const transaction = results[0];
    transaction.attachments = attachmentsWithUrls.map(att => att.fileUrl); // For backward compatibility
    transaction.attachmentDetails = attachmentsWithUrls; // New detailed attachment info
    
    res.json(transaction);
  } catch (error: any) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Không thể lấy thông tin giao dịch' });
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const transactionData = req.body;
    
    // Get userId from JWT token
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }
    
    // Check if exists
    const existing = await query<any[]>(
      'SELECT * FROM material_transactions WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy giao dịch' });
    }
    
    // Use existing values as defaults for partial updates
    const existingTransaction = existing[0];
    
    // Validate and normalize project if provided
    let projectId = existingTransaction.project_id;
    let projectName = existingTransaction.project_name;
    
    if (transactionData.projectId !== undefined) {
      if (transactionData.projectId) {
        const normalized = await normalizeProject(
          transactionData.projectId,
          transactionData.projectName,
          query
        );
        
        if (!normalized.projectId) {
          return res.status(400).json({ error: 'Dự án không hợp lệ' });
        }
        
        // Double check project exists
        const projectCheck = await query<any[]>(
          'SELECT id, name FROM projects WHERE id = ?',
          [normalized.projectId]
        );
        
        if (projectCheck.length === 0) {
          return res.status(400).json({ error: 'Dự án không tồn tại' });
        }
        
        projectId = normalized.projectId;
        projectName = normalized.projectName || projectCheck[0].name;
      } else {
        projectId = null;
        projectName = null;
      }
    }
    
    // Handle attachments: extract filenames from URLs and convert to JSON string for storage
    let attachmentValue = existingTransaction.attachment;
    if (transactionData.attachments !== undefined) {
      if (transactionData.attachments && Array.isArray(transactionData.attachments) && transactionData.attachments.length > 0) {
        // Extract filenames from URLs (remove base URL, keep only filename)
        const filenames = transactionData.attachments.map((url: string) => {
          if (url.startsWith('http://') || url.startsWith('https://')) {
            // Extract filename from URL
            const urlParts = url.split('/');
            return urlParts[urlParts.length - 1];
          }
          // If already a filename, return as is
          return url;
        });
        attachmentValue = JSON.stringify(filenames);
      } else {
        attachmentValue = null;
      }
    } else if (transactionData.attachment !== undefined) {
      // Backward compatibility
      const att = transactionData.attachment;
      if (att && att.startsWith('http://') || att.startsWith('https://')) {
        const urlParts = att.split('/');
        attachmentValue = urlParts[urlParts.length - 1];
      } else {
        attachmentValue = att || null;
      }
    }
    
    // Use provided values or fall back to existing values
    const materialId = transactionData.materialId !== undefined ? transactionData.materialId : existingTransaction.material_id;
    const materialName = transactionData.materialName !== undefined ? transactionData.materialName : existingTransaction.material_name;
    const type = transactionData.type !== undefined ? transactionData.type : existingTransaction.type;
    const quantity = transactionData.quantity !== undefined ? transactionData.quantity : existingTransaction.quantity;
    const unit = transactionData.unit !== undefined ? transactionData.unit : existingTransaction.unit;
    const reason = transactionData.reason !== undefined ? transactionData.reason : existingTransaction.reason;
    
    // Update transaction - use userId from JWT for performed_by
    await query(
      `UPDATE material_transactions SET
        material_id = ?, material_name = ?, type = ?, quantity = ?, unit = ?,
        project_id = ?, project_name = ?, reason = ?, attachment = ?, performed_by = ?
      WHERE id = ?`,
      [
        materialId,
        materialName,
        type,
        quantity,
        unit,
        projectId,
        projectName,
        reason,
        attachmentValue,
        userId, // Use userId from JWT token
        id,
      ]
    );
    
    // Recalculate material stock if material or quantity/type changed
    const materialChanged = transactionData.materialId !== undefined && transactionData.materialId !== existingTransaction.material_id;
    const quantityChanged = transactionData.quantity !== undefined && transactionData.quantity !== existingTransaction.quantity;
    const typeChanged = transactionData.type !== undefined && transactionData.type !== existingTransaction.type;
    
    if (materialChanged || quantityChanged || typeChanged) {
      // Update old material stock (revert)
      const oldMaterial = await query<any[]>(
        'SELECT * FROM materials WHERE id = ?',
        [existingTransaction.material_id]
      );
      
      if (oldMaterial.length > 0) {
        let oldStock = parseFloat(oldMaterial[0].current_stock) || 0;
        const oldQuantity = parseFloat(existingTransaction.quantity) || 0;
        if (existingTransaction.type === 'import') {
          oldStock -= oldQuantity;
        } else if (existingTransaction.type === 'export') {
          oldStock += oldQuantity;
        }
        await query(
          'UPDATE materials SET current_stock = ? WHERE id = ?',
          [oldStock, existingTransaction.material_id]
        );
      }
      
      // Update new material stock (only if material changed)
      if (materialChanged) {
        const newMaterial = await query<any[]>(
          'SELECT * FROM materials WHERE id = ?',
          [materialId]
        );
        
        if (newMaterial.length > 0) {
          let newStock = parseFloat(newMaterial[0].current_stock) || 0;
          const parsedQuantity = parseFloat(quantity) || 0;
          if (type === 'import') {
            newStock += parsedQuantity;
          } else if (type === 'export') {
            newStock -= parsedQuantity;
          }
          await query(
            'UPDATE materials SET current_stock = ? WHERE id = ?',
            [newStock, materialId]
          );
        }
      } else {
        // Same material, recalculate stock based on difference
        const material = await query<any[]>(
          'SELECT * FROM materials WHERE id = ?',
          [materialId]
        );
        
        if (material.length > 0) {
          let stock = parseFloat(material[0].current_stock) || 0;
          const oldQuantity = parseFloat(existingTransaction.quantity) || 0;
          const parsedQuantity = parseFloat(quantity) || 0;
          
          // Revert old transaction
          if (existingTransaction.type === 'import') {
            stock -= oldQuantity;
          } else if (existingTransaction.type === 'export') {
            stock += oldQuantity;
          }
          
          // Apply new transaction
          if (type === 'import') {
            stock += parsedQuantity;
          } else if (type === 'export') {
            stock -= parsedQuantity;
          }
          
          await query(
            'UPDATE materials SET current_stock = ? WHERE id = ?',
            [stock, materialId]
          );
        }
      }
    }
    
    const updated = await query<any[]>(
      `SELECT 
        mt.*,
        u.name as performed_by_name
      FROM material_transactions mt
      LEFT JOIN users u ON mt.performed_by = u.id
      WHERE mt.id = ?`,
      [id]
    );
    
    res.json(updated[0]);
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Không thể cập nhật giao dịch' });
  }
};

export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get transaction to revert stock change and get attachments
    const existing = await query<any[]>(
      'SELECT * FROM material_transactions WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy giao dịch' });
    }
    
    const transaction = existing[0];
    
    // Delete attached files before deleting transaction
    if (transaction.attachment) {
      try {
        let filenames: string[] = [];
        
        // Parse attachment - could be JSON string (array) or single filename string
        if (transaction.attachment.startsWith('[')) {
          // JSON array string
          filenames = JSON.parse(transaction.attachment);
        } else {
          // Single filename string
          filenames = [transaction.attachment];
        }
        
        // Delete each file
        for (const filename of filenames) {
          try {
            const filePath = path.join(process.cwd(), 'uploads', 'transactions', filename);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`Deleted file: ${filename}`);
            }
          } catch (fileError: any) {
            console.error(`Error deleting file ${filename}:`, fileError);
            // Continue deleting other files even if one fails
          }
        }
      } catch (parseError: any) {
        console.error('Error parsing attachment:', parseError);
        // Continue with transaction deletion even if file deletion fails
      }
    }
    
    // Revert material stock
    const material = await query<any[]>(
      'SELECT * FROM materials WHERE id = ?',
      [transaction.material_id]
    );
    
    if (material.length > 0) {
      let stock = parseFloat(material[0].current_stock) || 0;
      const transactionQuantity = parseFloat(transaction.quantity) || 0;
      if (transaction.type === 'import') {
        stock -= transactionQuantity;
      } else if (transaction.type === 'export') {
        stock += transactionQuantity;
      }
      
      await query(
        'UPDATE materials SET current_stock = ? WHERE id = ?',
        [stock, transaction.material_id]
      );
    }
    
    // Delete transaction from database
    await query('DELETE FROM material_transactions WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Không thể xóa giao dịch' });
  }
};

export const getPurchaseRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const results = await query<any[]>(
      `SELECT 
        pr.*,
        u1.name as requested_by_name,
        u2.name as approved_by_name,
        p.name as project_name
      FROM purchase_requests pr
      LEFT JOIN users u1 ON pr.requested_by = u1.id
      LEFT JOIN users u2 ON pr.approved_by = u2.id
      LEFT JOIN projects p ON pr.project_id = p.id
      WHERE pr.id = ?`,
      [id]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy yêu cầu mua hàng' });
    }
    
    res.json(results[0]);
  } catch (error: any) {
    console.error('Error fetching purchase request:', error);
    res.status(500).json({ error: 'Không thể lấy thông tin yêu cầu mua hàng' });
  }
};

export const updatePurchaseRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, materialId, quantity, reason, projectId } = req.body;
    
    // Get userId from JWT token (for approved_by)
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không có quyền truy cập' });
    }
    
    // Check if exists
    const existing = await query<any[]>(
      'SELECT * FROM purchase_requests WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy yêu cầu mua hàng' });
    }

    const currentStatus = existing[0].status;
    
    // If updating fields other than status, only allow if status is pending or rejected
    if ((materialId || quantity || reason || projectId !== undefined) && 
        currentStatus !== 'pending' && currentStatus !== 'rejected') {
      return res.status(400).json({ error: 'Chỉ có thể chỉnh sửa đề xuất mua hàng khi trạng thái là "Chờ duyệt" hoặc "Từ chối"' });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
      
      // Only set approved_by and approved_at if status is approved or rejected
      // If changing to pending, clear approved_by and approved_at
      if (status === 'approved' || status === 'rejected') {
        updates.push('approved_by = ?');
        updates.push('approved_at = ?');
        values.push(userId);
        values.push(toMySQLDateTime());
      } else if (status === 'pending') {
        // Clear approved_by and approved_at when resubmitting
        updates.push('approved_by = ?');
        updates.push('approved_at = ?');
        values.push(null);
        values.push(null);
      }
    }

    if (materialId) {
      // Check if material exists
      const material = await query<any[]>(
        'SELECT * FROM materials WHERE id = ?',
        [materialId]
      );
      
      if (material.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy vật tư' });
      }

      updates.push('material_id = ?');
      updates.push('material_name = ?');
      values.push(materialId);
      values.push(material[0].name);
    }

    if (quantity !== undefined) {
      if (quantity <= 0) {
        return res.status(400).json({ error: 'Số lượng phải lớn hơn 0' });
      }
      updates.push('quantity = ?');
      values.push(quantity);
    }

    if (reason !== undefined) {
      if (!reason.trim()) {
        return res.status(400).json({ error: 'Lý do không được để trống' });
      }
      updates.push('reason = ?');
      values.push(reason.trim());
    }

    if (projectId !== undefined) {
      if (projectId) {
        // Check if project exists
        const project = await query<any[]>(
          'SELECT id FROM projects WHERE id = ?',
          [projectId]
        );
        
        if (project.length === 0) {
          return res.status(404).json({ error: 'Không tìm thấy dự án' });
        }
      }
      updates.push('project_id = ?');
      values.push(projectId || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Không có dữ liệu để cập nhật' });
    }

    values.push(id);
    
    await query(
      `UPDATE purchase_requests SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    const updated = await query<any[]>(
      `SELECT 
        pr.*,
        u1.name as requested_by_name,
        u2.name as approved_by_name,
        p.name as project_name
      FROM purchase_requests pr
      LEFT JOIN users u1 ON pr.requested_by = u1.id
      LEFT JOIN users u2 ON pr.approved_by = u2.id
      LEFT JOIN projects p ON pr.project_id = p.id
      WHERE pr.id = ?`,
      [id]
    );
    
    res.json(updated[0]);
  } catch (error: any) {
    console.error('Error updating purchase request:', error);
    res.status(500).json({ error: 'Không thể cập nhật yêu cầu mua hàng' });
  }
};

export const deletePurchaseRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if exists
    const existing = await query<any[]>(
      'SELECT * FROM purchase_requests WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy yêu cầu mua hàng' });
    }
    
    await query('DELETE FROM purchase_requests WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting purchase request:', error);
    res.status(500).json({ error: 'Không thể xóa yêu cầu mua hàng' });
  }
};
