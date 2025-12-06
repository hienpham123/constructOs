import { Request, Response } from 'express';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { toMySQLDateTime } from '../utils/dataHelpers.js';
import type { Material, MaterialTransaction, PurchaseRequest } from '../types/index.js';

export const getMaterials = async (req: Request, res: Response) => {
  try {
    const results = await query<any[]>(
      'SELECT * FROM materials ORDER BY created_at DESC'
    );
    res.json(results);
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
    
    // Calculate status based on stock (trigger will also do this, but we do it here too)
    let status = 'available';
    if (materialData.currentStock <= materialData.minStock) {
      status = 'low_stock';
    } else if (materialData.currentStock === 0) {
      status = 'out_of_stock';
    }
    
    await query(
      `INSERT INTO materials (
        id, code, name, category, unit, current_stock, min_stock, max_stock,
        unit_price, supplier, location, barcode, qr_code, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        materialData.code,
        materialData.name,
        materialData.category,
        materialData.unit,
        materialData.currentStock || 0,
        materialData.minStock || 0,
        materialData.maxStock || 0,
        materialData.unitPrice || 0,
        materialData.supplier || null,
        materialData.location || null,
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
    if (materialData.currentStock <= materialData.minStock) {
      status = 'low_stock';
    } else if (materialData.currentStock === 0) {
      status = 'out_of_stock';
    }
    
    await query(
      `UPDATE materials SET
        code = ?, name = ?, category = ?, unit = ?, current_stock = ?, min_stock = ?, max_stock = ?,
        unit_price = ?, supplier = ?, location = ?, barcode = ?, qr_code = ?, status = ?, updated_at = ?
      WHERE id = ?`,
      [
        materialData.code,
        materialData.name,
        materialData.category,
        materialData.unit,
        materialData.currentStock,
        materialData.minStock,
        materialData.maxStock,
        materialData.unitPrice,
        materialData.supplier || null,
        materialData.location || null,
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
    const results = await query<any[]>(
      'SELECT * FROM material_transactions ORDER BY performed_at DESC'
    );
    res.json(results);
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách giao dịch' });
  }
};

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const transactionData = req.body;
    const id = uuidv4();
    const performedAt = toMySQLDateTime();
    
    await query(
      `INSERT INTO material_transactions (
        id, material_id, material_name, type, quantity, unit,
        project_id, project_name, reason, performed_by, performed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        transactionData.materialId,
        transactionData.materialName,
        transactionData.type,
        transactionData.quantity,
        transactionData.unit,
        transactionData.projectId || null,
        transactionData.projectName || null,
        transactionData.reason,
        transactionData.performedBy,
        performedAt,
      ]
    );
    
    // Update material stock
    const material = await query<any[]>(
      'SELECT * FROM materials WHERE id = ?',
      [transactionData.materialId]
    );
    
    if (material.length > 0) {
      let newStock = material[0].current_stock;
      if (transactionData.type === 'import') {
        newStock += transactionData.quantity;
      } else if (transactionData.type === 'export') {
        newStock -= transactionData.quantity;
      }
      
      // Update stock (trigger will update status automatically)
      await query(
        'UPDATE materials SET current_stock = ? WHERE id = ?',
        [newStock, transactionData.materialId]
      );
    }
    
    const newTransaction = await query<any[]>(
      'SELECT * FROM material_transactions WHERE id = ?',
      [id]
    );
    
    res.status(201).json(newTransaction[0]);
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Không thể tạo giao dịch' });
  }
};

export const getPurchaseRequests = async (req: Request, res: Response) => {
  try {
    const results = await query<any[]>(
      'SELECT * FROM purchase_requests ORDER BY requested_at DESC'
    );
    res.json(results);
  } catch (error: any) {
    console.error('Error fetching purchase requests:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách yêu cầu mua hàng' });
  }
};

export const createPurchaseRequest = async (req: Request, res: Response) => {
  try {
    const requestData = req.body;
    const id = uuidv4();
    const requestedAt = toMySQLDateTime();
    
    await query(
      `INSERT INTO purchase_requests (
        id, material_id, material_name, quantity, unit, reason,
        requested_by, requested_at, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        requestData.materialId,
        requestData.materialName,
        requestData.quantity,
        requestData.unit,
        requestData.reason,
        requestData.requestedBy,
        requestedAt,
        'pending',
      ]
    );
    
    const newRequest = await query<any[]>(
      'SELECT * FROM purchase_requests WHERE id = ?',
      [id]
    );
    
    res.status(201).json(newRequest[0]);
  } catch (error: any) {
    console.error('Error creating purchase request:', error);
    res.status(500).json({ error: 'Không thể tạo yêu cầu mua hàng' });
  }
};

export const updatePurchaseRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, approvedBy } = req.body;
    const approvedAt = toMySQLDateTime();
    
    // Check if exists
    const existing = await query<any[]>(
      'SELECT * FROM purchase_requests WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy yêu cầu mua hàng' });
    }
    
    await query(
      'UPDATE purchase_requests SET status = ?, approved_by = ?, approved_at = ? WHERE id = ?',
      [status, approvedBy || null, approvedAt, id]
    );
    
    const updated = await query<any[]>(
      'SELECT * FROM purchase_requests WHERE id = ?',
      [id]
    );
    
    res.json(updated[0]);
  } catch (error: any) {
    console.error('Error updating purchase request:', error);
    res.status(500).json({ error: 'Không thể cập nhật yêu cầu mua hàng' });
  }
};
