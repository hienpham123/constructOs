import { Request, Response } from 'express';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { toMySQLDateTime, toMySQLDate } from '../utils/dataHelpers.js';
import type { Equipment, EquipmentUsage, MaintenanceSchedule } from '../types/index.js';

export const getEquipment = async (req: Request, res: Response) => {
  try {
    const results = await query<any[]>(
      'SELECT * FROM equipment ORDER BY created_at DESC'
    );
    res.json(results);
  } catch (error: any) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách thiết bị' });
  }
};

export const getEquipmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const results = await query<any[]>(
      'SELECT * FROM equipment WHERE id = ?',
      [id]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy thiết bị' });
    }
    
    res.json(results[0]);
  } catch (error: any) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách thiết bị' });
  }
};

export const createEquipment = async (req: Request, res: Response) => {
  try {
    const equipmentData = req.body;
    const id = uuidv4();
    const createdAt = toMySQLDateTime();
    
    await query(
      `INSERT INTO equipment (
        id, code, name, type, brand, model, serial_number, purchase_date,
        status, current_project_id, current_project_name, current_user_id,
        last_maintenance_date, next_maintenance_date, total_hours, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        equipmentData.code,
        equipmentData.name,
        equipmentData.type,
        equipmentData.brand,
        equipmentData.model,
        equipmentData.serialNumber,
        toMySQLDate(equipmentData.purchaseDate),
        equipmentData.status || 'available',
        equipmentData.currentProjectId || null,
        equipmentData.currentProjectName || null,
        equipmentData.currentUser || null,
        equipmentData.lastMaintenanceDate ? toMySQLDate(equipmentData.lastMaintenanceDate) : null,
        equipmentData.nextMaintenanceDate ? toMySQLDate(equipmentData.nextMaintenanceDate) : null,
        equipmentData.totalHours || 0,
        createdAt,
        createdAt,
      ]
    );
    
    const newEquipment = await query<any[]>(
      'SELECT * FROM equipment WHERE id = ?',
      [id]
    );
    
    res.status(201).json(newEquipment[0]);
  } catch (error: any) {
    console.error('Error creating equipment:', error);
    res.status(500).json({ error: 'Không thể tạo thiết bị' });
  }
};

export const updateEquipment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const equipmentData = req.body;
    const updatedAt = toMySQLDateTime();
    
    // Check if exists
    const existing = await query<any[]>(
      'SELECT * FROM equipment WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy thiết bị' });
    }
    
    await query(
      `UPDATE equipment SET
        code = ?, name = ?, type = ?, brand = ?, model = ?, serial_number = ?,
        purchase_date = ?, status = ?, current_project_id = ?, current_project_name = ?,
        current_user_id = ?, last_maintenance_date = ?, next_maintenance_date = ?,
        total_hours = ?, updated_at = ?
      WHERE id = ?`,
      [
        equipmentData.code,
        equipmentData.name,
        equipmentData.type,
        equipmentData.brand,
        equipmentData.model,
        equipmentData.serialNumber,
        toMySQLDate(equipmentData.purchaseDate),
        equipmentData.status,
        equipmentData.currentProjectId || null,
        equipmentData.currentProjectName || null,
        equipmentData.currentUser || null,
        equipmentData.lastMaintenanceDate ? toMySQLDate(equipmentData.lastMaintenanceDate) : null,
        equipmentData.nextMaintenanceDate ? toMySQLDate(equipmentData.nextMaintenanceDate) : null,
        equipmentData.totalHours,
        updatedAt,
        id,
      ]
    );
    
    const updated = await query<any[]>(
      'SELECT * FROM equipment WHERE id = ?',
      [id]
    );
    
    res.json(updated[0]);
  } catch (error: any) {
    console.error('Error updating equipment:', error);
    res.status(500).json({ error: 'Không thể cập nhật thiết bị' });
  }
};

export const deleteEquipment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if exists
    const existing = await query<any[]>(
      'SELECT * FROM equipment WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy thiết bị' });
    }
    
    await query('DELETE FROM equipment WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({ error: 'Không thể xóa thiết bị' });
  }
};

export const getUsage = async (req: Request, res: Response) => {
  try {
    const { equipmentId } = req.query;
    
    let sql = 'SELECT * FROM equipment_usage ORDER BY start_time DESC';
    let params: any[] = [];
    
    if (equipmentId) {
      sql = 'SELECT * FROM equipment_usage WHERE equipment_id = ? ORDER BY start_time DESC';
      params = [equipmentId as string];
    }
    
    const results = await query<any[]>(sql, params);
    res.json(results);
  } catch (error: any) {
    console.error('Error fetching usage:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách sử dụng' });
  }
};

export const createUsage = async (req: Request, res: Response) => {
  try {
    const usageData = req.body;
    const id = uuidv4();
    const createdAt = toMySQLDateTime();
    
    await query(
      `INSERT INTO equipment_usage (
        id, equipment_id, equipment_name, project_id, project_name,
        user_id, user_name, start_time, end_time, fuel_consumption, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        usageData.equipmentId,
        usageData.equipmentName,
        usageData.projectId,
        usageData.projectName,
        usageData.userId,
        usageData.userName,
        toMySQLDateTime(usageData.startTime),
        usageData.endTime ? toMySQLDateTime(usageData.endTime) : null,
        usageData.fuelConsumption || null,
        usageData.notes || null,
        createdAt,
      ]
    );
    
    // Update equipment status
    await query(
      'UPDATE equipment SET status = ?, current_project_id = ?, current_user_id = ? WHERE id = ?',
      ['in_use', usageData.projectId, usageData.userId, usageData.equipmentId]
    );
    
    const newUsage = await query<any[]>(
      'SELECT * FROM equipment_usage WHERE id = ?',
      [id]
    );
    
    res.status(201).json(newUsage[0]);
  } catch (error: any) {
    console.error('Error creating usage:', error);
    res.status(500).json({ error: 'Không thể tạo bản ghi sử dụng' });
  }
};

