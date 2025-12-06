import { Request, Response } from 'express';
import { query } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { toMySQLDateTime, toMySQLDate } from '../utils/dataHelpers.js';
import type { Equipment, EquipmentUsage, MaintenanceSchedule } from '../types/index.js';
import type { AuthRequest } from '../middleware/auth.js';

export const getEquipment = async (req: Request, res: Response) => {
  try {
    const { pageSize, pageIndex } = req.query;
    
    // Parse pagination params with defaults
    const pageSizeNum = pageSize ? parseInt(pageSize as string, 10) : 10;
    const pageIndexNum = pageIndex ? parseInt(pageIndex as string, 10) : 0;
    const offset = pageIndexNum * pageSizeNum;
    
    // Get total count
    const countResults = await query<any[]>(
      'SELECT COUNT(*) as total FROM equipment'
    );
    const total = countResults[0]?.total || 0;
    
    // Get paginated data with JOIN to get user name
    // Note: LIMIT and OFFSET cannot use placeholders in MySQL, so we inject the values directly
    // but we've already validated them as numbers above
    const results = await query<any[]>(
      `SELECT 
        e.*,
        u.name as current_user_name
      FROM equipment e
      LEFT JOIN users u ON e.current_user_id = u.id
      ORDER BY e.created_at DESC LIMIT ${pageSizeNum} OFFSET ${offset}`
    );
    
    res.json({
      data: results,
      total,
      pageIndex: pageIndexNum,
      pageSize: pageSizeNum,
    });
  } catch (error: any) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách thiết bị' });
  }
};

export const getEquipmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const results = await query<any[]>(
      `SELECT 
        e.*,
        u.name as current_user_name
      FROM equipment e
      LEFT JOIN users u ON e.current_user_id = u.id
      WHERE e.id = ?`,
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
    
    // Validate required fields
    if (!equipmentData.code || !equipmentData.name || !equipmentData.type || !equipmentData.brand || !equipmentData.model || !equipmentData.serialNumber || !equipmentData.purchaseDate) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
    }
    
    // Validate type enum
    const validTypes = ['excavator', 'crane', 'truck', 'concrete_mixer', 'generator', 'other'];
    if (!validTypes.includes(equipmentData.type)) {
      return res.status(400).json({ error: 'Loại thiết bị không hợp lệ' });
    }
    
    // Validate status enum
    const validStatuses = ['available', 'in_use', 'maintenance', 'broken'];
    if (equipmentData.status && !validStatuses.includes(equipmentData.status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }
    
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
        equipmentData.currentUserId || null,
        equipmentData.lastMaintenanceDate ? toMySQLDate(equipmentData.lastMaintenanceDate) : null,
        equipmentData.nextMaintenanceDate ? toMySQLDate(equipmentData.nextMaintenanceDate) : null,
        equipmentData.totalHours || 0,
        createdAt,
        createdAt,
      ]
    );
    
    const newEquipment = await query<any[]>(
      `SELECT 
        e.*,
        u.name as current_user_name
      FROM equipment e
      LEFT JOIN users u ON e.current_user_id = u.id
      WHERE e.id = ?`,
      [id]
    );
    
    res.status(201).json(newEquipment[0]);
  } catch (error: any) {
    console.error('Error creating equipment:', error);
    console.error('Request data:', req.body);
    
    // Handle database constraint errors
    if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('Duplicate entry')) {
      return res.status(400).json({ error: 'Mã thiết bị đã tồn tại' });
    }
    
    // Handle foreign key constraint errors
    if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.message?.includes('foreign key constraint')) {
      return res.status(400).json({ error: 'Dự án hoặc người dùng không tồn tại' });
    }
    
    res.status(500).json({ 
      error: 'Không thể tạo thiết bị',
      message: error.message 
    });
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
        equipmentData.currentUserId || null,
        equipmentData.lastMaintenanceDate ? toMySQLDate(equipmentData.lastMaintenanceDate) : null,
        equipmentData.nextMaintenanceDate ? toMySQLDate(equipmentData.nextMaintenanceDate) : null,
        equipmentData.totalHours,
        updatedAt,
        id,
      ]
    );
    
    const updated = await query<any[]>(
      `SELECT 
        e.*,
        u.name as current_user_name
      FROM equipment e
      LEFT JOIN users u ON e.current_user_id = u.id
      WHERE e.id = ?`,
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
    const { equipmentId, pageSize, pageIndex } = req.query;
    
    // Parse pagination params with defaults
    const pageSizeNum = pageSize ? parseInt(pageSize as string, 10) : 10;
    const pageIndexNum = pageIndex ? parseInt(pageIndex as string, 10) : 0;
    const offset = pageIndexNum * pageSizeNum;
    
    // Build WHERE clause
    let whereClause = '';
    let params: any[] = [];
    
    if (equipmentId) {
      whereClause = 'WHERE eu.equipment_id = ?';
      params.push(equipmentId as string);
    }
    
    // Get total count
    const countSql = equipmentId 
      ? 'SELECT COUNT(*) as total FROM equipment_usage WHERE equipment_id = ?'
      : 'SELECT COUNT(*) as total FROM equipment_usage';
    const countResults = await query<any[]>(countSql, equipmentId ? [equipmentId] : []);
    const total = countResults[0]?.total || 0;
    
    // Get paginated data with JOIN to get user name
    const sql = `SELECT 
      eu.*,
      u.name as user_name
    FROM equipment_usage eu
    LEFT JOIN users u ON eu.user_id = u.id
    ${whereClause}
    ORDER BY eu.start_time DESC LIMIT ${pageSizeNum} OFFSET ${offset}`;
    
    const results = await query<any[]>(sql, params);
    
    res.json({
      data: results,
      total,
      pageIndex: pageIndexNum,
      pageSize: pageSizeNum,
    });
  } catch (error: any) {
    console.error('Error fetching usage:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách sử dụng' });
  }
};