export const getMaintenanceSchedules = async (req: Request, res: Response) => {
  try {
    const { equipmentId } = req.query;
    
    let sql = 'SELECT * FROM maintenance_schedules ORDER BY scheduled_date DESC';
    let params: any[] = [];
    
    if (equipmentId) {
      sql = 'SELECT * FROM maintenance_schedules WHERE equipment_id = ? ORDER BY scheduled_date DESC';
      params = [equipmentId as string];
    }
    
    const results = await query<any[]>(sql, params);
    res.json(results);
  } catch (error: any) {
    console.error('Error fetching maintenance schedules:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách lịch bảo trì' });
  }
};

export const createMaintenanceSchedule = async (req: Request, res: Response) => {
  try {
    const scheduleData = req.body;
    const id = uuidv4();
    const createdAt = toMySQLDateTime();
    
    await query(
      `INSERT INTO maintenance_schedules (
        id, equipment_id, equipment_name, type, scheduled_date, completed_date,
        status, description, cost, technician, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        scheduleData.equipmentId,
        scheduleData.equipmentName,
        scheduleData.type,
        toMySQLDate(scheduleData.scheduledDate),
        scheduleData.completedDate ? toMySQLDate(scheduleData.completedDate) : null,
        scheduleData.status || 'scheduled',
        scheduleData.description,
        scheduleData.cost || null,
        scheduleData.technician || null,
        createdAt,
        createdAt,
      ]
    );
    
    const newSchedule = await query<any[]>(
      'SELECT * FROM maintenance_schedules WHERE id = ?',
      [id]
    );
    
    res.status(201).json(newSchedule[0]);
  } catch (error: any) {
    console.error('Error creating maintenance schedule:', error);
    res.status(500).json({ error: 'Không thể tạo lịch bảo trì' });
  }
};

export const updateMaintenanceSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const scheduleData = req.body;
    const updatedAt = toMySQLDateTime();
    
    // Check if exists
    const existing = await query<any[]>(
      'SELECT * FROM maintenance_schedules WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy lịch bảo trì' });
    }
    
    await query(
      `UPDATE maintenance_schedules SET
        equipment_id = ?, equipment_name = ?, type = ?, scheduled_date = ?,
        completed_date = ?, status = ?, description = ?, cost = ?,
        technician = ?, updated_at = ?
      WHERE id = ?`,
      [
        scheduleData.equipmentId,
        scheduleData.equipmentName,
        scheduleData.type,
        toMySQLDate(scheduleData.scheduledDate),
        scheduleData.completedDate ? toMySQLDate(scheduleData.completedDate) : null,
        scheduleData.status,
        scheduleData.description,
        scheduleData.cost || null,
        scheduleData.technician || null,
        updatedAt,
        id,
      ]
    );
    
    const updated = await query<any[]>(
      'SELECT * FROM maintenance_schedules WHERE id = ?',
      [id]
    );
    
    res.json(updated[0]);
  } catch (error: any) {
    console.error('Error updating maintenance schedule:', error);
    res.status(500).json({ error: 'Không thể cập nhật lịch bảo trì' });
  }
};