export const createUsage = async (req: AuthRequest, res: Response) => {
  try {
    const usageData = req.body;
    
    // Validate required fields
    if (!usageData.equipmentId || !usageData.startTime) {
      return res.status(400).json({ error: 'Thiết bị và thời gian bắt đầu là bắt buộc' });
    }
    
    // Get equipment name
    const equipment = await query<any[]>(
      'SELECT name FROM equipment WHERE id = ?',
      [usageData.equipmentId]
    );
    if (equipment.length === 0) {
      return res.status(404).json({ error: 'Thiết bị không tồn tại' });
    }
    const equipmentName = equipment[0].name;
    
    // Get project name if projectId provided
    let projectName = null;
    if (usageData.projectId) {
      const project = await query<any[]>(
        'SELECT name FROM projects WHERE id = ?',
        [usageData.projectId]
      );
      if (project.length > 0) {
        projectName = project[0].name;
      }
    }
    
    // Use userId from JWT or from request body
    const userId = req.userId || usageData.userId;
    if (!userId) {
      return res.status(400).json({ error: 'Người sử dụng là bắt buộc' });
    }
    
    // Get user name
    const user = await query<any[]>(
      'SELECT name FROM users WHERE id = ?',
      [userId]
    );
    const userName = user.length > 0 ? user[0].name : null;
    
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
        equipmentName,
        usageData.projectId || null,
        projectName,
        userId,
        userName,
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
      ['in_use', usageData.projectId || null, userId, usageData.equipmentId]
    );
    
    const newUsage = await query<any[]>(
      `SELECT 
        eu.*,
        u.name as user_name
      FROM equipment_usage eu
      LEFT JOIN users u ON eu.user_id = u.id
      WHERE eu.id = ?`,
      [id]
    );
    
    res.status(201).json(newUsage[0]);
  } catch (error: any) {
    console.error('Error creating usage:', error);
    res.status(500).json({ error: 'Không thể tạo bản ghi sử dụng' });
  }
};

export const getUsageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const results = await query<any[]>(
      `SELECT 
        eu.*,
        u.name as user_name
      FROM equipment_usage eu
      LEFT JOIN users u ON eu.user_id = u.id
      WHERE eu.id = ?`,
      [id]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy bản ghi sử dụng' });
    }
    
    res.json(results[0]);
  } catch (error: any) {
    console.error('Error fetching usage:', error);
    res.status(500).json({ error: 'Không thể lấy bản ghi sử dụng' });
  }
};

export const updateUsage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const usageData = req.body;
    
    // Check if exists
    const existing = await query<any[]>(
      'SELECT * FROM equipment_usage WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy bản ghi sử dụng' });
    }
    
    // Get equipment name if equipmentId changed
    let equipmentName = existing[0].equipment_name;
    if (usageData.equipmentId && usageData.equipmentId !== existing[0].equipment_id) {
      const equipment = await query<any[]>(
        'SELECT name FROM equipment WHERE id = ?',
        [usageData.equipmentId]
      );
      if (equipment.length === 0) {
        return res.status(404).json({ error: 'Thiết bị không tồn tại' });
      }
      equipmentName = equipment[0].name;
    }
    
    // Get project name if projectId provided
    let projectName = existing[0].project_name;
    if (usageData.projectId) {
      const project = await query<any[]>(
        'SELECT name FROM projects WHERE id = ?',
        [usageData.projectId]
      );
      if (project.length > 0) {
        projectName = project[0].name;
      }
    }
    
    // Use userId from JWT or from request body or keep existing
    const userId = req.userId || usageData.userId || existing[0].user_id;
    
    // Get user name
    const user = await query<any[]>(
      'SELECT name FROM users WHERE id = ?',
      [userId]
    );
    const userName = user.length > 0 ? user[0].name : null;
    
    await query(
      `UPDATE equipment_usage SET
        equipment_id = ?, equipment_name = ?, project_id = ?, project_name = ?,
        user_id = ?, user_name = ?, start_time = ?, end_time = ?,
        fuel_consumption = ?, notes = ?
      WHERE id = ?`,
      [
        usageData.equipmentId || existing[0].equipment_id,
        equipmentName,
        usageData.projectId || existing[0].project_id,
        projectName,
        userId,
        userName,
        usageData.startTime ? toMySQLDateTime(usageData.startTime) : existing[0].start_time,
        usageData.endTime ? toMySQLDateTime(usageData.endTime) : existing[0].end_time,
        usageData.fuelConsumption !== undefined ? usageData.fuelConsumption : existing[0].fuel_consumption,
        usageData.notes !== undefined ? usageData.notes : existing[0].notes,
        id,
      ]
    );
    
    const updatedUsage = await query<any[]>(
      `SELECT 
        eu.*,
        u.name as user_name
      FROM equipment_usage eu
      LEFT JOIN users u ON eu.user_id = u.id
      WHERE eu.id = ?`,
      [id]
    );
    
    res.json(updatedUsage[0]);
  } catch (error: any) {
    console.error('Error updating usage:', error);
    res.status(500).json({ error: 'Không thể cập nhật bản ghi sử dụng' });
  }
};

export const deleteUsage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if exists
    const existing = await query<any[]>(
      'SELECT * FROM equipment_usage WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy bản ghi sử dụng' });
    }
    
    await query('DELETE FROM equipment_usage WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting usage:', error);
    res.status(500).json({ error: 'Không thể xóa bản ghi sử dụng' });
  }
};

export const getMaintenanceSchedules = async (req: Request, res: Response) => {
  try {
    const { equipmentId, pageSize, pageIndex } = req.query;
    
    // Parse pagination params with defaults
    const pageSizeNum = pageSize ? parseInt(pageSize as string, 10) : 10;
    const pageIndexNum = pageIndex ? parseInt(pageIndex as string, 10) : 0;
    const offset = pageIndexNum * pageSizeNum;
    
    // Build WHERE clause
    let whereClause = '';
    let params: any[] = [];
    
    if (equipmentId) {
      whereClause = 'WHERE ms.equipment_id = ?';
      params.push(equipmentId as string);
    }
    
    // Get total count
    const countSql = equipmentId 
      ? 'SELECT COUNT(*) as total FROM maintenance_schedules WHERE equipment_id = ?'
      : 'SELECT COUNT(*) as total FROM maintenance_schedules';
    const countResults = await query<any[]>(countSql, equipmentId ? [equipmentId] : []);
    const total = countResults[0]?.total || 0;
    
    // Get paginated data
    const sql = `SELECT 
      ms.*
    FROM maintenance_schedules ms
    ${whereClause}
    ORDER BY ms.scheduled_date DESC LIMIT ${pageSizeNum} OFFSET ${offset}`;
    
    const results = await query<any[]>(sql, params);
    
    res.json({
      data: results,
      total,
      pageIndex: pageIndexNum,
      pageSize: pageSizeNum,
    });
  } catch (error: any) {
    console.error('Error fetching maintenance schedules:', error);
    res.status(500).json({ error: 'Không thể lấy danh sách lịch bảo trì' });
  }
};

export const createMaintenanceSchedule = async (req: Request, res: Response) => {
  try {
    const scheduleData = req.body;
    
    // Validate required fields
    if (!scheduleData.equipmentId || !scheduleData.scheduledDate || !scheduleData.description) {
      return res.status(400).json({ error: 'Thiết bị, ngày lên lịch và mô tả là bắt buộc' });
    }
    
    // Get equipment name
    const equipment = await query<any[]>(
      'SELECT name FROM equipment WHERE id = ?',
      [scheduleData.equipmentId]
    );
    if (equipment.length === 0) {
      return res.status(404).json({ error: 'Thiết bị không tồn tại' });
    }
    const equipmentName = equipment[0].name;
    
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
        equipmentName,
        scheduleData.type || 'routine',
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

export const getMaintenanceScheduleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const results = await query<any[]>(
      'SELECT * FROM maintenance_schedules WHERE id = ?',
      [id]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy lịch bảo trì' });
    }
    
    res.json(results[0]);
  } catch (error: any) {
    console.error('Error fetching maintenance schedule:', error);
    res.status(500).json({ error: 'Không thể lấy lịch bảo trì' });
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
    
    // Get equipment name if equipmentId changed
    let equipmentName = existing[0].equipment_name;
    if (scheduleData.equipmentId && scheduleData.equipmentId !== existing[0].equipment_id) {
      const equipment = await query<any[]>(
        'SELECT name FROM equipment WHERE id = ?',
        [scheduleData.equipmentId]
      );
      if (equipment.length === 0) {
        return res.status(404).json({ error: 'Thiết bị không tồn tại' });
      }
      equipmentName = equipment[0].name;
    }
    
    await query(
      `UPDATE maintenance_schedules SET
        equipment_id = ?, equipment_name = ?, type = ?, scheduled_date = ?,
        completed_date = ?, status = ?, description = ?, cost = ?,
        technician = ?, updated_at = ?
      WHERE id = ?`,
      [
        scheduleData.equipmentId || existing[0].equipment_id,
        equipmentName,
        scheduleData.type || existing[0].type,
        scheduleData.scheduledDate ? toMySQLDate(scheduleData.scheduledDate) : existing[0].scheduled_date,
        scheduleData.completedDate ? toMySQLDate(scheduleData.completedDate) : existing[0].completed_date,
        scheduleData.status || existing[0].status,
        scheduleData.description !== undefined ? scheduleData.description : existing[0].description,
        scheduleData.cost !== undefined ? scheduleData.cost : existing[0].cost,
        scheduleData.technician !== undefined ? scheduleData.technician : existing[0].technician,
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

export const deleteMaintenanceSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if exists
    const existing = await query<any[]>(
      'SELECT * FROM maintenance_schedules WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy lịch bảo trì' });
    }
    
    await query('DELETE FROM maintenance_schedules WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting maintenance schedule:', error);
    res.status(500).json({ error: 'Không thể xóa lịch bảo trì' });
  }
};
